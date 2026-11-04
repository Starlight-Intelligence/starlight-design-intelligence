import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('every published source-backed entry matches the locked generator and its file mapping', (t) => {
  const require = createRequire(path.join(root, 'package.json'));
  let cli;
  try {
    cli = require.resolve('shadcn');
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND' || !/^Cannot find module 'shadcn'/.test(String(error.message))) throw error;
    t.skip('shadcn is not installed here; run pnpm test in packages/materials');
    return;
  }
  const temporary = fs.mkdtempSync(path.join(tmpdir(), 'materials-registry-parity-'));
  try {
    const result = spawnSync(process.execPath, [
      cli, 'build', 'registry.json', '--output', temporary,
    ], { cwd: root, encoding: 'utf8', timeout: 60_000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const registry = readJson(path.join(root, 'registry.json'));
    const names = [...registry.items.map((item) => `${item.name}.json`), 'registry.json'].sort();
    assert.deepEqual(fs.readdirSync(temporary).sort(), names);
    assert.deepEqual(fs.readdirSync(path.join(root, 'public/r')).filter((name) => name.endsWith('.json')).sort(), names);
    assert.deepEqual(
      readJson(path.join(root, 'public/r/registry.json')),
      readJson(path.join(temporary, 'registry.json')),
    );
    for (const item of registry.items) {
      const generated = readJson(path.join(temporary, `${item.name}.json`));
      const published = readJson(path.join(root, 'public/r', `${item.name}.json`));
      assert.deepEqual(published, generated, `${item.name} is stale; run pnpm registry:build`);
      assert.deepEqual(
        generated.files.map(({ path, type, target }) => ({ path, type, target })),
        item.files.map(({ path, type, target }) => ({ path, type, target })),
        `${item.name}: generator source-to-install mapping changed`,
      );
      for (const file of generated.files) {
        assert.ok(fs.statSync(path.join(root, file.path)).isFile());
        assert.equal(typeof file.content, 'string');
        if (file.path.endsWith('.css')) {
          assert.equal(file.content, fs.readFileSync(path.join(root, file.path), 'utf8'));
        }
      }
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
