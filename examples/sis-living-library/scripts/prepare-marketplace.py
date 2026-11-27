#!/usr/bin/env python3
"""Prepare an unpublished React source review pack from verified artifacts and real audit output."""
import argparse
import json
import math
from pathlib import Path
import struct
import subprocess
import sys
from urllib.parse import urlsplit
import zipfile

sys.dont_write_bytecode = True
from verify_artifact import IntegrityError, decode_json, require, sha, verify_product

ROOT = Path(__file__).resolve().parents[1]
SPEC = 'commercial/marketplace-essential.json'
DRAFT = 'docs/COMMERCIAL-LICENSE-DRAFT.md'
CHECKLIST = 'docs/FIRST-PRODUCT-LAUNCH-CHECKLIST.md'
SCREENSHOTS = {'desktop-glass.png': (1440,1000), 'mobile-glass.png': (390,844)}


def validate_spec(spec, offer):
    require(isinstance(spec, dict) and spec.get('schema') == 'starlight.marketplace_submission_spec.v1', 'Invalid marketplace specification')
    require(spec.get('submissionStatus') == 'draft' and spec.get('productId') == 'aurora-ui-kit:essential' and spec.get('edition') == 'essential', 'Marketplace identity or publication state changed')
    require(spec.get('platforms') == ['react-source'], 'Only the implemented React source edition may be prepared')
    require(spec.get('price', {}).get('currency') == 'EUR' and spec.get('price', {}).get('amount') == offer['amount'], 'Marketplace price differs from the offer candidate')
    require(spec.get('licensing', {}).get('draftPath') == DRAFT and spec['licensing'].get('status') == 'UNLICENSED; draft awaiting owner approval', 'Marketplace license approval cannot be inferred')
    for field in ['title','shortDescription','description','primaryAction']:
        require(isinstance(spec.get(field), str) and spec[field].strip(), 'Missing listing copy')
    for field in ['compatibility','support','refund','licensing']:
        require(isinstance(spec.get(field), dict) and spec[field], 'Missing listing policy')
    require(spec['support'].get('status') == 'draft' and spec['refund'].get('status') == 'draft', 'Unapproved service terms')
    return spec


def collect_evidence(directory, revision):
    directory = Path(directory)
    report_file = directory/'audit.json'
    require(report_file.is_file() and not report_file.is_symlink(), 'Real audit.json output is required')
    report_raw = report_file.read_bytes()
    require(len(report_raw) <= 4 * 1024 * 1024, 'Audit report exceeds review-pack limit')
    report = decode_json(report_raw)
    require(isinstance(report, dict) and report.get('schema') == 'starlight.release_browser_audit.v1', 'Invalid release audit schema')
    require(report.get('sourceRevision') == revision and report.get('targetRevision') == revision, 'Audit source/target does not match the final source commit')
    require(report.get('passed') is True and report.get('synthetic') is True and report.get('labBudgetPassed') is True, 'A successful recorded browser audit is required')
    receipt = report.get('buildReceipt')
    require(isinstance(receipt, dict) and receipt.get('sourceRevision') == revision and receipt.get('sourceDirty') is False, 'Audited build receipt does not match the final clean source')
    require(report.get('scope') in {'local-production-build','actual-preview'}, 'Unknown audit scope')
    origin = urlsplit(report.get('origin', ''))
    require(origin.scheme in {'http','https'} and origin.hostname and not origin.username and not origin.password and origin.path in {'','/'} and not origin.query and not origin.fragment, 'Audit origin must omit credentials and share tokens')
    if report['scope'] == 'actual-preview':
        require(origin.scheme == 'https', 'Actual-preview evidence requires HTTPS')
    checks = report.get('checks')
    require(isinstance(checks, list) and checks and all(isinstance(item, dict) and item.get('passed') is True for item in checks), 'Audit contains missing or failed checks')
    performance = report.get('performance')
    expected = {(device, route, sample) for device in ['desktop','mobile'] for route in ['console','glass'] for sample in [1,2,3]}
    require(isinstance(performance, list) and len(performance) == 12, 'Twelve recorded lab samples are required')
    seen = set()
    for item in performance:
        require(isinstance(item, dict) and 'error' not in item, 'Failed performance sample')
        key = (item.get('device'), item.get('route'), item.get('sample'))
        require(key in expected and key not in seen, 'Missing or duplicate lab sample')
        seen.add(key)
        for metric in ['fcpMs','lcpMs','cls']:
            value = item.get(metric)
            require(type(value) in {int,float} and math.isfinite(value) and value >= 0, 'Unknown or invalid lab measurement')
    axe = report.get('productAxe')
    require(isinstance(axe, list) and len(axe) == 6 and all(isinstance(x,dict) for x in axe) and {(x.get('device'),x.get('theme')) for x in axe} == {(d,t) for d in ['desktop','mobile'] for t in ['midnight','daylight','ember']} and all(x.get('violations') == [] for x in axe), 'Essential device/theme accessibility evidence is incomplete')
    artifacts = report.get('artifacts')
    require(isinstance(artifacts, list), 'Audit artifact receipts are missing')
    data = {'evidence/audit.json': report_raw}
    for name, dimensions in SCREENSHOTS.items():
        entries = [x for x in artifacts if isinstance(x, dict) and x.get('path') == name]
        require(len(entries) == 1, 'Screenshot receipt missing or duplicated: ' + name)
        entry = entries[0]
        file = directory/name
        require(file.is_file() and not file.is_symlink(), 'Actual audit screenshot is required: ' + name)
        raw = file.read_bytes()
        require(24 <= len(raw) <= 8 * 1024 * 1024 and raw.startswith(b'\x89PNG\r\n\x1a\n') and raw[12:16] == b'IHDR', 'Invalid PNG container')
        require(struct.unpack('>II', raw[16:24]) == dimensions and entry.get('viewport') == {'width':dimensions[0],'height':dimensions[1]}, 'Screenshot viewport mismatch')
        require(type(entry.get('bytes')) is int and entry['bytes'] == len(raw) and entry.get('sha256') == sha(raw), 'Screenshot integrity mismatch')
        require(entry.get('kind') == 'unreviewed-audit-capture', 'Capture metadata cannot self-approve visual quality')
        data['evidence/'+name] = raw
    return report, data


