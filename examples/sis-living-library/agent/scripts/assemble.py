"""Deterministic private add-on source archive. No publish or provider operation."""
from pathlib import Path
import hashlib, json, subprocess, zipfile
root = Path(__file__).resolve().parents[1]
release = root / 'release'
receipt = json.loads((release/'package-receipt.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
tracked = subprocess.check_output(['git','ls-files','-z','.'],cwd=root).decode().split('\0')
data = {}
for name in filter(None, tracked):
    file = root/name
    if file.is_symlink() or not file.is_file() or any(part in {'.git','node_modules'} for part in file.parts): raise ValueError('Invalid source entry')
    if file.name.startswith('.env') or file.suffix in {'.pem','.key'}: raise ValueError('Forbidden source entry')
    data[name] = file.read_bytes()
for file in sorted((root/'dist').iterdir()):
    if file.is_symlink() or not file.is_file(): raise ValueError('Invalid compiled entry')
    data['dist/'+file.name] = file.read_bytes()
for name in ['starlight-living-design-0.2.0.tgz', receipt['file'], 'dependency-inventory.json','package-receipt.json']:
    data['release/'+name] = (release/name).read_bytes()
manifest = {'schema':'starlight.agent_source_archive.v1','sourceRevision':receipt['sourceRevision'],'version':'0.1.0-rc.1','license':'UNLICENSED','checkoutActive':False,'files':[{'path':name,'bytes':len(raw),'sha256':sha(raw)} for name,raw in sorted(data.items())]}
data['RELEASE-MANIFEST.json'] = (json.dumps(manifest,indent=2)+'\n').encode()
target = release/'starlight-living-agent-ui-0.1.0-rc.1-source.zip'
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for name,raw in sorted(data.items()):
        info = zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED; info.external_attr=0o100644<<16
        archive.writestr(info,raw)
with zipfile.ZipFile(target) as archive:
    if len(archive.namelist()) != len(set(archive.namelist())) or set(archive.namelist()) != set(data): raise ValueError('Archive inventory differs')
    for entry in manifest['files']:
        raw=archive.read(entry['path'])
        if len(raw)!=entry['bytes'] or sha(raw)!=entry['sha256']: raise ValueError('Archive entry differs')
result={'file':target.name,'bytes':target.stat().st_size,'sha256':sha(target.read_bytes()),'verifiedEntries':len(data),'sourceRevision':receipt['sourceRevision'],'license':'UNLICENSED','checkoutActive':False}
(release/'source-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
