import test from 'node:test';import assert from 'node:assert/strict';
import {angle,CLOSED,OPEN,Transformation,EventProjection,ENTITY_ID} from '../src/runtime.mjs';
test('all six joints satisfy exact endpoints, limits and opposite-pair dependencies',()=>{
 for(let i=0;i<6;i++){assert.equal(angle(0,i),CLOSED);assert.ok(Math.abs(angle(1,i)-OPEN)<1e-14);
  for(let k=0;k<=1000;k++){let a=angle(k/1000,i);assert.ok(a>=CLOSED-1e-14&&a<=OPEN+1e-14);assert.equal(a,angle(k/1000,(i+3)%6));}}
});
test('rejects nonfinite/out-of-range coordinates',()=>{for(const q of [NaN,Infinity,-.1,1.1])assert.throws(()=>angle(q,0));});
test('settled reversible motion rejects mid-flight reversal and completes both ways',()=>{
 const t=new Transformation();assert.equal(t.request('bloom'),true);t.tick(2);assert.equal(t.request('seed'),false);t.tick(4);assert.equal(t.state,'bloom');assert.equal(t.q,1);t.request('seed');t.tick(6);assert.equal(t.q,0);assert.equal(t.state,'seed');
});
test('inspection requires endpoint reset before timed playback',()=>{const t=new Transformation();t.seek(.5);assert.equal(t.request('bloom'),false);t.seek(0);assert.equal(t.request('bloom'),true);});
test('runtime projection rejects wrong scope, stale, duplicate, out-of-order and cross-run events',()=>{
 const p=new EventProjection(),now=100000,e={entity_id:ENTITY_ID,scope:'synthetic-local',run_id:'r1',event_id:'e1',seq:1,state:'running',observed_at:now};
 assert.equal(p.apply({...e,scope:'live'},now),false);assert.equal(p.apply({...e,entity_id:'other'},now),false);assert.equal(p.apply({...e,observed_at:now-30001},now),false);
 assert.equal(p.apply(e,now),true);assert.equal(p.apply(e,now),false);assert.equal(p.apply({...e,seq:0},now),false);assert.equal(p.apply({...e,seq:2,run_id:'r2'},now),false);assert.equal(p.refresh(now+30001),'unknown');
});
