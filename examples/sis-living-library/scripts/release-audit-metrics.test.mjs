import test from 'node:test';
import assert from 'node:assert/strict';
import {maximumClsWindow,summarizeMetric,auditTarget,validateBuildReceipt,summarizeLabGroups} from './release-audit-metrics.mjs';
test('CLS uses the maximum bounded session and excludes recent-input shifts',()=>{
  assert.equal(maximumClsWindow([{startTime:0,value:.02},{startTime:900,value:.03},{startTime:1900,value:.04},{startTime:2000,value:.5,hadRecentInput:true}]),.05);
  assert.equal(maximumClsWindow(Array.from({length:8},(_,i)=>({startTime:i*900,value:.01}))),.060000000000000005);
  assert.equal(maximumClsWindow([{startTime:1,value:NaN},{startTime:2,value:-2}]),0);
});
test('missing/unsupported performance samples stay unknown',()=>{
  assert.deepEqual(summarizeMetric([null,undefined,NaN]),{samples:0,missing:3,min:null,median:null,p75:null,max:null});
  assert.deepEqual(summarizeMetric([10,40,20,30,null]),{samples:4,missing:1,min:10,median:20,p75:30,max:40});
});
test('remote audit origins reject secrets, unrelated paths and unbound source identity',()=>{
  assert.equal(auditTarget('https://preview.example/','a'.repeat(40)),'https://preview.example');
  for(const url of ['http://preview.example/','https://user:pass@preview.example/','https://preview.example/?_vercel_share=secret','https://preview.example/path','https://preview.example/#route'])assert.throws(()=>auditTarget(url,'a'.repeat(40)));
  assert.throws(()=>auditTarget('https://preview.example/','main'));
});
test('build receipts fail closed on missing, dirty or mismatched sources',()=>{
  const sha='a'.repeat(40);assert.deepEqual(validateBuildReceipt({sourceRevision:sha,sourceDirty:false},sha),{sourceRevision:sha,sourceDirty:false});
  for(const receipt of [null,{}, {sourceRevision:sha}, {sourceRevision:sha,sourceDirty:true}, {sourceRevision:'b'.repeat(40),sourceDirty:false}])assert.throws(()=>validateBuildReceipt(receipt,sha));
  assert.throws(()=>validateBuildReceipt({sourceRevision:sha,sourceDirty:false},'main'));
});
test('each device and route must meet its own paint/layout budget',()=>{
  const samples=['desktop','mobile'].flatMap(device=>['console','glass'].flatMap(route=>Array.from({length:3},(_,i)=>({device,route,sample:i+1,fcpMs:100,lcpMs:200,cls:0}))));
  assert(summarizeLabGroups(samples).every(g=>g.status==='PASS'));
  samples.find(s=>s.device==='mobile'&&s.route==='glass').lcpMs=3000;
  assert.equal(summarizeLabGroups(samples).find(g=>g.device==='mobile'&&g.route==='glass').status,'FAIL');
  samples[0].lcpMs=null;assert.equal(summarizeLabGroups(samples)[0].status,'INCONCLUSIVE');
});
