#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const livingSkills=['design-character-lineage','compose-agent-identity','design-companion-journey','visualize-agent-team','bind-character-runtime','review-living-design'];
export const projectSkill=text=>text.replaceAll('../../plugins/starlight-living-design/assets/','../../assets/');
export function sync(check=false){
  for(const name of livingSkills)for(const file of ['SKILL.md','agents/openai.yaml']){
    const source=path.join(root,'skills',name,file),target=path.join(root,'plugins/starlight-living-design/skills',name,file);
    const content=file==='SKILL.md'?projectSkill(fs.readFileSync(source,'utf8')):fs.readFileSync(source,'utf8');
    if(check){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==content)throw new Error('Package skill drift: '+name+'/'+file);}
    else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);}
  }
  return {ok:true,skills:livingSkills.length,mode:check?'check':'sync'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.slice(2).some(x=>x!=='--check'))throw new Error('Usage: sync-living-design-skills.mjs [--check]');
  console.log(JSON.stringify(sync(process.argv.includes('--check'))));
}
