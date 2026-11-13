import {maximumClsWindow,summarizeMetric,validateBuildReceipt,summarizeLabGroups} from './preview-lab-metrics.mjs';

const button=document.querySelector('#run-lab'),status=document.querySelector('#lab-status'),output=document.querySelector('#lab-results'),host=document.querySelector('#frame-host');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function source(expected){
  const response=await fetch('/build-receipt.json',{cache:'no-store',credentials:'same-origin',redirect:'error'});
  if(!response.ok)throw Error('Build receipt is unavailable; audit stopped');
  return validateBuildReceipt(await response.json(),expected);
}
async function measure({device,width,height,route,path,sample},deadline){
  if(Date.now()>deadline)throw Error('Three-minute execution bound exceeded');
  const frame=document.createElement('iframe');frame.width=String(width);frame.height=String(height);frame.title=`Measurement: ${device} ${route} sample ${sample}`;host.replaceChildren(frame);
  let observer,timer;
  try{
    await new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('Frame document load exceeded 20 seconds')),20000);frame.onload=()=>{if(frame.contentWindow.location.pathname===new URL(path,location.origin).pathname)resolve();};frame.onerror=()=>reject(Error('Frame navigation failed'));frame.src=path;});clearTimeout(timer);host.scrollIntoView({block:'start',behavior:'instant'});
    const win=frame.contentWindow,doc=frame.contentDocument;
    const expectedHeading=route==='glass'?'Give complex work a clear interface.':'A clear view of the work.';
    // Application hydration may finish after load. Never measure a sign-in/error document.
    const hydrationDeadline=Math.min(deadline,Date.now()+10000);
    while(doc.querySelector('h1')?.innerText.replace(/\s+/g,' ').trim()!==expectedHeading){if(Date.now()>hydrationDeadline)throw Error('Expected application heading did not render');await pause(50);}
    const supported=Array.from(win.PerformanceObserver?.supportedEntryTypes??[]),data={lcp:[],shifts:[]},observers=[];
    for(const type of ['largest-contentful-paint','layout-shift']){
      if(!supported.includes(type))continue;
      observer=new win.PerformanceObserver(list=>{for(const entry of list.getEntries()){
        if(type==='largest-contentful-paint')data.lcp.push({startTime:entry.startTime,size:entry.size});
        else data.shifts.push({startTime:entry.startTime,value:entry.value,hadRecentInput:entry.hadRecentInput});
      }});observer.observe({type,buffered:true});observers.push(observer);
    }
    try{
      await Promise.race([doc.fonts.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('Font readiness exceeded 10 seconds')),10000))]);await pause(3000);
      const paint=win.performance.getEntriesByType('paint').find(entry=>entry.name==='first-contentful-paint'),navigation=win.performance.getEntriesByType('navigation')[0];
      return{device,width,height,route,sample,supported,fcpMs:paint?.startTime??null,lcpMs:supported.includes('largest-contentful-paint')?data.lcp.at(-1)?.startTime??null:null,cls:supported.includes('layout-shift')?maximumClsWindow(data.shifts):null,ttfbMs:navigation?navigation.responseStart-navigation.requestStart:null,domContentLoadedMs:navigation?.domContentLoadedEventEnd??null,observationWindow:'load/hydration/font-ready + 3 seconds; no fixture interaction',cachePolicy:'Fresh frame document navigation; browser resource cache may be warm'};
    }finally{for(const current of observers)current.disconnect();}
  }finally{clearTimeout(timer);observer?.disconnect();frame.remove();}
}
button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;
  const expected=document.querySelector('#expected-sha').value.trim(),report={schema:'starlight.actual_preview_lab.v1',synthetic:true,origin:location.origin,expectedSourceRevision:/^[a-f0-9]{40}$/.test(expected)?expected:null,at:new Date().toISOString(),topLevelViewport:{width:innerWidth,height:innerHeight},performance:[],limitations:['Embedded same-origin frames, not top-level navigation or field-user data','Unthrottled browser CPU/network; resource cache may be warm','Three-second post-font-ready observation window; later shifts are outside scope','No responsiveness, INP, accessibility, screen-reader or commercial-release pass claim','Public build receipt is source binding, not cryptographic provenance or provider attestation']};
  try{
    Object.assign(report,await source(expected));const deadline=Date.now()+180000;
    for(const [device,width,height]of [['desktop',1440,1000],['mobile',390,844]])for(const [route,path]of [['console','/#console'],['glass','/glass.html']])for(let sample=1;sample<=3;sample++){
      status.textContent=`Measuring ${device} ${route}: sample ${sample} of 3 (${report.performance.length+1}/12).`;
      report.performance.push(await measure({device,width,height,route,path,sample},deadline));output.textContent=JSON.stringify(report,null,2);
    }
    await source(expected);report.summary={fcpMs:summarizeMetric(report.performance.map(x=>x.fcpMs)),lcpMs:summarizeMetric(report.performance.map(x=>x.lcpMs)),cls:summarizeMetric(report.performance.map(x=>x.cls))};
    report.budgets={fcpP75Ms:2500,lcpP75Ms:2500,maxCls:.1};
    report.groups=summarizeLabGroups(report.performance);
    report.status=report.groups.some(group=>group.status==='INCONCLUSIVE')?'INCONCLUSIVE':report.groups.every(group=>group.status==='PASS')?'PASS':'FAIL';
    report.passed=report.status==='PASS';status.textContent=`${report.status}: actual-preview synthetic paint/layout audit. See scoped limitations.`;
  }catch(error){report.status='BLOCKED';report.passed=false;report.error=String(error.message).slice(0,240);status.textContent='BLOCKED: no successful audit claim. Inspect the report.';}
  finally{report.completedAt=new Date().toISOString();output.textContent=JSON.stringify(report,null,2);button.disabled=false;host.replaceChildren();}
});
