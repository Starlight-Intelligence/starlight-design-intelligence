import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
let html=await fs.readFile(path.join(dist,'index.html'),'utf8');
const jsPath=html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssPath=html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if(!jsPath||!cssPath)throw new Error('Expected one Vite entry script and stylesheet');
const js=await fs.readFile(path.join(dist,jsPath.replace(/^\//,'')),'utf8');
let css=await fs.readFile(path.join(dist,cssPath.replace(/^\//,'')),'utf8');
for(const match of [...css.matchAll(/url\(([^)]+)\)/g)]){
  const target=match[1].replace(/['"]/g,'');
  if(!target.startsWith('/assets/'))continue;
  const bytes=await fs.readFile(path.join(dist,target.slice(1)));
  const mime=target.endsWith('.woff2')?'font/woff2':'font/woff';
  css=css.replaceAll(match[0],`url(data:${mime};base64,${bytes.toString('base64')})`);
}
html=html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/,()=>`<script type="module">${js.replaceAll('</script','<\\/script')}</script>`);
html=html.replace(/<link[^>]+href="[^"]+\.css"[^>]*>/,()=>`<style>${css}</style>`);
const notices=[];
for(const name of await fs.readdir(path.join(root,'docs/licenses')))notices.push(`${name}\n${await fs.readFile(path.join(root,'docs/licenses',name),'utf8')}`);
html=html.replace('</body>',`<script type="text/plain" id="font-license-notices">${notices.join('\n\n').replaceAll('</script','<\\/script')}</script></body>`);
const output=process.argv[2]||path.join(root,'dist','Starlight-Living-Library.html');
await fs.writeFile(output,html);
console.log(`Standalone preview: ${output} (${Buffer.byteLength(html)} bytes)`);
