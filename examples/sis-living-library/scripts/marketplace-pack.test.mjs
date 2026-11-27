import test from 'node:test';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

test('marketplace review pack rejects missing, stale or tampered evidence and unapproved publication',()=>{
  execFileSync('python3',['-B','scripts/marketplace_pack_test.py'],{cwd:path.resolve(import.meta.dirname,'..'),stdio:'pipe'});
});
