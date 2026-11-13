"""Assemble private candidates from tracked source. No provider or publishing calls."""
from pathlib import Path
import argparse, base64, hashlib, json, subprocess, sys, zipfile
sys.dont_write_bytecode = True
from verify_artifact import verify_package, verify_product
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--edition', choices=['essential','professional','agent-command-center'], help='Build one edition; omitted builds all three')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
release = root / 'release'
release.mkdir(exist_ok=True)
tarball = release / 'starlight-living-design-0.2.0.tgz'
if not tarball.exists(): raise SystemExit('Run npm run build:package first')
offers = json.loads((root / 'commercial/products.json').read_text())
revision = subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
dirty = bool(subprocess.check_output(['git','status','--porcelain','--','.'],cwd=root,text=True).strip())
receipt = json.loads((release / 'package-receipt.json').read_text())
sha = lambda raw: hashlib.sha256(raw).hexdigest()
if dirty or receipt.get('sourceDirty'):
    raise SystemExit('Release assembly requires a clean source commit and clean package receipt')
if receipt['sha256'] != sha(tarball.read_bytes()) or receipt['sourceRevision'] != revision: raise SystemExit('Rebuild package from current source')
verify_package(tarball.read_bytes(), receipt, revision)
selected = [edition for edition in offers['editions'] if args.edition is None or edition['edition'] == args.edition]
if any(edition['id'] in {'launch','bundle'} for edition in selected):
    lock = json.loads((root/'examples/next-app/package-lock.json').read_text())
    dependency = lock['packages']['node_modules/@starlight/living-design']
    expected_integrity = 'sha512-' + base64.b64encode(hashlib.sha512(tarball.read_bytes()).digest()).decode()
    if dependency.get('integrity') != expected_integrity or dependency.get('resolved') != 'file:../../release/' + tarball.name:
        raise SystemExit('Next consumer lockfile is stale; refresh it against this exact package archive')
paths = []
for name in filter(None,subprocess.check_output(['git','ls-files','-z','.'],cwd=root).decode().split('\0')):
    p = root / name
    if p.is_symlink() or not p.is_file(): raise SystemExit('Nonregular delivery entry: '+name)
    if p.name.startswith('.env') or p.suffix in {'.pem','.key'}: raise SystemExit('Forbidden entry: '+name)
    if any(part.startswith('.') and part != '.gitignore' for part in p.relative_to(root).parts): continue
    paths.append(p)
core_names = {'index.ts','components.tsx','components.css','tokens.css','icons.tsx','product-components.tsx','product-components.css','tailwind.css','css.d.ts'}
core = [p for p in paths if p.relative_to(root).parts[0] in {'docs','assets','tokens','contracts','commercial'} or (p.parent == root/'src' and p.name in core_names)]
core += [root/'scripts/sandbox-checkout.test.mjs',root/'scripts/verify_artifact.py']
receipts = []
for edition in selected:
    chosen = paths if edition['id']=='bundle' else core + ([p for p in paths if p.is_relative_to(root/'examples/next-app')] if edition['id']=='launch' else [])
    data = {str(p.relative_to(root)):p.read_bytes() for p in chosen}
    data['release/'+tarball.name] = tarball.read_bytes()
    data['release/package-receipt.json'] = (release/'package-receipt.json').read_bytes()
    text = '# '+edition['name']+' / '+offers['version']+'\n\nSource rights remain UNLICENSED; commercial terms and delivery approval pending.\n\n'
    if edition['id']=='glass': text += 'Install into your React 19 app: npm install ./release/starlight-living-design-0.2.0.tgz. Import @starlight/living-design/styles.css. Editable source is in src/.\n'
    elif edition['id']=='launch': text += 'Run cd examples/next-app, npm ci, npm run build, npm run start. The / and /launch routes consume the included package. No provider credentials required.\n'
    else: text += 'Run npm ci, npm run build, npm run dev. Console is the Agent Command Center. Every record is synthetic, state is in memory and no runtime is connected. An independent Next.js example is under examples/next-app.\n'
    text += '\nRead docs/INSTALLATION.md and docs/COMMERCIAL-PACKAGING.md. Starlight marks are demo branding, not a transferred trademark.\n'
    text += '\nBefore extraction, use a verifier obtained from the reviewed source: python3 scripts/verify_artifact.py PATH-TO-ZIP --sha256 TRUSTED-SELLER-CHECKSUM. The included verifier checks unsigned integrity only; it does not establish seller identity or grant a license.\n'
    data['README.md'] = text.encode()
    manifest = {'schema':'starlight.product_archive.v1','edition':edition['edition'],'catalogSku':edition['sku'],'version':offers['version'],'sourceRevision':revision,'sourceDirty':dirty,'targetPriceEUR':edition['amount'],'checkoutActive':False,'license':'UNLICENSED; draft terms only','files':[{'path':name,'bytes':len(raw),'sha256':sha(raw)} for name,raw in sorted(data.items())]}
    data['RELEASE-MANIFEST.json'] = (json.dumps(manifest,indent=2)+'\n').encode()
    target = release/(edition['archive']+'-0.2.0-rc.2.zip')
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,raw in sorted(data.items()):
            info=zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644<<16
            z.writestr(info,raw)
    with zipfile.ZipFile(target) as z:
        assert set(z.namelist())==set(data)
        for entry in manifest['files']:
            raw=z.read(entry['path']); assert len(raw)==entry['bytes'] and sha(raw)==entry['sha256']
    verify_product(target,sha(target.read_bytes()))
    receipts.append({'file':target.name,'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'targetPriceEUR':edition['amount'],'verifiedEntries':len(data)})
(release/'products-receipt.json').write_text(json.dumps({'sourceRevision':revision,'sourceDirty':dirty,'products':receipts},indent=2)+'\n')
print(json.dumps(receipts,indent=2))
