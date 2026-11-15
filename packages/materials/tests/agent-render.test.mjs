// The agent components on the server: each renders with no window and carries its
// accessibility contract in the markup. Same skip rule as use-glass-plan.test.mjs: the repo
// root runs `node --test` without this package's dependencies, so a missing peer skips
// with a reason; `pnpm test` inside packages/materials always runs these.
import { test } from 'node:test';
import assert from 'node:assert/strict';

//
// Node strips types from .ts but does not compile JSX, so a load hook transpiles the
// package's .tsx sources with the same TypeScript the typecheck uses. Nothing is written
// to disk and no build step is added.
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PEERS = ['react', 'react-dom', 'typescript', 'lucide-react', 'cn', 'radix-ui', 'class-variance-authority'];
let kit = null;
try {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const ts = (await import('typescript')).default;
  registerHooks({
    load(url, context, nextLoad) {
      if (!url.endsWith('.tsx')) return nextLoad(url, context);
      const { outputText } = ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {
        fileName: fileURLToPath(url),
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: true },
      });
      return { format: 'module', source: outputText, shortCircuit: true };
    },
  });
  kit = { h: createElement, render: renderToStaticMarkup, ...(await import('../src/agent/index.ts')) };
} catch (err) {
  const missing = /Cannot find package '([^']+)'/.exec(String(err?.message))?.[1];
  if (err?.code !== 'ERR_MODULE_NOT_FOUND' || !PEERS.includes(missing)) throw err;
}
const skip = kit ? false : 'react and the UI peers are not installed here; run pnpm test in packages/materials';

test('RunStep says its state in words, not only in colour', { skip }, () => {
  const { h, render, RunStep, RunTimeline } = kit;
  const html = render(
    h(RunTimeline, { label: 'Run, 2 steps' },
      h(RunStep, { state: 'needs-approval', title: 'Open a pull request', detail: 'Build', meta: 'waiting' }),
      h(RunStep, { state: 'running', title: 'Write the patch' }),
    ),
  );
  assert.match(html, /<ol[^>]*aria-label="Run, 2 steps"/);
  assert.match(html, /data-state="needs-approval"/);
  assert.match(html, /<span class="sr-only">Needs approval\. <\/span>waiting/, 'custom meta keeps the spoken state');
  assert.match(html, /<li[^>]*data-state="running"[^>]*aria-current="step"/, 'the running step is the current step');
  assert.doesNotMatch(html, /data-state="needs-approval"[^>]*aria-current/, 'a waiting step is not the current step');
  assert.match(html, />Running</, 'no meta falls back to the visible state label');
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 2, 'both state icons are decorative');
});

// cn() reads a custom font size (text-code, text-label-sm) and a colour (text-signal) on one
// element as one group and keeps the last, which silently drops the size. These components
// keep the two apart; this test fails if a refactor puts them back together.
test('type sizes survive next to a colour', { skip }, () => {
  const { h, render, RunStep, CitationMark, MemoryChip } = kit;
  const step = render(h(RunStep, { state: 'running', title: 'Write the patch' }));
  assert.match(step, /<p class="[^"]*text-code[^"]*text-signal[^"]*">/);
  const mark = render(h(CitationMark, { index: 1, sourcesId: 's' }));
  assert.match(mark, /<sup class="[^"]*text-code[^"]*">/);
  assert.match(mark, /<a[^>]*class="[^"]*text-accent-bright/);
  const chip = render(h(MemoryChip, { className: 'text-on-surface' }, 'Used 3 notes'));
  assert.match(chip, /<span class="text-label-sm">Used 3 notes<\/span>/);
});

test('ApprovalGate is a labelled group with its request and its actions', { skip }, () => {
  const { h, render, ApprovalGate } = kit;
  const html = render(
    h(ApprovalGate, { request: 'Build wants to open a pull request.', scope: 'repo.write', note: 'Nothing is written until you choose.' },
      h('button', { type: 'button' }, 'Approve once'),
      h('button', { type: 'button' }, 'Deny'),
    ),
  );
  const labelledby = /aria-labelledby="([^"]+)"/.exec(html)?.[1];
  const describedby = /aria-describedby="([^"]+)"/.exec(html)?.[1];
  assert.ok(labelledby && html.includes(`id="${labelledby}"`), 'the title the group points at exists');
  assert.ok(describedby && html.includes(`id="${describedby}"`), 'the request the group points at exists');
  assert.match(html, /role="group"/);
  assert.ok(html.indexOf('Approve once') < html.indexOf('Deny'), 'approval comes first in reading order');
  assert.match(html, /Nothing is written until you choose\./);
});

test('a citation mark jumps to the source with the same index', { skip }, () => {
  const { h, render, Answer, AnswerBody, AnswerSources, CitationMark, SourceChip } = kit;
  const html = render(
    h(Answer, null,
      h(AnswerBody, null, 'A claim', h(CitationMark, { index: 2, sourcesId: 'a1' })),
      h(AnswerSources, { id: 'a1' },
        h(SourceChip, { index: 1, sourcesId: 'a1', title: 'First', href: 'https://example.com/1' }),
        h(SourceChip, { index: 2, sourcesId: 'a1', title: 'Second', domain: 'example.com', href: 'https://example.com/2' }),
      ),
    ),
  );
  assert.match(html, /href="#a1-2"/);
  assert.match(html, /<li id="a1-2"/);
  assert.match(html, /aria-label="Source 2"/);
  assert.match(html, /href="https:\/\/example\.com\/2"/, 'a source is a link');
});

test('ModelRoute holds an empty slot instead of a redrawn partner mark', { skip }, () => {
  const { h, render, ModelRoute } = kit;
  assert.match(render(h(ModelRoute, { route: 'Auto', detail: 'per step' })), /data-slot="partner-mark-slot"/);
  const withMark = render(h(ModelRoute, { route: 'Search', mark: h('img', { src: '/official.svg', alt: '' }) }));
  assert.doesNotMatch(withMark, /partner-mark-slot/);
  assert.match(withMark, /src="\/official\.svg"/);
});

test('Composer is a real form: a named field, a label and a named submit', { skip }, () => {
  const { h, render, Composer } = kit;
  const html = render(h(Composer, { label: 'Mission', sendLabel: 'Send mission' }));
  const fieldId = /<textarea[^>]*id="([^"]+)"/.exec(html)?.[1];
  assert.ok(fieldId && html.includes(`for="${fieldId}"`), 'the label points at the textarea');
  assert.match(html, /<textarea[^>]*name="prompt"/);
  assert.match(html, /<button[^>]*type="submit"[^>]*aria-label="Send mission"|<button[^>]*aria-label="Send mission"[^>]*type="submit"/);
  assert.match(render(h(Composer, { disabled: true })), /<textarea[^>]*disabled/);
});
