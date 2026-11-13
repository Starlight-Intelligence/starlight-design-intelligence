#!/usr/bin/env python3
"""Offline integrity check. Never extracts files, executes source, or grants a license."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import stat
import sys
import tarfile
import zipfile
import zlib

MAX_ARCHIVE = 16 * 1024 * 1024
MAX_EXPANDED = 64 * 1024 * 1024
MAX_FILE = 8 * 1024 * 1024
PACKAGE_FILE = 'starlight-living-design-0.2.0.tgz'
PACKAGE_NAME = '@starlight/living-design'
PACKAGE_VERSION = '0.2.0'
PRODUCT_VERSION = '0.2.0-rc.2'
EDITIONS = {'essential': 'aurora-ui-kit', 'professional': 'aurora-ui-kit', 'agent-command-center': 'command-center-template'}


class IntegrityError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise IntegrityError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def safe_path(name):
    require(isinstance(name, str) and len(name) <= 240, 'Invalid archive path')
    require(not any(c in name for c in '\\:\x00') and not name.startswith('/'), 'Unsafe archive path')
    require(all(part not in {'', '.', '..'} for part in name.split('/')), 'Unsafe archive path')
    require(not any(ord(c) < 32 for c in name), 'Control character in archive path')
    reserved = {'con','prn','aux','nul'} | {'com'+str(i) for i in range(1,10)} | {'lpt'+str(i) for i in range(1,10)}
    require(all(not part.endswith((' ','.')) and part.split('.')[0].casefold() not in reserved for part in name.split('/')), 'Platform-ambiguous archive path')
    return name


def decode_json(raw):
    def unique(pairs):
        value = {}
        for key, item in pairs:
            require(key not in value, 'Duplicate JSON key')
            value[key] = item
        return value
    try:
        return json.loads(raw, object_pairs_hook=unique)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise IntegrityError('Invalid JSON') from error


def inventory(records):
    require(isinstance(records, list) and 0 < len(records) <= 1024, 'Invalid file inventory')
    result = {}
    folded = set()
    for entry in records:
        require(isinstance(entry, dict) and set(entry) == {'path', 'bytes', 'sha256'}, 'Invalid file receipt')
        name = safe_path(entry['path'])
        require(name.casefold() not in folded, 'Duplicate or case-colliding file receipt')
        folded.add(name.casefold())
        require(type(entry['bytes']) is int and 0 <= entry['bytes'] <= MAX_FILE, 'Invalid byte length')
        require(isinstance(entry['sha256'], str) and re.fullmatch('[a-f0-9]{64}', entry['sha256']), 'Invalid file digest')
        result[name] = entry
    return result


def verify_inventory(files, records):
    expected = inventory(records)
    require(set(files) == set(expected), 'Archive and receipt file sets differ')
    for name, raw in files.items():
        entry = expected[name]
        require(len(raw) == entry['bytes'] and sha(raw) == entry['sha256'], 'File integrity mismatch: ' + name)


def expanded_gzip(raw):
    require(len(raw) <= MAX_ARCHIVE, 'Package exceeds compressed limit')
    try:
        decoder = zlib.decompressobj(16 + zlib.MAX_WBITS)
        result = decoder.decompress(raw, MAX_EXPANDED + 1)
        require(len(result) <= MAX_EXPANDED and decoder.eof and not decoder.unconsumed_tail and not decoder.unused_data, 'Invalid or oversized gzip stream')
        return result
    except zlib.error as error:
        raise IntegrityError('Invalid gzip stream') from error


def verify_package(raw, receipt, revision=None):
    """Validate every tar member against a supplied unsigned package receipt."""
    require(isinstance(receipt, dict) and receipt.get('schema') == 'starlight.package_receipt.v1', 'Invalid package receipt')
    require(receipt.get('file') == PACKAGE_FILE and receipt.get('bytes') == len(raw) and receipt.get('sha256') == sha(raw), 'Package receipt mismatch')
    require(receipt.get('published') is False and receipt.get('sourceDirty') is False, 'Package is not a clean private candidate')
    require(isinstance(receipt.get('sourceRevision'), str) and re.fullmatch('[a-f0-9]{40}', receipt['sourceRevision']), 'Invalid package revision')
    if revision is not None:
        require(receipt['sourceRevision'] == revision, 'Package/product revision mismatch')
    files = {}
    folded = set()
    try:
        with tarfile.open(fileobj=io.BytesIO(expanded_gzip(raw)), mode='r:') as archive:
            for member in archive:
                require(len(files) < 64 and member.isreg() and not member.pax_headers, 'Unexpected tar member type or count')
                safe_path(member.name)
                require(member.name.startswith('package/'), 'Package member outside package root')
                name = member.name[len('package/'):]
                safe_path(name)
                require(name.casefold() not in folded and 0 <= member.size <= MAX_FILE, 'Duplicate or oversized tar member')
                folded.add(name.casefold())
                stream = archive.extractfile(member)
                require(stream is not None, 'Unreadable package member')
                files[name] = stream.read(MAX_FILE + 1)
                require(len(files[name]) == member.size, 'Truncated tar member')
    except (tarfile.TarError, EOFError) as error:
        raise IntegrityError('Invalid tar archive') from error
    verify_inventory(files, receipt.get('files'))
    allowed = {
        'index.js', 'index.d.ts', 'components.js', 'components.d.ts', 'product-components.js', 'product-components.d.ts',
        'icons.js', 'icons.d.ts', 'tokens.css', 'components.css', 'product-components.css', 'tailwind.css', 'styles.css',
        'tokens.json', 'component-contracts.json', 'package.json', 'README.md', 'SOURCE-RIGHTS.md', 'THIRD_PARTY_NOTICES.md',
    }
    require(set(files) == allowed, 'Unexpected compiled package inventory')
    package = decode_json(files['package.json'])
    require(isinstance(package, dict), 'Invalid package metadata')
    require(package.get('name') == PACKAGE_NAME and package.get('version') == PACKAGE_VERSION and package.get('private') is True and package.get('license') == 'UNLICENSED', 'Package identity or source rights changed')
    require('scripts' not in package and 'dependencies' not in package, 'Unexpected install scripts or runtime dependencies')
    require(package.get('peerDependencies') == {'react': '^19.0.0', 'react-dom': '^19.0.0'}, 'Unexpected peer requirements')
    require(package.get('exports') == {
        '.': {'types': './index.d.ts', 'import': './index.js'}, './styles.css': './styles.css', './tokens.json': './tokens.json',
        './tailwind.css': './tailwind.css', './component-contracts.json': './component-contracts.json',
    }, 'Unexpected package export targets')
    contract = decode_json(files['component-contracts.json'])
    require(isinstance(contract, dict), 'Invalid component metadata')
    require(contract.get('schema') == 'starlight.component_registry.v1' and contract.get('version') == PACKAGE_VERSION, 'Invalid component contract')
    require(contract.get('authority') == {'discovery': 'read-only', 'filesystem': False, 'payment': False, 'deployment': False, 'execution': False}, 'Component discovery authority changed')
    components = contract.get('components')
    require(isinstance(components, list) and len(components) == 19 and all(isinstance(c, dict) and isinstance(c.get('id'), str) for c in components), 'Invalid component count or identity')
    require(len({c['id'] for c in components}) == 19, 'Duplicate component identity')
    require({c['id'] for c in components} == {'GlassSurface', 'StarlightButton', 'StatusBadge', 'AgentPresence', 'EvidenceDisclosure', 'TextField', 'Toggle', 'Tabs', 'CommandPanel', 'EmptyState', 'Skeleton', 'ProgressMeter', 'ModelSelector', 'UsageDisplay', 'ApprovalCard', 'DataTable', 'WalletPortfolio', 'PricingCard', 'CheckoutSummary'}, 'Unexpected component exports')
    source_files = inventory(contract.get('sourceFiles'))
    require(set(source_files) == {'src/components.tsx','src/product-components.tsx','src/components.css','src/product-components.css','src/tokens.css','tokens/tokens.json'}, 'Unexpected package source inventory')
    return {'files': len(files), 'sha256': sha(raw), 'version': package['version'], 'components': 19, 'sourceFiles': list(source_files.values())}


def verify_product(file, expected_sha=None):
    file = Path(file)
    require(file.is_file() and not file.is_symlink() and file.stat().st_size <= MAX_ARCHIVE, 'Invalid or oversized product archive')
    raw = file.read_bytes()
    if expected_sha is not None:
        require(re.fullmatch('[a-f0-9]{64}', expected_sha) and sha(raw) == expected_sha, 'Trusted product checksum mismatch')
    files = {}
    folded = set()
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            require(0 < len(archive.infolist()) <= 1024, 'Invalid ZIP entry count')
            expanded = 0
            for entry in archive.infolist():
                name = safe_path(entry.filename)
                mode = entry.external_attr >> 16
                require(name.casefold() not in folded and not entry.is_dir() and stat.S_IFMT(mode) in {0, stat.S_IFREG}, 'Duplicate or nonregular ZIP entry')
                folded.add(name.casefold())
                require(not entry.flag_bits & 1 and entry.file_size <= MAX_FILE, 'Encrypted or oversized ZIP entry')
                expanded += entry.file_size
                require(expanded <= MAX_EXPANDED, 'ZIP exceeds expanded size limit')
                files[name] = archive.read(entry)
    except (zipfile.BadZipFile, RuntimeError, NotImplementedError) as error:
        raise IntegrityError('Invalid ZIP archive') from error
    require('RELEASE-MANIFEST.json' in files, 'Missing release manifest')
    manifest = decode_json(files.pop('RELEASE-MANIFEST.json'))
    require(isinstance(manifest, dict), 'Invalid product metadata')
    require(manifest.get('schema') == 'starlight.product_archive.v1' and manifest.get('version') == PRODUCT_VERSION, 'Invalid product manifest version')
    require(manifest.get('sourceDirty') is False and manifest.get('checkoutActive') is False, 'Candidate gate changed')
    require(isinstance(manifest.get('sourceRevision'), str) and re.fullmatch('[a-f0-9]{40}', manifest['sourceRevision']), 'Invalid product revision')
    edition = manifest.get('edition')
    require(edition in EDITIONS and manifest.get('catalogSku') == EDITIONS[edition], 'Invalid edition/catalog mapping')
    require(manifest.get('license') == 'UNLICENSED; draft terms only', 'Source rights changed')
    verify_inventory(files, manifest.get('files'))
    package_path = 'release/' + PACKAGE_FILE
    require(package_path in files and 'release/package-receipt.json' in files, 'Missing compiled package or receipt')
    package = verify_package(files[package_path], decode_json(files['release/package-receipt.json']), manifest['sourceRevision'])
    required = {'README.md','docs/INSTALLATION.md','src/index.ts','src/components.tsx','src/product-components.tsx','src/icons.tsx','src/css.d.ts','src/tokens.css','src/components.css','src/product-components.css','src/tailwind.css','tokens/tokens.json','contracts/components.json','scripts/verify_artifact.py'}
    require(required.issubset(files), 'Required customer source or verifier is missing')
    if edition in {'professional','agent-command-center'}:
        require({'examples/next-app/package.json','examples/next-app/package-lock.json','examples/next-app/app/page.tsx'}.issubset(files), 'Missing Next.js consumer')
        lock = decode_json(files['examples/next-app/package-lock.json'])
        dependency = lock.get('packages', {}).get('node_modules/' + PACKAGE_NAME, {})
        import base64
        require(dependency.get('integrity') == 'sha512-' + base64.b64encode(hashlib.sha512(files[package_path]).digest()).decode() and dependency.get('resolved') == 'file:../../release/' + PACKAGE_FILE, 'Stale Next.js consumer package integrity')
    if edition == 'agent-command-center':
        require({'package.json','package-lock.json','src/Experiences.tsx','src/command-model.ts'}.issubset(files), 'Missing Command Center application')
    for entry in package.pop('sourceFiles'):
        require(entry['path'] in files and len(files[entry['path']]) == entry['bytes'] and sha(files[entry['path']]) == entry['sha256'], 'Editable source differs from compiled package input')
    return {'schema': 'starlight.artifact_integrity.v1', 'file': file.name, 'sha256': sha(raw), 'sourceRevision': manifest['sourceRevision'], 'edition': edition, 'files': len(files) + 1, 'package': package, 'trustedChecksum': 'matched' if expected_sha else 'not-supplied', 'authenticity': 'unsigned; verify expected checksum through a trusted seller channel', 'license': 'UNLICENSED; no sale or redistribution permission granted'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--sha256', help='Expected product ZIP SHA-256 obtained through a trusted seller channel')
    args = parser.parse_args()
    try:
        print(json.dumps(verify_product(args.archive, args.sha256), indent=2))
    except (IntegrityError, OSError, TypeError, KeyError) as error:
        print('Artifact verification failed: ' + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
