import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tokens=JSON.parse(fs.readFileSync(path.join(root,'tokens/tokens.json'),'utf8'));
function luminance(components){return components.map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);}
function ratio(a,b){const [x,y]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(x+.05)/(y+.05);}
test('every theme preserves readable text and status on both reading surfaces',()=>{for(const theme of Object.values(tokens.themes)){for(const fg of ['text','muted','accent','danger','success'])for(const bg of ['bg','panel'])assert.ok(ratio(theme[fg].$value.components,theme[bg].$value.components)>=4.5,`${fg}/${bg}`);assert.ok(ratio(theme['accent-ink'].$value.components,theme.accent.$value.components)>=4.5);}});
test('icon vocabulary is original, self-contained and usable without network assets',()=>{const files=fs.readdirSync(path.join(root,'assets/icons')).filter(x=>x.endsWith('.svg'));assert.equal(files.length,24);for(const file of files){const svg=fs.readFileSync(path.join(root,'assets/icons',file),'utf8');assert.match(svg,/viewBox="0 0 24 24"/);assert.match(svg,/stroke="currentColor"/);assert.doesNotMatch(svg,/<script|<image|href=|<foreignObject/);}});
test('generated registry installs self-contained source without overwriting existing UI',()=>{const registry=JSON.parse(fs.readFileSync(path.join(root,'public/r/starlight-living.json'),'utf8'));assert.equal(registry.name,'starlight-living');assert.equal(registry.files.length,5);for(const f of registry.files){assert.ok(f.target.startsWith('@ui/starlight/'));assert.equal(f.content,fs.readFileSync(path.join(root,f.path),'utf8'));}assert.match(registry.files.find(f=>f.path==='src/index.ts').content,/import '.\/tokens.css'/);});
