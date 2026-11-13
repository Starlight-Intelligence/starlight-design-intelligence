import {chromium} from 'playwright';
import {preview} from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {maximumClsWindow,summarizeMetric,auditTarget,validateBuildReceipt,summarizeLabGroups} from './release-audit-metrics.mjs';

const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'test-results/release-audit');
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const remote=Boolean(process.env.STARLIGHT_AUDIT_URL);
const target=remote?auditTarget(process.env.STARLIGHT_AUDIT_URL,process.env.STARLIGHT_AUDIT_EXPECTED_SHA):'http://127.0.0.1:5184';
const targetSha=remote?process.env.STARLIGHT_AUDIT_EXPECTED_SHA:revision;
assert(!remote||targetSha===revision,'Preview source must exactly match the checked-out audit source');
const share=process.env.STARLIGHT_AUDIT_SHARE_URL;
if(share){let s;try{s=new URL(share);}catch{throw Error('Invalid private preview URL');}assert(remote&&s.origin===target&&s.protocol==='https:'&&!s.username&&!s.password&&s.pathname==='/'&&[...s.searchParams.keys()].every(k=>k==='_vercel_share'),'Private share URL must target the same preview origin');}
await fs.mkdir(out,{recursive:true});
const report={schema:'starlight.release_browser_audit.v1',sourceRevision:revision,targetRevision:targetSha,origin:target,synthetic:true,scope:remote?'actual-preview':'local-production-build',at:new Date().toISOString(),checks:[],performance:[],artifacts:[],productAxe:[],limitations:['Chromium only; no native screen-reader or field-user study','Narrow viewport is a zoom-equivalent reflow test, not browser chrome zoom','Performance is an unthrottled controlled lab observation, not field Core Web Vitals, Lighthouse or production certification','Event Timing samples omit events below the browser reporting threshold; empty samples remain unknown','Same-origin build receipt binds the clean source SHA; it is not cryptographic provenance or independent provider attestation']};
let server,browser;
function safeError(error){let message=String(error?.message??error);if(share)message=message.replaceAll(share,'[private-preview-url]');return message.replace(/_vercel_share=[^&\s"']+/g,'_vercel_share=[redacted]').slice(0,300);}
async function check(name,fn){try{const detail=await fn();report.checks.push({name,passed:true,...detail});}catch(error){report.checks.push({name,passed:false,error:safeError(error)});}}
async function contextFor(options={}){
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,...options});
  if(share){const auth=await context.newPage();await auth.goto(share,{waitUntil:'domcontentloaded'});await auth.close();}
  return context;
}
async function open(page,route='console',file=''){
  const response=await page.goto(`${target}/${file}${file?'':`#${route}`}`,{waitUntil:'domcontentloaded',timeout:30000});
  assert(response?.ok(),'Application document failed');
  assert(new URL(page.url()).origin===target,'Preview authentication did not reach the application');
  await page.locator('h1').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  if(!file)assert(await page.getByRole('heading',{name:{console:'A clear view of the work.',browser:'Keep the source in sight.',intelligence:'A thesis with a paper trail.',launch:'Build something worth opening.',docs:'Your code. Your deployment.'}[route],exact:true}).isVisible(),'Unexpected application route');
  if(file==='glass.html')assert(await page.getByRole('heading',{name:'Give complex work a clear interface.',exact:true}).isVisible(),'Unexpected product page');
}
async function screenshot(page,name){const file=path.join(out,name);const bytes=await page.screenshot({path:file,fullPage:false,animations:'disabled'});report.artifacts.push({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),viewport:page.viewportSize(),kind:'unreviewed-audit-capture'});}
async function media(page,features){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setEmulatedMedia',{features:Object.entries(features).map(([name,value])=>({name,value}))});return cdp;}
try{
  if(!remote){await fs.access(path.join(root,'dist/index.html'));server=await preview({root,preview:{host:'127.0.0.1',port:5184,strictPort:true}});}
  browser=await chromium.launch({headless:true,...(process.env.STARLIGHT_CHROMIUM?{executablePath:process.env.STARLIGHT_CHROMIUM}:{}),args:['--no-sandbox']});
  report.browser=await browser.version();report.runtime={node:process.version,platform:process.platform,networkThrottling:'none',cpuThrottling:'none'};
  {
    const context=await contextFor();try{const receipt=await context.request.get(`${target}/build-receipt.json`);assert(receipt.ok(),'Build receipt is unavailable');report.buildReceipt=validateBuildReceipt(await receipt.json(),targetSha);}finally{await context.close();}
  }
  for(const [device,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
    const context=await contextFor({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage();
    try{
      for(const theme of ['midnight','daylight','ember'])await check(`Essential product axe / ${device} / ${theme}`,async()=>{
        await open(page,'glass','glass.html');await page.getByLabel('Theme',{exact:true}).selectOption(theme);
        assert((await page.locator('meta[name="robots"]').getAttribute('content')).split(',').map(s=>s.trim()).includes('noindex'),'Candidate must remain noindex');
        assert(await page.getByRole('button',{name:'Checkout unavailable',exact:true}).isDisabled(),'Unapproved checkout must remain disabled');
        await page.addScriptTag({path:path.join(root,'public/qa/axe.min.js')});
        const axe=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{version:r.testEngine.version,violations:r.violations.map(({id,impact,nodes})=>({id,impact,targets:nodes.map(n=>n.target)})),incomplete:r.incomplete.map(({id,nodes})=>({id,targets:nodes.map(n=>n.target)}))};});
        report.productAxe.push({device,theme,...axe});await screenshot(page,theme==='midnight'?`${device}-glass.png`:`${device}-glass-${theme}.png`);assert.equal(axe.violations.length,0,JSON.stringify(axe.violations));return{axe};
      });
      await check(`Essential product local preview, material and keyboard tabs / ${device}`,async()=>{
        await open(page,'glass','glass.html');await page.getByLabel('Workspace name',{exact:true}).fill('Audit workspace');
        await page.getByRole('button',{name:'Prepare local preview',exact:true}).click();await page.getByRole('status').filter({hasText:'Audit workspace is ready in this demonstration.'}).waitFor();
        const material=page.getByRole('button',{name:'Glass material',exact:true});assert.equal(await material.getAttribute('aria-pressed'),'true');await material.click();assert.equal(await material.getAttribute('aria-pressed'),'false');assert.equal(await page.locator('html').getAttribute('data-transparency'),'opaque');
        await page.getByLabel('Workspace name',{exact:true}).fill('');await page.getByRole('button',{name:'Prepare local preview',exact:true}).click();await page.getByRole('status').filter({hasText:'Untitled workspace is ready in this demonstration.'}).waitFor();
        const tabs=page.getByRole('tablist',{name:'Integration examples',exact:true});const install=tabs.getByRole('tab',{name:'Install',exact:true});await install.focus();
        for(const [key,label]of [['ArrowRight','States'],['End','Usage'],['Home','Install'],['ArrowLeft','Usage']]){await page.keyboard.press(key);const tab=tabs.getByRole('tab',{name:label,exact:true});assert.equal(await tab.getAttribute('aria-selected'),'true');assert(await tab.evaluate(e=>e===document.activeElement));assert(await page.getByRole('tabpanel',{name:label,exact:true}).isVisible());}
        return{fixture:'Local state only; no provider or checkout action',material:'opaque',tabKeys:['ArrowRight','End','Home','ArrowLeft']};
      });
    }finally{await context.close();}
  }
  for(const theme of ['midnight','daylight','ember']){
    const context=await contextFor({viewport:{width:390,height:844}}),page=await context.newPage();
    try{
      await check(`reduced-transparency / ${theme}`,async()=>{
        await media(page,{'prefers-reduced-transparency':'reduce','prefers-reduced-motion':'reduce','forced-colors':'none'});await open(page,'launch');await page.getByLabel('Theme',{exact:true}).selectOption(theme);
        const state=await page.evaluate(()=>({matched:matchMedia('(prefers-reduced-transparency: reduce)').matches,surface:getComputedStyle(document.querySelector('.sl-surface--glass')).backdropFilter,rail:getComputedStyle(document.querySelector('.x-rail')).backdropFilter,fill:getComputedStyle(document.querySelector('.sl-surface--glass')).backgroundColor}));
        assert(state.matched,'Browser did not emulate reduced transparency');assert.equal(state.surface,'none');assert.equal(state.rail,'none');assert(!/rgba\([^)]*,\s*0\./.test(state.fill),'Glass fallback must be opaque');return{state};
      });
      await check(`forced-colors / ${theme}`,async()=>{
        await media(page,{'forced-colors':'active','prefers-reduced-motion':'reduce','prefers-reduced-transparency':'reduce'});await open(page);await page.getByLabel('Theme',{exact:true}).selectOption(theme);
        await page.getByRole('button',{name:'Approve action',exact:true}).focus();
        const state=await page.evaluate(()=>{const b=document.activeElement,s=getComputedStyle(b),surface=getComputedStyle(document.querySelector('.sl-surface'));return{matched:matchMedia('(forced-colors: active)').matches,outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:surface.boxShadow,buttonLabel:b.textContent.trim()};});
        assert(state.matched);assert.notEqual(state.outline,'none');assert(parseFloat(state.outlineWidth)>=2);assert.equal(state.boxShadow,'none');return{state};
      });
      if(theme==='midnight')await screenshot(page,'forced-colors-mobile.png');
    }finally{await context.close();}
  }
  {
    const context=await contextFor({reducedMotion:'reduce'}),page=await context.newPage();
    try{
      await check('reduced motion disables spinner and shimmer while preserving content',async()=>{
        await open(page,'console','library.html');await page.getByRole('button',{name:'Explore the components',exact:true}).click();
        const state=await page.evaluate(()=>({matched:matchMedia('(prefers-reduced-motion: reduce)').matches,spinner:getComputedStyle(document.querySelector('.sl-button__spinner')).animationName,shimmer:getComputedStyle(document.querySelector('.sl-skeleton'),'::after').display,heading:document.querySelector('h1').textContent}));
        assert(state.matched);assert.equal(state.spinner,'none');assert.equal(state.shimmer,'none');assert(state.heading.trim());return{state};
      });
      await check('keyboard modal focus stays contained and restores to trigger',async()=>{
        await open(page);const trigger=page.getByRole('button',{name:'Find an experience',exact:true});await trigger.focus();await page.keyboard.press('Enter');
        const dialog=page.getByRole('dialog',{name:'Open an experience',exact:true});await dialog.waitFor();assert(await page.getByLabel('Search components',{exact:true}).evaluate(e=>e===document.activeElement));
        for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>Boolean(document.activeElement.closest('dialog[open]'))),'Tab escaped native modal');}
        for(let i=0;i<12;i++){await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>Boolean(document.activeElement.closest('dialog[open]'))),'Reverse tab escaped native modal');}
        await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert(await trigger.evaluate(e=>e===document.activeElement),'Escape did not restore focus');return{forwardTabs:12,reverseTabs:12};
      });
      await check('cancel before approval preserves decision truth and terminal controls',async()=>{
        await open(page);await page.getByRole('button',{name:'Cancel mission',exact:true}).click();await page.getByText('Mission cancelled before review. No approval or rejection was recorded.',{exact:true}).waitFor();
        assert(await page.getByRole('button',{name:'Start local simulation',exact:true}).isDisabled());assert(await page.getByRole('button',{name:'Advance one step',exact:true}).isDisabled());assert.equal(await page.getByRole('button',{name:'Approve action',exact:true}).count(),0);return{cancelled:true,approvalRecorded:false};
      });
    }finally{await context.close();}
  }
  for(const [name,width,height]of [['narrow-320',320,844],['zoom-equivalent-200-percent-640',640,450]]){
    const context=await contextFor({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage();
    try{for(const route of ['console','browser','intelligence','launch','glass'])await check(`${name} / ${route}`,async()=>{
      await open(page,route,route==='glass'?'glass.html':'');const state=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,heading:document.querySelector('h1').getBoundingClientRect().toJSON(),main:document.querySelector('main').getBoundingClientRect().toJSON()}));
      await screenshot(page,`${name}-${route}.png`);assert(!state.overflow,'Horizontal document overflow');assert(state.heading.right<=state.viewport+1&&state.heading.left>=-1,'Primary heading clipped');return{state};
    });}finally{await context.close();}
  }
  // Fresh contexts measure an explicit three-second window before interaction.
  for(const [device,width,height]of [['desktop',1440,1000],['mobile',390,844]])for(const route of ['console','glass'])for(let sample=1;sample<=3;sample++){
    const context=await contextFor({viewport:{width,height}}),page=await context.newPage();
    try{
      await page.addInitScript(()=>{
        const data={supported:PerformanceObserver.supportedEntryTypes,lcp:[],shifts:[],events:[],longTasks:[]};window.__starlightReleaseLab=data;
        for(const type of ['largest-contentful-paint','layout-shift','event','longtask']){
          if(!data.supported.includes(type))continue;
          const observer=new PerformanceObserver(list=>{for(const e of list.getEntries()){
            if(type==='largest-contentful-paint')data.lcp.push({startTime:e.startTime,size:e.size});
            if(type==='layout-shift')data.shifts.push({startTime:e.startTime,value:e.value,hadRecentInput:e.hadRecentInput});
            if(type==='event'&&e.interactionId>0)data.events.push({name:e.name,startTime:e.startTime,duration:e.duration,interactionId:e.interactionId});
            if(type==='longtask')data.longTasks.push({startTime:e.startTime,duration:e.duration});
          }});observer.observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});
        }
      });
      await open(page,route,route==='glass'?'glass.html':'');await page.waitForTimeout(3000);
      const first=await page.evaluate(()=>{const p=performance.getEntriesByType('paint').find(e=>e.name==='first-contentful-paint');const n=performance.getEntriesByType('navigation')[0];return{...window.__starlightReleaseLab,fcpMs:p?.startTime??null,ttfbMs:n?n.responseStart-n.requestStart:null,domContentLoadedMs:n?.domContentLoadedEventEnd??null,resourceTransferBytes:performance.getEntriesByType('resource').reduce((n,e)=>n+e.transferSize,0)};});
      const actionStarted=performance.now();
      if(route==='console'){await page.getByRole('button',{name:'Approve action',exact:true}).click();await page.getByText('Decision recorded locally. Execution remains unconnected.',{exact:true}).waitFor();}
      else{await page.getByRole('button',{name:'Prepare local preview',exact:true}).click();await page.getByRole('status').filter({hasText:'Research workspace is ready in this demonstration.'}).waitFor();}
      const automationActionMs=performance.now()-actionStarted;
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const after=await page.evaluate(()=>window.__starlightReleaseLab);
      const result={device,width,height,route,sample,fcpMs:first.fcpMs,lcpMs:first.lcp.at(-1)?.startTime??null,cls:first.supported.includes('layout-shift')?maximumClsWindow(after.shifts):null,ttfbMs:first.ttfbMs,domContentLoadedMs:first.domContentLoadedMs,resourceTransferBytes:first.resourceTransferBytes,observedMaxEventDurationMs:after.events.length?Math.max(...after.events.map(e=>e.duration)):null,eventSamples:after.events.length,automationActionMs,longTaskCount:first.supported.includes('longtask')?after.longTasks.length:null,longTaskDurationMs:first.supported.includes('longtask')?after.longTasks.reduce((n,e)=>n+e.duration,0):null,supported:first.supported,observationWindow:'load/font-ready + 3 seconds before one fixture action; two RAF after observable state'};
      report.performance.push(result);
    }catch(error){report.performance.push({device,route,sample,error:safeError(error)});}finally{await context.close();}
  }
  report.summary={checks:report.checks.length,failedChecks:report.checks.filter(c=>!c.passed).length,performanceSamples:report.performance.length,failedPerformanceSamples:report.performance.filter(x=>x.error).length,fcpMs:summarizeMetric(report.performance.map(x=>x.fcpMs)),lcpMs:summarizeMetric(report.performance.map(x=>x.lcpMs)),cls:summarizeMetric(report.performance.map(x=>x.cls)),observedEventDurationMs:summarizeMetric(report.performance.map(x=>x.observedMaxEventDurationMs))};
  // These guard this runner's fixture regressions; they are not field SLAs.
  report.labBudgets={fcpP75Ms:2500,lcpP75Ms:2500,maxCls:.1};
  report.labGroups=summarizeLabGroups(report.performance);report.labBudgetPassed=report.labGroups.every(group=>group.status==='PASS');
  report.responsiveness={status:report.summary.observedEventDurationMs.samples===0?'UNKNOWN':report.summary.observedEventDurationMs.max>200?'FAIL':'OBSERVED_ONLY',claim:'No INP, percentile or responsiveness pass claim; one fixture action per context and threshold-filtered Event Timing do not establish those',missingSamples:report.summary.observedEventDurationMs.missing,maxObservedDurationMs:report.summary.observedEventDurationMs.max};
  report.passed=report.summary.failedChecks===0&&report.summary.failedPerformanceSamples===0&&report.labBudgetPassed;
  process.exitCode=report.passed?0:1;
}catch(error){report.error=safeError(error);report.passed=false;process.exitCode=2;}
finally{await browser?.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));report.results={checks:report.checks,performance:report.performance,summary:report.summary??null};await fs.writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({scope:report.scope,passed:report.passed,summary:report.summary,error:report.error,receipt:'test-results/release-audit/audit.json'}));
