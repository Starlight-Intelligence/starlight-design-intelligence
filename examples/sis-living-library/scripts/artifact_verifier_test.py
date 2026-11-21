"""Adversarial archive fixtures. No network, install, extraction or source execution."""
import argparse
import copy
import gzip
import io
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest
import warnings
import zipfile

from verify_artifact import IntegrityError, PACKAGE_FILE, sha, verify_package, verify_product

ROOT = Path(__file__).resolve().parents[1]
ASSEMBLED_ARCHIVE = None
REVISION = 'a' * 40

EXPECTED_ESSENTIAL_SOURCE = frozenset('''
assets/icons/archive.svg
assets/icons/arrowRight.svg
assets/icons/arrowUpRight.svg
assets/icons/branch.svg
assets/icons/check.svg
assets/icons/close.svg
assets/icons/code.svg
assets/icons/compass.svg
assets/icons/download.svg
assets/icons/eye.svg
assets/icons/grid.svg
assets/icons/layers.svg
assets/icons/link.svg
assets/icons/moon.svg
assets/icons/orbit.svg
assets/icons/pause.svg
assets/icons/play.svg
assets/icons/search.svg
assets/icons/settings.svg
assets/icons/shield.svg
assets/icons/signal.svg
assets/icons/spark.svg
assets/icons/sun.svg
assets/icons/warning.svg
assets/living-theme-sheet.svg
contracts/components.json
docs/ARCHITECTURE.md
docs/BRAND-ADAPTERS.md
docs/INSTALLATION.md
docs/licenses/IBM-Plex-Mono-OFL.txt
docs/licenses/Instrument-Sans-OFL.txt
docs/licenses/Instrument-Serif-OFL.txt
scripts/verify_artifact.py
src/components.css
src/components.tsx
src/css.d.ts
src/icons.tsx
src/index.ts
src/product-components.css
src/product-components.tsx
src/tailwind.css
src/tokens.css
tokens/tokens.json
'''.splitlines()[1:])


def record(name, raw):
    return {'path': name, 'bytes': len(raw), 'sha256': sha(raw)}


def package_fixture(mutate=None, linked=False):
    names = ['index.js','index.d.ts','components.js','components.d.ts','product-components.js','product-components.d.ts','icons.js','icons.d.ts','tokens.css','components.css','product-components.css','tailwind.css','styles.css','tokens.json','component-contracts.json','package.json','README.md','SOURCE-RIGHTS.md','THIRD_PARTY_NOTICES.md']
    data = {name: b'archive fixture' for name in names}
    metadata = {'name':'@starlight/living-design','version':'0.2.0','private':True,'license':'UNLICENSED','peerDependencies':{'react':'^19.0.0','react-dom':'^19.0.0'},'exports':{'.':{'types':'./index.d.ts','import':'./index.js'},'./styles.css':'./styles.css','./tokens.json':'./tokens.json','./tailwind.css':'./tailwind.css','./component-contracts.json':'./component-contracts.json'}}
    if mutate:
        mutate(metadata)
    data['package.json'] = json.dumps(metadata).encode()
    contract = json.loads((ROOT/'contracts/components.json').read_text())
    sources = ['src/components.tsx','src/product-components.tsx','src/components.css','src/product-components.css','src/tokens.css','tokens/tokens.json']
    contract['sourceFiles'] = [record(name,(ROOT/name).read_bytes()) for name in sources]
    data['component-contracts.json'] = json.dumps(contract).encode()
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer,mode='w',format=tarfile.GNU_FORMAT) as archive:
        for name, raw in sorted(data.items()):
            info = tarfile.TarInfo('package/'+name)
            info.size = len(raw)
            if linked and name == 'components.js':
                info.type = tarfile.SYMTYPE
                info.linkname = '../../outside'
                info.size = 0
                archive.addfile(info)
            else:
                archive.addfile(info,io.BytesIO(raw))
    raw = gzip.compress(buffer.getvalue(),mtime=0)
    receipt = {'schema':'starlight.package_receipt.v1','file':PACKAGE_FILE,'bytes':len(raw),'sha256':sha(raw),'sourceRevision':REVISION,'sourceDirty':False,'published':False,'files':[record(name,value) for name,value in sorted(data.items())]}
    return raw, receipt


def product_fixture():
    package, receipt = package_fixture()
    data = {name: (ROOT/name).read_bytes() for name in EXPECTED_ESSENTIAL_SOURCE}
    data['README.md'] = b'Installation instructions'
    data['release/'+PACKAGE_FILE] = package
    data['release/package-receipt.json'] = json.dumps(receipt).encode()
    return data


class ArtifactIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = Path(self.directory.name)/'essential.zip'

    def tearDown(self):
        self.directory.cleanup()

    def write(self, data, manifest_mutate=None, duplicate=False, linked=False):
        manifest = {'schema':'starlight.product_archive.v1','version':'0.2.0-rc.2','sourceRevision':REVISION,'sourceDirty':False,'checkoutActive':False,'edition':'essential','catalogSku':'aurora-ui-kit','license':'UNLICENSED; draft terms only','files':[record(name,raw) for name,raw in sorted(data.items())]}
        if manifest_mutate:
            manifest_mutate(manifest)
        with zipfile.ZipFile(self.path,'w',compression=zipfile.ZIP_DEFLATED) as archive:
            for name, raw in data.items():
                info = zipfile.ZipInfo(name)
                info.compress_type = zipfile.ZIP_DEFLATED
                if linked and name == 'README.md':
                    info.create_system = 3
                    info.external_attr = (stat.S_IFLNK|0o777)<<16
                archive.writestr(info,raw)
            archive.writestr('RELEASE-MANIFEST.json',json.dumps(manifest))
            if duplicate:
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore')
                    archive.writestr('README.md',data['README.md'])
        return self.path

    def test_valid_product_checks_complete_package_and_external_checksum(self):
        self.write(product_fixture())
        result = verify_product(self.path,sha(self.path.read_bytes()))
        self.assertEqual(result['package']['components'],19)
        self.assertEqual(result['trustedChecksum'],'matched')
        self.assertIn('unsigned',result['authenticity'])
        self.assertEqual(result['edition'],'essential')

    def test_essential_archive_matches_buyer_inventory(self):
        # The package CI job supplies the actual assembler output.
        generated = {'README.md', 'RELEASE-MANIFEST.json', 'release/' + PACKAGE_FILE, 'release/package-receipt.json'}
        with zipfile.ZipFile(ASSEMBLED_ARCHIVE or self.write(product_fixture())) as archive:
            self.assertEqual(set(archive.namelist()), EXPECTED_ESSENTIAL_SOURCE | generated)
        data = product_fixture()
        data['docs/FIRST-PRODUCT-LAUNCH-CHECKLIST.md'] = b'Internal seller notes'
        self.write(data)
        with self.assertRaisesRegex(IntegrityError, 'Unexpected or missing customer source'):
            verify_product(self.path)

    def test_wrong_trusted_checksum_and_manifest_tampering_fail(self):
        self.write(product_fixture())
        with self.assertRaises(IntegrityError):
            verify_product(self.path,'0'*64)
        for mutation in [lambda m:m['files'].pop(),lambda m:m['files'].append(m['files'][0]),lambda m:m.update(sourceDirty=True),lambda m:m.update(checkoutActive=True),lambda m:m.update(license='MIT'),lambda m:m.update(edition='professional'),lambda m:m['files'][0].update(bytes=True)]:
            self.write(product_fixture(),mutation)
            with self.assertRaises(IntegrityError):
                verify_product(self.path)

    def test_unsafe_paths_duplicates_and_links_fail_before_extraction(self):
        for name in ['../outside','/absolute','C:/absolute','dir\\file','x/./file','x//file','bad\x00file','x/file.','x/file ','x/CON','x/com1.log','readme.md']:
            data = product_fixture()
            data[name] = b'unsafe'
            self.write(data)
            with self.assertRaises(IntegrityError):
                verify_product(self.path)
        for options in [{'duplicate':True},{'linked':True}]:
            self.write(product_fixture(),**options)
            with self.assertRaises(IntegrityError):
                verify_product(self.path)
        self.assertFalse((Path(self.directory.name)/'outside').exists())

    def test_forged_package_file_receipt_is_rejected_even_with_valid_outer_digest(self):
        data = product_fixture()
        receipt = json.loads(data['release/package-receipt.json'])
        receipt['files'][0]['sha256'] = 'f'*64
        data['release/package-receipt.json'] = json.dumps(receipt).encode()
        self.write(data)
        with self.assertRaisesRegex(IntegrityError,'File integrity mismatch'):
            verify_product(self.path,sha(self.path.read_bytes()))

    def test_changed_editable_source_cannot_disagree_with_compiled_inputs(self):
        data = product_fixture()
        data['src/components.tsx'] += b'changed'
        self.write(data)
        with self.assertRaisesRegex(IntegrityError,'Editable source differs'):
            verify_product(self.path)

    def test_missing_customer_source_and_duplicate_json_keys_are_rejected(self):
        data = product_fixture()
        del data['src/icons.tsx']
        self.write(data)
        with self.assertRaisesRegex(IntegrityError,'missing customer source'):
            verify_product(self.path)
        data = product_fixture()
        data['release/package-receipt.json'] = b'{"schema":"bad","schema":"bad2"}'
        self.write(data)
        with self.assertRaisesRegex(IntegrityError,'Duplicate JSON key'):
            verify_product(self.path)

    def test_tar_links_install_scripts_and_unexpected_exports_are_rejected(self):
        for mutate,linked in [(None,True),(lambda m:m.update(scripts={'postinstall':'do-not-execute'}),False),(lambda m:m['exports'].update({'.':'../../outside'}),False)]:
            package, receipt = package_fixture(mutate,linked)
            with self.assertRaises(IntegrityError):
                verify_package(package,receipt,REVISION)

    def test_package_source_revision_and_inventory_must_match(self):
        package, receipt = package_fixture()
        with self.assertRaises(IntegrityError):
            verify_package(package,receipt,'b'*40)
        for mutate in [lambda r:r['files'].pop(),lambda r:r['files'].append(r['files'][0]),lambda r:r.update(sourceDirty=True),lambda r:r.update(published=True)]:
            modified = copy.deepcopy(receipt)
            mutate(modified)
            with self.assertRaises(IntegrityError):
                verify_package(package,modified,REVISION)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--assembled-archive', type=Path)
    options, unittest_args = parser.parse_known_args()
    ASSEMBLED_ARCHIVE = options.assembled_archive
    unittest.main(argv=[__file__, *unittest_args])
