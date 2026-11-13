import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {sourceProvenance} from './source-provenance.mjs';
const root=path.resolve(import.meta.dirname,'..');
// A real assembler output grounds fixture coverage, instead of copying the validator's list.
async function fixture(){
  const dir=await mkdtemp(path.join(tmpdir(),'foundry-source-'));
  const {execFileSync}=await import('node:child_process');
  let names;
  try{execFileSync('git',['ls-files','--error-unmatch','package.json'],{cwd:root,stdio:'ignore'});names=execFileSync('git',['ls-files','-z','.'],{cwd:root}).toString().split('\0').filter(Boolean);}
  catch{names=JSON.parse(await readFile(path.join(root,'RELEASE-MANIFEST.json'),'utf8')).files.map(x=>x.path).filter(x=>!x.startsWith('release/'));}
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
