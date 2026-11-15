// The run contract is plain data and pure functions, so it is tested without React.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EFFECTS,
  RUN_STATES,
  canTransition,
  isSettled,
  needsGate,
  runStateLabel,
  summarizeRun,
} from '../src/agent/run-state.ts';

test('every state has a spoken label', () => {
  for (const state of RUN_STATES) {
    assert.equal(typeof runStateLabel[state], 'string');
    assert.ok(runStateLabel[state].length > 0, `${state} has no label`);
  }
  assert.equal(new Set(Object.values(runStateLabel)).size, RUN_STATES.length, 'labels must be distinct');
});

test('a step moves forward and stops at a gate', () => {
  assert.ok(canTransition('queued', 'running'));
  assert.ok(canTransition('running', 'needs-approval'));
  assert.ok(canTransition('needs-approval', 'running'), 'approval resumes the step');
  assert.ok(canTransition('needs-approval', 'failed'), 'a denial fails the step');
  assert.ok(canTransition('running', 'done'));
});

test('a step cannot skip its gate or run backwards', () => {
  assert.equal(canTransition('queued', 'done'), false, 'queued cannot jump to done');
  assert.equal(canTransition('queued', 'needs-approval'), false, 'a gate belongs to a running step');
  assert.equal(canTransition('needs-approval', 'done'), false, 'a gated step must resume before it can finish');
  assert.equal(canTransition('running', 'queued'), false);
});

test('done and failed are final, so the record is never rewritten', () => {
  for (const final of ['done', 'failed']) {
    assert.ok(isSettled(final));
    for (const to of RUN_STATES) assert.equal(canTransition(final, to), false, `${final} -> ${to}`);
  }
  for (const open of ['queued', 'running', 'needs-approval']) assert.equal(isSettled(open), false);
});

test('only reading passes without a gate', () => {
  assert.equal(needsGate('read'), false);
  for (const effect of EFFECTS.filter((e) => e !== 'read')) assert.equal(needsGate(effect), true, effect);
});

test('summary: counts, blocked and settled', () => {
  assert.deepEqual(summarizeRun([]), { total: 0, done: 0, failed: 0, blocked: false, settled: false, label: 'No steps yet.' });

  const waiting = summarizeRun(['done', 'done', 'needs-approval', 'queued', 'queued']);
  assert.equal(waiting.blocked, true);
  assert.equal(waiting.settled, false);
  assert.equal(waiting.label, '2 of 5 steps done. Waiting for approval.');

  const running = summarizeRun(['done', 'running']);
  assert.equal(running.label, '1 of 2 steps done. Running.');

  const finished = summarizeRun(['done']);
  assert.equal(finished.settled, true);
  assert.equal(finished.label, '1 of 1 step done.');

  const broken = summarizeRun(['done', 'failed']);
  assert.equal(broken.settled, true);
  assert.equal(broken.label, '1 of 2 steps done. 1 failed.');
});

test('summary: a waiting gate outranks a failure in the label', () => {
  // A person can still act on the gate; the failure is already final.
  assert.equal(summarizeRun(['failed', 'needs-approval']).label, '0 of 2 steps done. Waiting for approval.');
});
