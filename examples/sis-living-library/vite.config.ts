import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {sourceProvenance} from './scripts/source-provenance.mjs';

export default defineConfig(async () => {
  const providerRevision = process.env.VERCEL_GIT_COMMIT_SHA;
  const provenance = providerRevision && /^[a-f0-9]{40}$/.test(providerRevision)
    ? {sourceRevision:providerRevision,sourceDirty:false,sourceProvenance:'vercel-git-metadata'}
    : await sourceProvenance(fileURLToPath(new URL('.',import.meta.url)));
  return {
    plugins:[{name:'starlight-build-receipt',generateBundle(){
      this.emitFile({type:'asset',fileName:'build-receipt.json',source:JSON.stringify({
        schema:'starlight.preview_build.v1',...provenance,
        purpose:'Source identification for synthetic preview audits; no release authorization',
      },null,2)+'\n'});
    }}],
    build:{target:'es2022',rollupOptions:{input:{main:'index.html',library:'library.html',glass:'glass.html'}}},
  };
});
