import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';
import { root, routes, verifySources } from '../scripts/design-toolkit.mjs';
import { included, validateSkills } from '../scripts/build-design-plugin.mjs';

test('all six upstream snapshots retain exact source bytes and notices', () => {
  const result = verifySources();
  assert.equal(result.valid, true, result.failures.join('\n'));
  assert.equal(Object.keys(result.sources).length, 6);
});

test('source verification rejects modified, unlocked, missing and symlinked content', () => {
  const dir = mkdtempSync(join(tmpdir(), 'design-toolkit-test-'));
  try {
    cpSync(join(root, 'vendor'), join(dir, 'vendor'), {recursive: true});
    const path = join(dir, 'vendor/image/SKILL.md'), bytes = readFileSync(path);
    writeFileSync(path, Buffer.concat([bytes, Buffer.from('\nchanged')]));
    assert.equal(verifySources(dir).valid, false);
    writeFileSync(path, bytes);
    writeFileSync(join(dir, 'vendor/unlocked.md'), 'unexpected');
    assert.equal(verifySources(dir).valid, false);
    rmSync(join(dir, 'vendor/unlocked.md'));
    const notice = join(dir, 'vendor/impeccable/NOTICE.md'), noticeBytes = readFileSync(notice);
    rmSync(notice); assert.equal(verifySources(dir).valid, false); writeFileSync(notice, noticeBytes);
    rmSync(path); symlinkSync(join(root, 'vendor/image/SKILL.md'), path);
    assert.equal(verifySources(dir).valid, false);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});

test('every callable adapter has matching unique portable metadata', () => {
  const files = new Map(Object.values(routes).map(path => [path, readFileSync(join(root, path))]));
  assert.deepEqual(validateSkills(files).failures, []);
  assert.equal(validateSkills(files).names.length, 6);
  const invalid = new Map([['skills/bad/SKILL.md', Buffer.from('---\nname: other\ndescription: nope\n---\n')]]);
  assert.ok(validateSkills(invalid).failures.length);
});

test('complete style pairs remain available even when upstream index omits a folder', () => {
  const index = JSON.parse(readFileSync(join(root, 'vendor/awesome/index.json'), 'utf8'));
  for (const entry of Object.values(index)) {
    for (const field of ['skillPath', 'designPath']) {
      assert.ok(entry[field].startsWith('skills/'));
      assert.ok(readFileSync(join(root, 'vendor/awesome', entry[field].slice(7))).length);
    }
  }
  const meta = parse(readFileSync(join(root, 'plugin.json'), 'utf8'));
  assert.ok(meta.extensions['com.openai'].interface.shortDescription.length <= 30);
});

test('archive scope excludes host configuration, credentials and generated artifacts', () => {
  for (const path of ['.git/config', '.github/workflows/ci.yml', 'tests/x.mjs', 'node_modules/x.js', 'vendor/x/example.env', 'vendor/x/cache.pyc', '../secret.json']) assert.equal(included(path), false, path);
  for (const path of ['plugin.json', 'skills/design-orchestrator/SKILL.md', 'vendor/impeccable/NOTICE.md', 'brand-packs/frankx/DESIGN.md']) assert.equal(included(path), true, path);
});
