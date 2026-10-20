// The hook on the server: no window, no matchMedia, and still an answer. Rendered through
// react-dom/server so the test exercises the real useSyncExternalStore server path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useGlassPlan } from '../src/gate/use-glass-plan.ts';
import { SERVER_PLAN } from '../src/gate/glass-gate.ts';

function Probe() {
  const plan = useGlassPlan();
  return createElement('span', { 'data-mode': plan.mode, 'data-reason': plan.reason });
}

test('useGlassPlan answers css on the server without touching window', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  const html = renderToString(createElement(Probe));
  assert.match(html, /data-mode="css"/);
  assert.match(html, /data-reason="server"/);
});

test('the server plan is the css tier, stated as such', () => {
  assert.deepEqual(SERVER_PLAN, { mode: 'css', reason: 'server' });
});
