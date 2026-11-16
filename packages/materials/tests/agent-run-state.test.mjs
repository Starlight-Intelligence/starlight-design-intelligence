// The run vocabulary is plain data and pure functions, so it is tested without React.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RUN_STATES, isSettled, runStateLabel, summarizeRun } from '../src/agent/run-state.ts';

// The names and labels mirror RunNodeStatus and NODE_STATUS_LABEL in the product's
// run contract (@starlight/agent-client and @starlight/ui). This test pins them so a
// rename here is a deliberate act: change the product contract first, then this list.
test('status names and labels match the product run contract', () => {
  assert.deepEqual([...RUN_STATES], ['idle', 'working', 'waiting', 'done', 'failed']);
  assert.deepEqual(runStateLabel, {
    idle: 'standing by',
    working: 'working',
    waiting: 'waiting for your yes',
    done: 'done',
    failed: 'stopped with an error',
  });
});

test('every state has a distinct spoken label', () => {
  for (const state of RUN_STATES) assert.ok(runStateLabel[state].length > 0, `${state} has no label`);
  assert.equal(new Set(Object.values(runStateLabel)).size, RUN_STATES.length);
});

test('only done and failed are settled', () => {
  assert.deepEqual(RUN_STATES.filter(isSettled), ['done', 'failed']);
});

test('summary: counts, waiting and settled', () => {
  assert.deepEqual(summarizeRun([]), { total: 0, done: 0, failed: 0, waiting: false, settled: false, label: 'No steps yet.' });

  const waiting = summarizeRun(['done', 'done', 'waiting', 'idle', 'idle']);
  assert.equal(waiting.waiting, true);
  assert.equal(waiting.settled, false);
  assert.equal(waiting.label, '2 of 5 steps done. Waiting for your yes.');

  assert.equal(summarizeRun(['done', 'working']).label, '1 of 2 steps done. Working.');

  const finished = summarizeRun(['done']);
  assert.equal(finished.settled, true);
  assert.equal(finished.label, '1 of 1 step done.');

  const broken = summarizeRun(['done', 'failed']);
  assert.equal(broken.settled, true);
  assert.equal(broken.label, '1 of 2 steps done. 1 stopped with an error.');
});

test('summary: a step waiting on a person outranks a failure in the label', () => {
  assert.equal(summarizeRun(['failed', 'waiting']).label, '0 of 2 steps done. Waiting for your yes.');
});

test('summary: idle steps alone add nothing to the label', () => {
  assert.equal(summarizeRun(['idle', 'idle']).label, '0 of 2 steps done.');
});
