export const ENTITY_ID='experimental.oavs.seed-bloom.001';
export const CLOSED=-112*Math.PI/180, OPEN=4*Math.PI/180, DURATION=6;
export const smooth5=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));};
export function angle(q,i){
  if(!Number.isFinite(q)||q<0||q>1)throw Error('q must be finite in [0,1]');
  return CLOSED+(OPEN-CLOSED)*smooth5((q-(i%3)*.08)/.84);
}
export class Transformation {
  constructor(){this.q=0;this.direction=0;this.state='seed';}
  request(form){
    if(!['seed','bloom'].includes(form))throw Error('unknown configuration');
    if(this.direction!==0)return false;
    const target=form==='bloom'?1:0;
    if(this.q!==0&&this.q!==1)return false; // scrubbing requires an explicit endpoint reset
    if(this.q===target)return false;
    this.direction=target===1?1:-1;this.state=this.direction>0?'unfolding':'folding';return true;
  }
  tick(dt){
    if(!Number.isFinite(dt)||dt<0)throw Error('invalid dt');
    if(this.direction){this.q=Math.max(0,Math.min(1,this.q+this.direction*dt/DURATION));
      if(this.q===0||this.q===1){this.direction=0;this.state=this.q===0?'seed':'bloom';}}
    return this.q;
  }
  seek(q){angle(q,0);this.q=q;this.direction=0;this.state=q===0?'seed':q===1?'bloom':'inspection';}
}
export class EventProjection {
  constructor(){this.seq=-1;this.state='unknown';this.runId=null;this.lastObserved=0;}
  apply(e,now=Date.now()){
    if(e.entity_id!==ENTITY_ID||e.scope!=='synthetic-local'||!e.run_id||!e.event_id)return false;
    if(!Number.isInteger(e.seq)||e.seq<=this.seq||!['idle','running','succeeded','failed','unknown'].includes(e.state))return false;
    if(!Number.isFinite(e.observed_at)||now-e.observed_at>30000||e.observed_at>now+1000)return false;
    // One projection is one run. A new run needs a new projection instance.
    if(this.runId&&e.run_id!==this.runId)return false;
    this.seq=e.seq;this.runId=e.run_id;this.state=e.state;this.lastObserved=e.observed_at;return true;
  }
  refresh(now=Date.now()){if(now-this.lastObserved>30000)this.state='unknown';return this.state;}
}
