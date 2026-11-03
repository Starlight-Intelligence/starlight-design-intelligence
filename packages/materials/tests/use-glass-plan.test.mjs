// The hook on the server: no window, no matchMedia, and still an answer. Rendered through
// react-dom/server so the test exercises the real useSyncExternalStore server path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVER_PLAN } from '../src/gate/glass-gate.ts';

// The repo root runs `node --test` over every package without installing this package's
// dependencies. react is a peer here, so without it this test skips with a reason instead
// of failing the root suite; `pnpm test` inside packages/materials always runs it.
let react = null;
try {
  react = { ...(await import('react')), renderToString: (await import('react-dom/server')).renderToString };
} catch (err) {
  // Only react or react-dom itself being absent is a reason to skip; a missing transitive
  // package, or any other import error, fails the test.
  const missing = /Cannot find package '([^']+)'/.exec(String(err?.message))?.[1];
  if (err?.code !== 'ERR_MODULE_NOT_FOUND' || !['react', 'react-dom'].includes(missing)) throw err;
  react = null;
}
if (react) react.useGlassPlan = (await import('../src/gate/use-glass-plan.ts')).useGlassPlan;

test('useGlassPlan answers css on the server without touching window', { skip: react ? false : 'react is not installed here; run pnpm test in packages/materials' }, () => {
  const { createElement, renderToString, useGlassPlan } = react;
  function Probe() {
    const plan = useGlassPlan();
    return createElement('span', { 'data-mode': plan.mode, 'data-reason': plan.reason });
  }
  assert.equal(typeof globalThis.window, 'undefined');
  const html = renderToString(createElement(Probe));
  assert.match(html, /data-mode="css"/);
  assert.match(html, /data-reason="server"/);
});

test('the server plan is the css tier, stated as such', () => {
  assert.deepEqual(SERVER_PLAN, { mode: 'css', reason: 'server' });
});
