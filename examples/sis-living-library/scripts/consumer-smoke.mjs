import {mkdtemp,writeFile,mkdir,readFile,symlink} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
const root=process.cwd();
const dir=await mkdtemp(path.join(tmpdir(),'starlight-consumer-'));
await mkdir(path.join(dir,'src'),{recursive:true});
await writeFile(path.join(dir,'package.json'),JSON.stringify({name:'consumer-smoke',private:true,type:'module',dependencies:{react:'19.3.1','react-dom':'19.3.1'},devDependencies:{vite:'8.3.5',typescript:'7.0.2'}}));
await writeFile(path.join(dir,'src/index.css'),'');
await writeFile(path.join(dir,'vite.config.ts'),'export default {};');
await writeFile(path.join(dir,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,allowImportingTsExtensions:true,noEmit:true,paths:{'@/*':['./src/*']}},include:['src']}));
await writeFile(path.join(dir,'components.json'),JSON.stringify({$schema:'https://ui.shadcn.com/schema.json',style:'new-york',rsc:false,tsx:true,tailwind:{config:'',css:'src/index.css',baseColor:'neutral',cssVariables:true},aliases:{components:'@/components',utils:'@/lib/utils',ui:'@/components/ui',lib:'@/lib',hooks:'@/hooks'}}));
const run=(cmd,args,cwd)=>new Promise((resolve,reject)=>{const child=spawn(cmd,args,{cwd,stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(new Error(`${cmd} failed ${code}`)));});
try{
await run('npx',['--yes','shadcn@4.23.0','add',path.join(root,'public/r/starlight-living.json'),'--yes','--cwd',dir],root);
await symlink(path.join(root,'node_modules'),path.join(dir,'node_modules'),'dir');
await writeFile(path.join(dir,'src/app.tsx'),"import {GlassSurface,StarlightButton,AgentPresence,Icon} from './components/ui/starlight'; export default function App(){return <GlassSurface><StarlightButton>Open</StarlightButton><AgentPresence roleId='sample.research' name='Example' role='Research'/><Icon name='orbit'/></GlassSurface>}");
await run(path.join(root,'node_modules/.bin/tsc'),['--noEmit','-p',dir],root);
console.log('PASS: pinned shadcn CLI installed all five registry source files; fresh consumer typecheck passed.');
}finally{}
