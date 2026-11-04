import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const payload = JSON.parse(fs.readFileSync(path.join(root, 'public/r/materials-styles.json'), 'utf8'));

test('published materials-style registry embeds the current source files byte for byte', () => {
  assert.equal(payload.name, 'materials-styles');
  assert.deepEqual(payload.files.map((file) => file.path), [
    'src/tokens/tokens.css',
    'src/tokens/theme.css',
    'src/styles/materials.css',
  ]);
  for (const file of payload.files) {
    const sourcePath = path.join(root, file.path);
    const source = fs.readFileSync(sourcePath, 'utf8');
    assert.equal(file.content, source, `${file.path} in the registry is stale; run pnpm registry:build`);
  }
});
