import {execFileSync} from 'node:child_process';
import {readFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

/** Git source or hash-verified distributed source; neither grants release authority. */
export async function sourceProvenance(root) {
  try {
    const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    const sourceDirty=Boolean(execFileSync('git',['status','--porcelain','--','.'],{cwd:root,encoding:'utf8'}).trim());
    return {sourceRevision,sourceDirty,sourceProvenance:'git'};
  } catch {
    const manifest=JSON.parse(await readFile(path.join(root,'RELEASE-MANIFEST.json'),'utf8'));
    if(manifest.schema!=='starlight.product_archive.v1'||manifest.sourceDirty!==false||!/^[a-f0-9]{40}$/.test(manifest.sourceRevision)||!Array.isArray(manifest.files))throw Error('Invalid distributed source manifest');
    for(const entry of manifest.files) {
      if(typeof entry.path!=='string'||entry.path.includes('\\')||path.isAbsolute(entry.path)||entry.path.split('/').some(p=>!p||p==='..'||p==='.')||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Invalid distributed source entry');
      // Rebuilt outputs/receipts change; immutable delivered source must still match.
      if(entry.path.startsWith('release/'))continue;
      const file=path.join(root,entry.path);
      if(!(await lstat(file)).isFile()||(await lstat(file)).isSymbolicLink())throw Error('Nonregular distributed source entry');
      const bytes=await readFile(file);
      if(bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Distributed source changed: '+entry.path);
    }
    return {sourceRevision:manifest.sourceRevision,sourceDirty:false,sourceProvenance:'verified-archive-manifest-unsigned'};
  }
}
