import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registryDrift } from '../scripts/sync-registry-payload.mjs';

test('every shadcn registry payload embeds its current source file', () => {
  const stale = registryDrift().map((d) => `public/r/${d.payload} -> ${d.path}`);
  assert.deepEqual(stale, [], 'run `pnpm registry:sync` after editing a registry source file');
});
