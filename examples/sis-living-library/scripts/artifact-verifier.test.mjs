import test from 'node:test';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

test('offline product verifier rejects tampered archives, receipts, source and install authority',()=>{
  execFileSync('python3',['-B','scripts/artifact_verifier_test.py'],{cwd:path.resolve(import.meta.dirname,'..'),stdio:'pipe'});
});
