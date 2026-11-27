import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs'; import path from 'path';
const R='/home/user/';
const items=[
['FrankX mark (PNG only)','frankx.ai-vercel-website/public/images/brand/logo-mark.png'],
['FrankX full (PNG only)','frankx.ai-vercel-website/public/images/brand/logo-full.png'],
['SIS site icon','Starlight-Intelligence-System/site/src/app/icon.svg'],
['starlightintelligence.ai icon','starlightintelligence.ai/app/icon.svg'],
['SIS Foundry logo','Starlight-Intelligence-System/plugins/starlight-foundry/assets/logo.svg'],
['Starlight Product Studios','starlight-agent-skills/plugins/starlight-product-studios/assets/logo-dark.svg'],
['Starlight network mark','starlight-network/apps/directory/public/mark.svg'],
['Starlight communities','starlight-communities/plugins/starlight-communities/assets/logo.svg'],
['Arcanea logo (app)','arcanea-ai-app/apps/web/public/brand/arcanea-logo.svg'],
['Arcanea wordmark (app)','arcanea-ai-app/apps/web/public/brand/arcanea-wordmark.svg'],
['Arcanea wordmark (OSS PNG)','arcanea/assets/premium/arcanea-wordmark.png'],
['GenCreator monogram','gencreator.ai/brand/logo-system/masters/gc-monogram.svg'],
['GenCreator lockup','gencreator.ai/brand/logo-system/masters/gc-lockup.svg'],
['GenCreator favicon','gencreator.ai/brand/logo-system/masters/gc-favicon.svg'],
['GenCreator mark (public, legacy?)','gencreator.ai/public/brand/gencreator-mark.svg'],
['AgenticIncome icon','agenticincome/public/icon.svg'],
['AgenticIncome monogram 3D','agenticincome/public/brand/logo-monogram-3d.jpg'],
['AgenticPassiveIncome icon','agenticpassiveincome/app/icon.svg'],
['AnimeLegends icon','AnimeLegends/brand/assets/logo-icon.svg'],
['AnimeLegends horizontal','AnimeLegends/brand/assets/logo-horizontal.svg'],
['RealityArchitect icon','realityarchitect/app/icon.svg'],
['FrankX Palace icon','frankx-palace/app/icon.svg'],
['Blue Life Commons mark','blue-life-commons/assets/brand/blue-life-commons-mark.svg'],
['AI Architect Academy','ai-architect-academy/assets/logo.svg'],
['Claude Skills Library','claude-skills-library/assets/logo.svg'],
['Ocean IS (PNG)','ocean-intelligence-system/assets/logo.png'],
];
const mime=f=>f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':'image/jpeg';
let rows='';
for(const [n,f] of items){ if(!fs.existsSync(R+f)) continue;
 const d=`data:${mime(f)};base64,`+fs.readFileSync(R+f).toString('base64');
 const cell=(bg,s)=>`<div style="background:${bg};width:${Math.max(s,40)+12}px;height:${Math.max(s,40)+12}px;display:flex;align-items:center;justify-content:center"><img src="${d}" style="max-width:${s}px;max-height:${s}px"></div>`;
 rows+=`<div class=r><div class=n>${n}</div>${cell('#0b0b0f',16)}${cell('#0b0b0f',32)}${cell('#0b0b0f',128)}${cell('#f4f2ee',16)}${cell('#f4f2ee',32)}${cell('#f4f2ee',128)}<div style="filter:grayscale(1) contrast(9);background:#fff;width:140px;height:140px;display:flex;align-items:center;justify-content:center"><img src="${d}" style="max-width:128px;max-height:128px"></div></div>`;}
const html=`<html><body style="margin:0;padding:16px;background:#777;font:12px system-ui"><style>.r{display:flex;gap:6px;align-items:center;margin-bottom:6px}.n{width:190px;color:#fff}</style>${rows}</body></html>`;
fs.writeFileSync('sheet.html',html);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file://'+path.resolve('sheet.html')); await p.screenshot({path:'sheet.png',fullPage:true}); await b.close();
