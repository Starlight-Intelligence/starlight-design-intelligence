import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
execFileSync('python',['-c',"from PIL import Image; Image.open('outputs/form-a.png').resize((960,540)).save('outputs/fallback.webp',quality=85)"]);
await build({entryPoints:['web/main.mjs'],bundle:true,format:'esm',target:'es2022',minify:true,outfile:'outputs/web.bundle.js'});
const html=fs.readFileSync('web/template.html','utf8').replace('__FALLBACK__','data:image/webp;base64,'+fs.readFileSync('outputs/fallback.webp').toString('base64')).replace('__GLB__',fs.readFileSync('outputs/seed-bloom.glb').toString('base64')).replace('__BUNDLE__',()=>fs.readFileSync('outputs/web.bundle.js','utf8').replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync('outputs/Starlight-Transformation-Lab.html',html);
console.log(JSON.stringify({bytes:Buffer.byteLength(html),output:'outputs/Starlight-Transformation-Lab.html'}));
