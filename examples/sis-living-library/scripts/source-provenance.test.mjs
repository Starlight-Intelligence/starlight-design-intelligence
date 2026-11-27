import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceProvenance} from './source-provenance.mjs';
const root=path.resolve(import.meta.dirname,'..');
// A real assembler output grounds fixture coverage, instead of copying the validator's list.
async function fixture(){
  const dir=await mkdtemp(path.join(tmpdir(),'foundry-source-'));
  const delivered=await readFile(path.join(root,'RELEASE-MANIFEST.json'),'utf8').catch(error=>{
    if(error.code==='ENOENT')return null;
    throw error;
  });
  const names=delivered===null
    ? execFileSync('git',['ls-files','-z','.'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
    : JSON.parse(delivered).files.map(entry=>entry.path).filter(name=>!name.startsWith('release/'));
  const files=[];
  for(const name of names){const bytes=await readFile(path.join(root,name));await mkdir(path.dirname(path.join(dir,name)),{recursive:true});await writeFile(path.join(dir,name),bytes);files.push({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
  const manifest={schema:'starlight.product_archive.v1',sourceRevision:'a'.repeat(40),sourceDirty:false,files};
  const save=()=>writeFile(path.join(dir,'RELEASE-MANIFEST.json'),JSON.stringify(manifest));await save();
  return{dir,manifest,save,close:()=>rm(dir,{recursive:true,force:true})};
}
test('distributed provenance rejects empty, omitted, duplicate, malformed and tampered inputs',async()=>{
  const f=await fixture();try{
    assert.equal((await sourceProvenance(f.dir)).sourceProvenance,'verified-declared-package-inputs-unsigned');
    const original=structuredClone(f.manifest.files);
    for(const mutate of [()=>[],xs=>xs.filter(x=>x.path!=='src/components.tsx'),xs=>[...xs,xs[0]],xs=>xs.map(x=>x.path==='package.json'?{...x,bytes:-1}:x),xs=>xs.map(x=>x.path==='package.json'?{...x,sha256:'x'}:x)]){
      f.manifest.files=mutate(structuredClone(original));await f.save();await assert.rejects(sourceProvenance(f.dir));
    }
    f.manifest.files=original;await f.save();await writeFile(path.join(f.dir,'src/components.tsx'),'changed');await assert.rejects(sourceProvenance(f.dir),/changed/);
  }finally{await f.close();}
});
test('distributed provenance rejects a linked parent even with matching bytes',async()=>{
  const f=await fixture();const outside=await mkdtemp(path.join(tmpdir(),'foundry-link-'));try{
    const bytes=await readFile(path.join(f.dir,'src/components.tsx'));await writeFile(path.join(outside,'components.tsx'),bytes);
    await rm(path.join(f.dir,'src'),{recursive:true});await symlink(outside,path.join(f.dir,'src'),'dir');
    await assert.rejects(sourceProvenance(f.dir));
  }finally{await f.close();await rm(outside,{recursive:true,force:true});}
});

test('distributed manifest remains authoritative inside a buyer Git checkout',async()=>{
  const f=await fixture();
  try{
    const git=(...args)=>execFileSync('git',args,{cwd:f.dir,encoding:'utf8',stdio:['ignore','pipe','pipe']});
    git('init');
    git('add','.');
    git('-c','user.name=Buyer','-c','user.email=buyer@example.com','-c','commit.gpgsign=false','commit','-m','Import kit');
    assert.notEqual(git('rev-parse','HEAD').trim(),f.manifest.sourceRevision);
    assert.equal((await sourceProvenance(f.dir)).sourceRevision,f.manifest.sourceRevision);
    await writeFile(path.join(f.dir,'src/components.tsx'),'changed');
    await assert.rejects(sourceProvenance(f.dir),/Distributed source changed: src\/components.tsx/);
  }finally{await f.close();}
});

test('Git failures and missing tracked inputs produce distinct errors',async()=>{
  const f=await fixture();
  try{
    await rm(path.join(f.dir,'RELEASE-MANIFEST.json'));
    await assert.rejects(sourceProvenance(f.dir),/git ls-files/);
    execFileSync('git',['init'],{cwd:f.dir,stdio:'ignore'});
    await assert.rejects(sourceProvenance(f.dir),/Untracked source inputs/);
  }finally{await f.close();}
});
