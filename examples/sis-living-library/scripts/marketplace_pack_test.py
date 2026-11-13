"""Controlled schema fixtures only; these are never delivered as real release evidence."""
import copy
import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest

module_spec = importlib.util.spec_from_file_location('marketplace',Path(__file__).with_name('prepare-marketplace.py'))
marketplace = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(marketplace)
REVISION = 'a'*40


class MarketplaceEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.report = {'schema':'starlight.release_browser_audit.v1','sourceRevision':REVISION,'targetRevision':REVISION,'buildReceipt':{'sourceRevision':REVISION,'sourceDirty':False},'passed':True,'synthetic':True,'labBudgetPassed':True,'scope':'local-production-build','origin':'http://127.0.0.1:4173','checks':[{'name':'fixture schema check','passed':True}],'performance':[{'device':d,'route':r,'sample':s,'fcpMs':100,'lcpMs':100,'cls':0} for d in ['desktop','mobile'] for r in ['console','glass'] for s in [1,2,3]],'productAxe':[{'device':d,'theme':t,'violations':[]} for d in ['desktop','mobile'] for t in ['midnight','daylight','ember']],'artifacts':[]}
        # Header-only bytes deliberately demonstrate container checks cannot approve visual quality.
        for name, dimensions in marketplace.SCREENSHOTS.items():
            raw = b'\x89PNG\r\n\x1a\n'+struct.pack('>I',13)+b'IHDR'+struct.pack('>II',*dimensions)
            (self.root/name).write_bytes(raw)
            self.report['artifacts'].append({'path':name,'bytes':len(raw),'sha256':marketplace.sha(raw),'viewport':{'width':dimensions[0],'height':dimensions[1]},'kind':'unreviewed-audit-capture'})
        self.write()

    def tearDown(self):
        self.temporary.cleanup()

    def write(self):
        (self.root/'audit.json').write_text(json.dumps(self.report))

    def reject(self):
        self.write()
        with self.assertRaises(marketplace.IntegrityError):
            marketplace.collect_evidence(self.root,REVISION)

    def test_schema_fixture_stays_unreviewed_and_source_bound(self):
        report, data = marketplace.collect_evidence(self.root,REVISION)
        self.assertEqual(len(data),3)
        self.assertEqual(report['artifacts'][0]['kind'],'unreviewed-audit-capture')
        with self.assertRaises(marketplace.IntegrityError):
            marketplace.collect_evidence(self.root,'b'*40)

    def test_missing_or_unsuccessful_report_fails(self):
        (self.root/'audit.json').unlink()
        with self.assertRaises(marketplace.IntegrityError):
            marketplace.collect_evidence(self.root,REVISION)
        for field in ['passed','synthetic','labBudgetPassed']:
            saved = self.report[field]; self.report[field] = False; self.reject(); self.report[field] = saved

    def test_build_receipt_stale_or_dirty_fails(self):
        for receipt in [None,{}, {'sourceRevision':'b'*40,'sourceDirty':False},{'sourceRevision':REVISION,'sourceDirty':True}]:
            self.report['buildReceipt'] = receipt; self.reject()

    def test_tokens_and_failed_or_incomplete_samples_fail(self):
        for origin in ['https://user:secret@example.com','https://example.com/?token=private']:
            self.report['origin'] = origin; self.reject()
        self.report['origin'] = 'http://127.0.0.1:4173'
        for value in [None,True,-1,float('nan')]:
            self.report['performance'][0]['lcpMs'] = value; self.reject()
        self.report['performance'].pop(); self.reject()

    def test_incomplete_axe_or_self_approved_capture_fails(self):
        saved = copy.deepcopy(self.report['productAxe'])
        for value in [[None]*6,saved[:-1],[dict(x,violations=[{'id':'contrast'}]) for x in saved]]:
            self.report['productAxe'] = value; self.reject()
        self.report['productAxe'] = saved
        self.report['artifacts'][0]['kind'] = 'approved'; self.reject()

    def test_missing_tampered_linked_or_wrong_viewport_image_fails(self):
        path = self.root/'desktop-glass.png'
        raw = path.read_bytes()
        path.write_bytes(raw+b'tampered'); self.reject()
        path.unlink(); self.reject()
        target = self.root/'elsewhere';target.write_bytes(raw);path.symlink_to(target);self.reject()
        path.unlink();path.write_bytes(raw)
        self.report['artifacts'][0]['viewport']['width'] = 999;self.reject()

    def test_listing_cannot_self_authorize_license_or_platform_release(self):
        original = json.loads((marketplace.ROOT/marketplace.SPEC).read_text())
        marketplace.validate_spec(original,{'amount':79})
        for field,value in [('submissionStatus','published'),('platforms',['framer']),('productId','other')]:
            candidate=copy.deepcopy(original);candidate[field]=value
            with self.assertRaises(marketplace.IntegrityError): marketplace.validate_spec(candidate,{'amount':79})
        candidate=copy.deepcopy(original);candidate['licensing']['status']='approved'
        with self.assertRaises(marketplace.IntegrityError): marketplace.validate_spec(candidate,{'amount':79})


if __name__=='__main__':
    unittest.main()
