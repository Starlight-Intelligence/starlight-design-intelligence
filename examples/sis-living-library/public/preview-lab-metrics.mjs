/** Bounded lab helpers; no field Core Web Vitals or production attestation. */
export function maximumClsWindow(shifts) {
  const entries=shifts.filter(x=>Number.isFinite(x.startTime)&&Number.isFinite(x.value)&&x.value>=0&&!x.hadRecentInput).sort((a,b)=>a.startTime-b.startTime);
  let start=0,last=0,sum=0,max=0;
  for(const entry of entries){
    if(sum===0||entry.startTime-last>=1000||entry.startTime-start>=5000){start=entry.startTime;sum=entry.value;}
    else sum+=entry.value;
    last=entry.startTime;max=Math.max(max,sum);
  }
  return max;
}
export function summarizeMetric(values) {
  const known=values.filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0).sort((a,b)=>a-b);
  return {samples:known.length,missing:values.length-known.length,min:known[0]??null,median:known.length?known[Math.floor((known.length-1)/2)]:null,p75:known.length?known[Math.ceil(known.length*.75)-1]:null,max:known.at(-1)??null};
}
export function auditTarget(raw,expectedSha) {
  let url;try{url=new URL(raw);}catch{throw Error('Audit target is not a valid URL');}
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.port)throw Error('Audit target must be an HTTPS origin without credentials, path, query or fragment');
  if(!/^[a-f0-9]{40}$/.test(expectedSha??''))throw Error('A verified preview source SHA is required');
  return url.origin;
}
export function validateBuildReceipt(receipt,expectedSha) {
  if(!/^[a-f0-9]{40}$/.test(expectedSha??''))throw Error('An exact 40-character expected source SHA is required');
  if(!receipt||receipt.sourceRevision!==expectedSha||receipt.sourceDirty!==false)throw Error('Build receipt source mismatch or uncommitted source; audit stopped');
  return {sourceRevision:receipt.sourceRevision,sourceDirty:false};
}
export function summarizeLabGroups(samples) {
  return ['desktop','mobile'].flatMap(device=>['console','glass'].map(route=>{
    const selected=samples.filter(x=>x.device===device&&x.route===route);
    const metrics={fcpMs:summarizeMetric(selected.map(x=>x.fcpMs)),lcpMs:summarizeMetric(selected.map(x=>x.lcpMs)),cls:summarizeMetric(selected.map(x=>x.cls))};
    const missing=selected.length!==3||Object.values(metrics).some(x=>x.samples!==3);
    return{device,route,...metrics,status:missing?'INCONCLUSIVE':metrics.fcpMs.p75<=2500&&metrics.lcpMs.p75<=2500&&metrics.cls.max<=.1?'PASS':'FAIL'};
  }));
}
