import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const EXPECTED = Object.freeze({
  'Mini-Frank-Character-Model-Sheet.png':'9a7553c440c7bf5c7a1a88a039aa42112dddf295cb29a3a0d82afdda321d5b7f',
  'Mini-Frank-Cast-Model-Sheet.png':'09bb733175c5f1f2f37f88698f8e56e48ca16ad8536d70eafc1408cd82b99fb5'
});
export async function verifyMiniFrankMasters(directory,{expected=EXPECTED}={}){
  const assets=[];
  for(const [name,hash] of Object.entries(expected)){
    let observed=null,bytes=null,status='MISSING';
    try {const data=await readFile(resolve(directory,name));bytes=data.length;observed=createHash('sha256').update(data).digest('hex');status=observed===hash?'VERIFIED':'HASH_MISMATCH';}
    catch(e){if(e.code!=='ENOENT')throw e;}
    assets.push({name,expected_sha256:hash,observed_sha256:observed,bytes,status});
  }
  return {schema:'starlight.mini_frank_master_verification.v1',reference_revision:'2026-10-09.4',master_verified:assets.every(a=>a.status==='VERIFIED'),assets};
}
export function assertCanonicalGenerationAllowed(verification,attachmentNames){
  if(!verification?.master_verified||verification.assets?.length!==2||verification.assets.some(a=>a.status!=='VERIFIED'))throw Error('CANONICAL_REFERENCE_BLOCKED: both authentic masters must pass SHA-256');
  for(const asset of verification.assets)if(!attachmentNames.includes(asset.name))throw Error('CANONICAL_REFERENCE_BLOCKED: generation input missing '+asset.name);
  return true;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+resolve(process.argv[1])).href){
  const dir=process.argv[2];if(!dir){console.error('Usage: node scripts/verify-mini-frank.mjs <private-masters-directory> [receipt-output.json]');process.exitCode=2;}
  else{const receipt=await verifyMiniFrankMasters(dir);if(process.argv[3])await writeFile(process.argv[3],JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));if(!receipt.master_verified)process.exitCode=1;}
}
