import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=['index.ts','components.tsx','components.css','tokens.css','icons.tsx'];
const item={
  $schema:'https://ui.shadcn.com/schema/registry-item.json',
  name:'starlight-living',type:'registry:ui',title:'Starlight Living Library',
  description:'Source-owned reference components, three material themes and original Signal icons. Review candidate.',
  files:await Promise.all(sources.map(async name=>({path:`src/${name}`,type:name.endsWith('.css')?'registry:file':'registry:ui',target:`@ui/starlight/${name}`,content:await readFile(path.join(root,'src',name),'utf8')}))),
};
await mkdir(path.join(root,'public','r'),{recursive:true});
await writeFile(path.join(root,'public','r','starlight-living.json'),JSON.stringify(item,null,2)+'\n');
await writeFile(path.join(root,'registry.json'),JSON.stringify({$schema:'https://ui.shadcn.com/schema/registry.json',name:'starlight-living-lab',homepage:'https://github.com/Starlight-Intelligence/starlight-design-intelligence',items:[{...item,files:item.files.map(({content,...f})=>f)}]},null,2)+'\n');
await mkdir(path.join(root,'public','icons'),{recursive:true});
const {readdir}=await import('node:fs/promises');
for(const name of await readdir(path.join(root,'assets','icons')))if(name.endsWith('.svg'))await copyFile(path.join(root,'assets','icons',name),path.join(root,'public','icons',name));
console.log(`Built one registry item with ${item.files.length} source files and 24 downloadable icons.`);
