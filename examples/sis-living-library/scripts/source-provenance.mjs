import {execFileSync} from 'node:child_process';
import {readFile,lstat,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

/** Git source or hash-verified distributed source; neither grants release authority. */
export async function sourceProvenance(root) {
  try {
    execFileSync('git',['ls-files','--error-unmatch','--','package.json','src/components.tsx','scripts/package-release.mjs'],{cwd:root,stdio:'ignore'});
    const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
    const sourceDirty=Boolean(execFileSync('git',['status','--porcelain','--','.'],{cwd:root,encoding:'utf8'}).trim());
    return {sourceRevision,sourceDirty,sourceProvenance:'git'};
  } catch {
    const manifest=JSON.parse(await readFile(path.join(root,'RELEASE-MANIFEST.json'),'utf8'));
    if(manifest.schema!=='starlight.product_archive.v1'||manifest.sourceDirty!==false||!/^[a-f0-9]{40}$/.test(manifest.sourceRevision)||!Array.isArray(manifest.files))throw Error('Invalid distributed source manifest');
    const required=['package.json','package-lock.json','tsconfig.json','tsconfig.package.json','src/index.ts','src/components.tsx','src/product-components.tsx','src/icons.tsx','src/css.d.ts','src/tokens.css','src/components.css','src/product-components.css','src/tailwind.css','tokens/tokens.json','contracts/components.json','scripts/package-release.mjs','scripts/component-contract.mjs','scripts/source-provenance.mjs','docs/INSTALLATION.md'];
    const names=new Set();
    for(const entry of manifest.files){
      if(!entry||typeof entry.path!=='string'||names.has(entry.path)||!Number.isSafeInteger(entry.bytes)||entry.bytes<0)throw Error('Duplicate or invalid distributed entry');
      names.add(entry.path);
    }
    if(required.some(file=>!names.has(file)))throw Error('Missing required distributed package inputs');
    const base=await realpath(root);
    for(const entry of manifest.files) {
      if(typeof entry.path!=='string'||entry.path.includes('\\')||path.isAbsolute(entry.path)||entry.path.split('/').some(p=>!p||p==='..'||p==='.')||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Invalid distributed source entry');
      // Rebuilt outputs/receipts change; immutable delivered source must still match.
      if(entry.path.startsWith('release/'))continue;
      const file=path.join(root,entry.path);
      if(!(await realpath(file)).startsWith(base+path.sep))throw Error('Distributed source escaped root');
      let ancestor=root;
      for(const part of entry.path.split('/')){ancestor=path.join(ancestor,part);if((await lstat(ancestor)).isSymbolicLink())throw Error('Linked distributed source entry');}
      if(!(await lstat(file)).isFile()||(await lstat(file)).isSymbolicLink())throw Error('Nonregular distributed source entry');
      const bytes=await readFile(file);
      if(bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Distributed source changed: '+entry.path);
    }
    return {sourceRevision:manifest.sourceRevision,sourceDirty:false,sourceProvenance:'verified-declared-package-inputs-unsigned'};
  }
}
