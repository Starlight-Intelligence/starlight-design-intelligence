import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {buildContract,validateContract} from './component-contract.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJSON=async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
const source=await readJSON('contracts/components.json');
test('agent contract rejects authority escalation, traversal and malformed exports',()=>{
  for(const mutate of [c=>c.authority.filesystem=true,c=>c.authority.deployment=true,c=>c.package.published=true,c=>c.components[0].source='../secrets',c=>c.components[1].id=c.components[0].id,c=>c.components[0].install.styles='https://other.invalid/style.css',c=>c.components[0].props.material.values=[]]){const c=structuredClone(source);mutate(c);assert.throws(()=>validateContract(c));}
});
test('registry metadata rejects disguised commands and malformed prop domains',()=>{
  const attacks=[
    c=>{c.package.name='../../owned';for(const item of c.components){item.install.package=c.package.name;item.install.styles=c.package.name+'/styles.css';}},
    c=>c.package.artifact='../owned.tgz',c=>c.package.shell='run',c=>c.package.peers.react={shell:'run'},
    c=>c.authority.shell=true,c=>delete c.authority.execution,c=>c.shell='run',
    c=>c.components[0].props.material.values=[{shell:'run'}],
    c=>c.components[0].props.material.values=['solid','solid'],
    c=>c.components[0].props.material.default='unlisted',
    c=>c.components[0].props.material.default={shell:'run'},
    c=>c.components[0].props.material.shell='run',
    c=>c.components[0].props.material.required='true',
    c=>c.components[0].props.material.type={shell:'run'},
    c=>c.components[0].props.material.type='shell',
    c=>c.components[0].nativeAttributes='true',c=>delete c.components[0].nativeAttributes,
    c=>c.components[0].install.shell='run',c=>c.components[0].constraints=[{shell:'run'}],
    c=>c.components[1].props.loading.default='false',
    c=>c.components[1].props.loading.values=['false'],
    c=>c.components[11].props.max.default=Infinity,
    c=>c.verification.typecheckCommand='sh -c run',c=>c.tokenExport.path='../tokens.json',
  ];
  for(const attack of attacks){const contract=structuredClone(source);attack(contract);assert.throws(()=>validateContract(contract));}
  assert.equal(validateContract(structuredClone(source)).components[1].props.loading.default,false);
});
test('manifest source hashes bind all components to actual bytes',async()=>{
  const built=await buildContract(root);assert.equal(built.components.length,19);
  for(const f of built.sourceFiles){const bytes=await fs.readFile(path.join(root,f.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(bytes.length,f.bytes);}
});
test('all discovery examples compile against the real component API',async()=>{
  const file=path.join(root,'src/__contract-check.tsx');
  try{await fs.writeFile(file,`import {${source.components.map(c=>c.export).join(',')}} from './index';\nexport const examples = <>${source.components.map(c=>c.example).join('\n')}</>;\n`);execFileSync(path.join(root,'node_modules/.bin/tsc'),['--noEmit','--project','tsconfig.json'],{cwd:root,stdio:'pipe'});}
  finally{await fs.rm(file,{force:true});}
});
test('clean package is reproducible and every archive entry matches the receipt',async()=>{
  const run=()=>execFileSync(process.execPath,['scripts/package-release.mjs'],{cwd:root,stdio:'pipe'});
  run();const first=await readJSON('release/package-receipt.json');
  // Deliberately inject stale output; a second build must remove it.
  await fs.writeFile(path.join(root,'release/package/stale-private-file.js'),'must not ship');run();
  const second=await readJSON('release/package-receipt.json');assert.equal(first.sha256,second.sha256);assert.deepEqual(first.files,second.files);
  const tar=gunzipSync(await fs.readFile(path.join(root,'release',second.file)));const entries=new Map();
  for(let offset=0;offset+512<=tar.length;){const header=tar.subarray(offset,offset+512);if(header.every(b=>b===0))break;const name=header.subarray(0,100).toString().replace(/\0.*$/s,'');const size=parseInt(header.subarray(124,136).toString().replace(/\0.*$/s,'').trim(),8)||0;assert.equal(String.fromCharCode(header[156]),'0','Only regular files may ship');entries.set(name.replace(/^package\//,''),tar.subarray(offset+512,offset+512+size));offset+=512+Math.ceil(size/512)*512;}
  assert.equal(entries.size,second.files.length);
  for(const file of second.files){assert(entries.has(file.path));const bytes=entries.get(file.path);assert.equal(bytes.length,file.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
  assert.deepEqual(entries.get('tokens.json'),await fs.readFile(path.join(root,'tokens/tokens.json')));
  const pkg=JSON.parse(entries.get('package.json'));for(const target of Object.values(pkg.exports)){for(const file of typeof target==='string'?[target]:Object.values(target))assert(entries.has(file.replace(/^\.\//,'')));}
  assert.equal(JSON.parse(entries.get('component-contracts.json')).authority.execution,false);
});