def prepare(root=ROOT, evidence_dir=None):
    root = Path(root)
    revision = subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    require(not subprocess.check_output(['git','status','--porcelain','--','.'],cwd=root,text=True).strip(), 'Marketplace preparation requires a clean final source commit')
    prefix = subprocess.check_output(['git','rev-parse','--show-prefix'],cwd=root,text=True).strip()
    def source(name):
        return subprocess.check_output(['git','show',revision+':'+prefix+name],cwd=root)
    offers = decode_json(source('commercial/products.json'))
    essential = [x for x in offers['editions'] if x['edition'] == 'essential']
    require(len(essential) == 1, 'Essential offer is not unique')
    offer = essential[0]
    spec_raw = source(SPEC)
    spec = validate_spec(decode_json(spec_raw),offer)
    license_raw = source(DRAFT)
    checklist_raw = source(CHECKLIST)
    require(b'Not an operative grant' in license_raw and b'UNLICENSED' in license_raw, 'License draft must remain explicitly unapproved')
    products = decode_json((root/'release/products-receipt.json').read_bytes())
    require(products.get('sourceRevision') == revision and products.get('sourceDirty') is False, 'Product receipt does not bind to the final clean source')
    filename = offer['archive']+'-'+offers['version']+'.zip'
    entries = [x for x in products.get('products',[]) if x.get('file') == filename]
    require(len(entries) == 1, 'Essential package receipt is missing or duplicated')
    entry = entries[0]
    archive = root/'release'/filename
    artifact = verify_product(archive,entry.get('sha256'))
    require(artifact['sourceRevision'] == revision and artifact['edition'] == 'essential' and archive.stat().st_size == entry.get('bytes'), 'Essential package identity mismatch')
    report, evidence = collect_evidence(evidence_dir or root/'test-results/release-audit',revision)
    data = {'product/'+filename:archive.read_bytes(),'listing/marketplace-essential.json':spec_raw,'terms/COMMERCIAL-LICENSE-DRAFT.md':license_raw,'terms/FIRST-PRODUCT-LAUNCH-CHECKLIST.md':checklist_raw,**evidence}
    data['README.md'] = ("# Glass Core Essential / marketplace review draft\n\nThis is an unpublished React source review pack. Submission status is draft and goLiveEligible is false. Original source remains UNLICENSED; the included source license and service policies require owner approval. No platform submission, payment or entitlement was created.\n\nListing metadata/copy is in listing/. The product ZIP is in product/. Exact-source test evidence and unreviewed audit captures are in evidence/. PNG header/hash checks do not constitute an independent visual verdict. Lab observations are scoped to their report; no field Core Web Vitals or INP claim is made. Framer, Webflow and native Figma components are not supplied.\n\nApproval gates: final license/seller/tax/service terms; real Stripe sandbox purchase-to-entitlement-to-private-download receipt; independently reviewed actual-preview performance and capture evidence.\n").encode()
    manifest = {'schema':'starlight.marketplace_review_pack.v1','sourceRevision':revision,'productId':spec['productId'],'edition':'essential','version':offers['version'],'platforms':['react-source'],'submissionStatus':'draft','goLiveEligible':False,'artifact':artifact,'auditScope':report['scope'],'visualReview':'captures require independent acceptance','blockers':['Owner-approved license, seller identity, tax display and service terms','Real Stripe sandbox purchase, verified webhook, durable entitlement and private download receipt','Independently reviewed actual-preview performance and capture evidence'],'files':[{'path':name,'bytes':len(raw),'sha256':sha(raw)} for name,raw in sorted(data.items())]}
    data['SUBMISSION-MANIFEST.json'] = (json.dumps(manifest,indent=2)+'\n').encode()
    output = root/'release/marketplace'/('starlight-glass-core-essential-'+offers['version']+'-submission-draft.zip')
    output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name, raw in sorted(data.items()):
            info = zipfile.ZipInfo(name,date_time=(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
            z.writestr(info,raw)
    with zipfile.ZipFile(output) as z:
        require(set(z.namelist()) == set(data), 'Marketplace output file set changed')
        for item in manifest['files']:
            raw=z.read(item['path']);require(len(raw)==item['bytes'] and sha(raw)==item['sha256'],'Marketplace output integrity mismatch')
    return {'file':str(output),'sha256':sha(output.read_bytes()),'bytes':output.stat().st_size,'sourceRevision':revision,'submissionStatus':'draft','goLiveEligible':False,'auditScope':report['scope']}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence-dir',type=Path,help='Actual release-browser-audit output; defaults to test-results/release-audit')
    args=parser.parse_args()
    try:
        print(json.dumps(prepare(evidence_dir=args.evidence_dir),indent=2))
    except (IntegrityError,OSError,subprocess.CalledProcessError,KeyError,TypeError,ValueError) as error:
        print('Marketplace review pack blocked: '+str(error),file=sys.stderr);return 1
    return 0


if __name__=='__main__':
    sys.exit(main())
