"""Assemble private release candidates from the existing source owner. No publishing."""
from pathlib import Path
import hashlib,json,subprocess,zipfile

root=Path(__file__).resolve().parents[1]
release=root/'release'
release.mkdir(exist_ok=True)
tarball=release/'starlight-living-design-0.2.0.tgz'
if not tarball.exists(): raise SystemExit('Run npm run build:package first')
source_revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip())
excluded={'node_modules','.next','release','test-results','.git','.taste-skill','__pycache__'}
def files_under(folder):
    return [p for p in (root/folder).rglob('*') if p.is_file() and not any(part in excluded for part in p.relative_to(root).parts) and p.name not in {'tsconfig.tsbuildinfo','next-env.d.ts'}]
core=[root/'README.md']+files_under('docs')+files_under('assets')+files_under('tokens')
core += [root/'src'/name for name in ['index.ts','components.tsx','components.css','tokens.css','icons.tsx','product-components.tsx','product-components.css','tailwind.css','css.d.ts']]
editions=[('living-glass-ui-kit',49,core),('ai-startup-launch-kit',149,core+files_under('examples/next-app')),('premium-builder-bundle',249,[p for p in root.rglob('*') if p.is_file() and not any(part in excluded for part in p.relative_to(root).parts) and p.name not in {'tsconfig.tsbuildinfo','next-env.d.ts'}])]
receipts=[]
for name,price,paths in editions:
    mapping={str(p.relative_to(root)):p for p in paths}
    mapping['release/'+tarball.name]=tarball
    if name!='premium-builder-bundle':
        readme=release/(name+'-README.md')
        body='# '+{'living-glass-ui-kit':'Living Glass UI Kit','ai-startup-launch-kit':'AI Startup Launch Kit'}[name]+' / RC 0.2\n\nPrivate review candidate. Source rights are unchanged; commercial license and fulfillment approval remain pending.\n\n'
        if name=='living-glass-ui-kit':
            body+='Install the compiled package in your own React 19 application:\n\n```sh\nnpm install ./release/starlight-living-design-0.2.0.tgz\n```\n\nImport @starlight/living-design/styles.css and the named components. This edition contains the UI foundation, icons, tokens and documentation; a complete application starter is included in the other editions. Original TypeScript sources are in src/.\n'
        else:
            body+='The independent Next.js application is included. From this extracted directory:\n\n```sh\ncd examples/next-app\nnpm ci\nnpm run build\nnpm run start\n```\n\nOpen the local address printed by Next. The / route is the workspace; /launch is the SaaS launch and local order-preview template. Both consume the archive at release/starlight-living-design-0.2.0.tgz. No internal service or provider credentials are required.\n'
        body+='\nSee docs/INSTALLATION.md for customization, theme selection, adapters and deployment.\n'
        readme.write_text(body)
        mapping['README.md']=readme
    if name=='premium-builder-bundle':
        for p in (root/'test-results').rglob('*'):
            if p.is_file(): mapping['verification/'+str(p.relative_to(root/'test-results'))]=p
    manifest={'edition':name,'version':'0.2.0-rc.1','targetPriceEUR':price,'sourceRevision':source_revision,'sourceDirty':dirty,'commercialStatus':'private candidate; license and fulfillment approval pending','checkoutActive':False,'files':[{'path':rel,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for rel,p in sorted(mapping.items())]}
    target=release/(name+'-0.2.0-rc.zip')
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for rel,p in sorted(mapping.items()): z.writestr(rel,p.read_bytes())
        z.writestr('RELEASE-MANIFEST.json',json.dumps(manifest,indent=2)+'\n')
        z.writestr('START-HERE.md','# Starlight Living Design / release candidate\n\nInstall the archive at release/starlight-living-design-0.2.0.tgz in your own React app. See docs/INSTALLATION.md. The Next consumer builds from examples/next-app after npm ci. The full Vite workbench is included only in the Builder Bundle. Source rights remain unchanged; this is not a live commercial release.\n')
    receipts.append({'file':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'targetPriceEUR':price})
(release/'products-receipt.json').write_text(json.dumps({'sourceRevision':source_revision,'sourceDirty':dirty,'products':receipts},indent=2)+'\n')
print(json.dumps(receipts,indent=2))
