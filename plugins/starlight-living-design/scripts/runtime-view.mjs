// Presentation helper only. Authentication, grants and tenancy are enforced by the owning server.
// Supply events only from a verified adapter; this function does not verify signatures or authorize work.
const statuses=new Set(['queued','running','waiting-for-user','completed','failed','cancelled']);
export function projectRuntimeState(event,expected,now=Date.now()){
  const unknown=reason=>({state:'unknown',reason});
  if(!event)return unknown('no-runtime-evidence');
  if(!expected||typeof expected.tenant_id!=='string'||!expected.tenant_id||typeof expected.run_id!=='string'||!expected.run_id||typeof expected.agent_id!=='string'||!expected.agent_id)return unknown('missing-context');
  if(['tenant_id','run_id','agent_id'].some(k=>event[k]!==expected[k]))return unknown('context-mismatch');
  if(event.schema!=='starlight.living-design.view-event.v1'||!statuses.has(event.state)||!Number.isSafeInteger(event.sequence)||event.sequence<0)return unknown('invalid-event');
  if(!Number.isSafeInteger(expected.last_sequence)||event.sequence<=expected.last_sequence)return unknown('replayed-or-unordered-event');
  const t=Date.parse(event.observed_at),expires=Date.parse(event.expires_at);
  if(!Number.isFinite(now)||!Number.isFinite(t)||!Number.isFinite(expires)||t>now||expires<=now||expires<=t)return unknown('stale-or-future-event');
  if(event.permission_state==='revoked')return {state:'blocked',reason:'permission-revoked'};
  if(event.permission_state!=='authorized')return unknown('permission-not-verified');
  if(event.state==='completed'&&(!Array.isArray(event.artifact_refs)||event.artifact_refs.length===0||event.artifact_refs.some(x=>typeof x!=='string'||!/^artifact:[a-z0-9][a-z0-9.-]*$/.test(x))))return unknown('missing-output-evidence');
  return {state:event.state,sequence:event.sequence,reason:'adapter-event',accepted:false};
}
