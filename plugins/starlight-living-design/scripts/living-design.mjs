#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {profileFiles,zipStore} from './profile-export.mjs';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const defaultBundle = path.join(pluginRoot, 'assets/living-design');
const common = ['kind','id','name','version','status'];
const fields = {
  family: ['parent_ids','materials','palette','description','environment'],
  character: ['family_id','agent_id','design_id','soul_id','personality_id','classification','source_status'],
  agent: ['character_id','owner','job','skill_ids','playbook_ids','connector_ids','requested_actions','runtime_ref','registration_state'],
  design: ['character_id','primary_family_id','mixin_family_ids','form','recognition_anchors','silhouette_min_px','portrait_min_px'],
  soul: ['character_id','values','purpose','behavioral_boundary'],
  personality: ['character_id','tone','example_phrase','verbosity'],
  skill: ['plugin_skill'],
  playbook: ['skill_ids','stop_conditions'],
  connector: ['state','declared_actions','credential_ref'],
  team: ['member_ids','owner','workflow_owner']
};
const arrays = new Set(['parent_ids','materials','palette','skill_ids','playbook_ids','connector_ids','requested_actions','mixin_family_ids','recognition_anchors','values','stop_conditions','declared_actions','member_ids']);
const refs = {family_id:'family',agent_id:'agent',design_id:'design',soul_id:'soul',personality_id:'personality',character_id:'character',primary_family_id:'family',parent_ids:'family',mixin_family_ids:'family',skill_ids:'skill',playbook_ids:'playbook',connector_ids:'connector',member_ids:'character'};
const digest = s => crypto.createHash('sha256').update(s).digest('hex');
function fail(s) { throw new Error(s); }
function collect(root, dir=root) {
  if(fs.lstatSync(dir).isSymbolicLink()) fail('Symlink forbidden: '+dir);
  return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>{
    const p=path.join(dir,e.name);
    if(e.isSymbolicLink()) fail('Symlink forbidden: '+p);
    return e.isDirectory()?collect(root,p):e.isFile()&&e.name.endsWith('.md')?[p]:[];
  });
}
export function readContracts(bundle=defaultBundle) {
  const root=path.resolve(bundle);
  // Inspect lexical ancestors before resolving; canonicalization alone would hide symlinks.
  for(let p=root;;p=path.dirname(p)){if(fs.lstatSync(p).isSymbolicLink())fail('Symlink forbidden: '+p);if(p===path.dirname(p))break;}
  const dir=path.join(root,'contracts');
  const files=collect(dir); if(!files.length) fail('No contracts');
  if(files.length>1000) fail('Contract count exceeds 1000');
  return files.map(p=>{
    if(fs.statSync(p).size>262144) fail('Contract exceeds 256 KiB');
    const raw=fs.readFileSync(p,'utf8');
    const m=/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/.exec(raw);
    if(!m) fail('Missing frontmatter or body: '+p);
    let data;try{data=JSON.parse(m[1]);}catch{fail('Use JSON-object frontmatter (YAML subset): '+p);}
    return {data,body:m[2],raw,source:path.relative(root,p).split(path.sep).join('/'),sha256:digest(raw)};
  });
}
export function compile(records) {
  const byId=new Map();
  for(const r of records){
    const d=r.data;
    if(!d||Array.isArray(d)||typeof d!=='object'||!Object.hasOwn(fields,d.kind)) fail('Unknown contract kind');
    if(typeof d.id!=='string'||!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(d.id)) fail('Invalid stable id');
    if(byId.has(d.id)) fail('Duplicate id: '+d.id);
    const allowed=new Set([...common,...fields[d.kind]]);
    for(const [k,v] of Object.entries(d)){
      if(!allowed.has(k)) fail('Unsupported field '+k+' in '+d.id);
      if(arrays.has(k)){
        if(!Array.isArray(v)||v.some(x=>typeof x!=='string'||!x.trim())||new Set(v).size!==v.length) fail('Invalid or duplicate list: '+k);
      }else if(['runtime_ref','credential_ref'].includes(k)){
        if(v!==null) fail('Recipe cannot declare runtime or credentials: '+d.id);
      }else if(['silhouette_min_px','portrait_min_px'].includes(k)){
        if(!Number.isInteger(v)||v<16||v>4096) fail('Invalid pixel size');
      }else if(typeof v!=='string'||!v.trim()) fail('Expected nonempty text: '+k);
    }
    for(const k of ['id','kind','status',...fields[d.kind]]) if(!Object.hasOwn(d,k)) fail('Missing '+k+' in '+d.id);
    if(['family','character','agent','skill','playbook','connector','team'].includes(d.kind)&&!d.name)fail('Missing name: '+d.id);
    if(['family','character','agent','design','soul','personality','playbook'].includes(d.kind)&&d.status!=='proposal')fail('Candidate cannot self-promote: '+d.id);
    if(d.kind==='agent'&&(d.registration_state!=='example-only'||d.requested_actions.some(x=>!['read','draft'].includes(x)))) fail('Agent recipe grants executable authority');
    if(d.kind==='connector'&&(d.state!=='requires-host-connection'||d.status!=='definition-only'||d.declared_actions.some(x=>!['read','draft'].includes(x)))) fail('Connector cannot assert connection or authority');
    if(d.kind==='character'&&!['role-avatar','companion-candidate'].includes(d.classification)) fail('Invalid character classification');
    if(d.kind==='family'&&d.palette.some(x=>!/^#[0-9a-f]{6}$/i.test(x)))fail('Invalid palette');
    byId.set(d.id,r);
  }
  for(const {data:d} of records)for(const [key,kind] of Object.entries(refs))if(Object.hasOwn(d,key))for(const id of Array.isArray(d[key])?d[key]:[d[key]]){
    if(byId.get(id)?.data.kind!==kind) fail('Unresolved '+kind+' reference '+id+' from '+d.id);
  }
  const families=records.filter(r=>r.data.kind==='family').map(r=>r.data);
  const visiting=new Set(),done=new Set();
  function visit(id){if(visiting.has(id))fail('Cyclic design ancestry');if(done.has(id))return;visiting.add(id);for(const p of byId.get(id).data.parent_ids)visit(p);visiting.delete(id);done.add(id);}
  families.forEach(f=>visit(f.id));
  const rawChars=records.filter(r=>r.data.kind==='character').map(r=>r.data);
  for(const c of rawChars){
    for(const key of ['agent_id','design_id','soul_id','personality_id'])if(byId.get(c[key]).data.character_id!==c.id)fail('Cross-character binding: '+key);
    if(byId.get(c.design_id).data.primary_family_id!==c.family_id)fail('Primary family mismatch');
    const d=byId.get(c.design_id).data;
    if(d.mixin_family_ids.includes(d.primary_family_id)||d.mixin_family_ids.length>2)fail('Invalid family fusion');
    const a=byId.get(c.agent_id).data;
    for(const id of a.connector_ids){const connector=byId.get(id).data;if(a.requested_actions.some(x=>!connector.declared_actions.includes(x)))fail('Action exceeds connector declaration');}
  }
  const characters=rawChars.map(c=>{
    const a=byId.get(c.agent_id).data,d=byId.get(c.design_id).data,p=byId.get(c.personality_id).data;
    return {...c,state:'candidate',form:d.form,profession:a.name,personality:p.tone,example_phrase:p.example_phrase,job:a.job,skill_ids:a.skill_ids,playbook_ids:a.playbook_ids,connector_ids:a.connector_ids,runtime_state:'not-connected',source_path:byId.get(c.id).source};
  });
  const group=kind=>records.filter(r=>r.data.kind===kind).map(r=>r.data).sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const edges=[];
  for(const {data:d} of records){for(const [k]of Object.entries(refs))if(Object.hasOwn(d,k))for(const id of Array.isArray(d[k])?d[k]:[d[k]])edges.push({source:d.id,target:id,type:k});}
  const sources=records.map(({data,source,sha256})=>({id:data.id,path:source,sha256})).sort((a,b)=>a.path.localeCompare(b.path,'en'));
  const contracts=records.map(r=>({id:r.data.id,path:r.source,sha256:r.sha256,markdown:r.raw})).sort((a,b)=>a.id.localeCompare(b.id,'en'));
  return {meta:{schema:'starlight.living-design.catalog.v1',version:'0.1.0',release_state:'proposal',source_digest:digest(JSON.stringify(sources)),runtime_connected:false},families:families.sort((a,b)=>a.id.localeCompare(b.id,'en')),characters:characters.sort((a,b)=>a.id.localeCompare(b.id,'en')),skills:group('skill'),playbooks:group('playbook'),connectors:group('connector'),teams:group('team'),agents:group('agent'),edges:edges.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en')),sources,contracts};
}
export function inspect(id,bundle=defaultBundle){const records=readContracts(bundle),catalog=compile(records);const c=catalog.characters.find(c=>c.id===id);if(!c)fail('Unknown character: '+id);return {character:c,contracts:records.filter(r=>[c.id,c.agent_id,c.design_id,c.soul_id,c.personality_id].includes(r.data.id))};}
export function loadReferenceArt(bundle=defaultBundle){
  const root=path.resolve(bundle), index=path.join(root,'private-reference-index.json');
  if(!fs.existsSync(index))return {};
  for(let p=index;;p=path.dirname(p)){if(fs.lstatSync(p).isSymbolicLink())fail('Symlink forbidden: '+p);if(p===path.dirname(p))break;}
  const entries=JSON.parse(fs.readFileSync(index,'utf8')); const art={};
  if(!Array.isArray(entries)||entries.length>4)fail('Invalid private reference index');
  for(const e of entries){
    if(!e||!['PORCELAIN','NOBLE','TIDE','GARDEN'].includes(e.slot)||Object.hasOwn(art,e.slot)||typeof e.path!=='string'||!/^reference-art\/[a-z0-9-]+\.png$/.test(e.path)||!/^[a-f0-9]{64}$/.test(e.sha256))fail('Invalid private reference entry');
    const file=path.join(root,e.path);
    for(let p=file;p!==root;p=path.dirname(p))if(fs.lstatSync(p).isSymbolicLink())fail('Symlink forbidden: '+p);
    const size=fs.statSync(file).size;if(size>12582912)fail('Reference image exceeds 12 MiB');
    const bytes=fs.readFileSync(file);
    if(!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||digest(bytes)!==e.sha256)fail('Reference image hash or format mismatch');
    art[e.slot]='data:image/png;base64,'+bytes.toString('base64');
  }
  return art;
}
export function renderAtlas(catalog,template,art={}){
  const replacements={__CATALOG_JSON__:JSON.stringify(catalog).replace(/</g,'\\u003c'),__PROFILE_EXPORT_JS__:profileFiles.toString()+'\n'+zipStore.toString()};
  return template.replace(/__CATALOG_JSON__|__PROFILE_EXPORT_JS__|__ART_(PORCELAIN|NOBLE|TIDE|GARDEN)__/g,(marker,slot)=>slot?(art[slot]||''):replacements[marker]);
}
export function build(bundle,out){
  const records=readContracts(bundle),catalog=compile(records);const target=path.resolve(out);
  if(fs.existsSync(target))fail('Output exists; choose a new directory');
  if(target===path.resolve(bundle)||target.startsWith(path.resolve(bundle)+path.sep))fail('Output cannot be inside source bundle');
  for(let p=path.dirname(target);;p=path.dirname(p)){if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())fail('Symlink forbidden: '+p);if(p===path.dirname(p))break;}
  const template=fs.readFileSync(path.join(pluginRoot,'assets/atlas.html'),'utf8');
  const html=renderAtlas(catalog,template,loadReferenceArt(bundle));
  fs.mkdirSync(target,{recursive:true});
  fs.writeFileSync(path.join(target,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
  fs.writeFileSync(path.join(target,'atlas.html'),html);
  for(const r of records){const dst=path.join(target,r.source);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(bundle,r.source),dst);}
  return {ok:true,out:target,characters:catalog.characters.length,contracts:records.length,source_digest:catalog.meta.source_digest};
}
export function main(argv){
  const [command,...args]=argv;
  if(command==='validate'&&args.length<=1){const c=compile(readContracts(args[0]||defaultBundle));return {ok:true,characters:c.characters.length,families:c.families.length,source_digest:c.meta.source_digest};}
  if(command==='inspect'&&args.length>=1&&args.length<=2)return inspect(args[0],args[1]||defaultBundle);
  if(command==='build'){
    const ix=args.indexOf('--out');
    if(!((ix===0&&args.length===2)||(ix===1&&args.length===3))||!args[ix+1]||args[ix+1].startsWith('--')) fail('Usage: build [bundle-dir] --out NEW_DIRECTORY');
    return build(ix===1?args[0]:defaultBundle,args[ix+1]);
  }
  fail('Usage: validate [bundle-dir] | inspect CHARACTER_ID [bundle-dir] | build [bundle-dir] --out NEW_DIRECTORY');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2));}catch(e){console.error(JSON.stringify({ok:false,error:e.message}));process.exitCode=1;}
}
