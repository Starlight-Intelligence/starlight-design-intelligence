import test from 'node:test';
import assert from 'node:assert/strict';
import {createCommandState, transitionCommand} from '../src/command-model.ts';
const apply = (s, type, id, missionId = 'research-014') => transitionCommand(s, {type, id, missionId});

test('write scope cannot start before approval and approval alone accrues no usage', () => {
  let s = apply(createCommandState(), 'start', 'premature');
  assert.equal(s.missions[0].state, 'awaiting-approval');
  s = apply(s, 'approve', 'approval');
  assert.equal(s.missions[0].state, 'ready');
  assert.equal(s.missions[0].tokens, 0);
  assert.equal(s.missions[0].scope, 'Knowledge / inference-options.md');
});
test('duplicate step key is idempotent, including history and totals', () => {
  let s = apply(apply(createCommandState(), 'approve', 'approve'), 'start', 'start');
  s = apply(s, 'advance', 'one-step');
  assert.strictEqual(apply(s, 'advance', 'one-step'), s);
  assert.equal(s.missions[0].tokens, 4000);
  assert.equal(s.events.length, 3);
});
test('caps permit the exact boundary and reject the next step before accruing usage', () => {
  let s = apply(createCommandState(), 'start', 'start', 'review-007');
  s = apply(s, 'advance', 'step-1', 'review-007');
  s = apply(s, 'advance', 'step-2', 'review-007');
  assert.equal(s.missions[2].state, 'budget-blocked');
  assert.equal(s.missions[2].cursor, 1);
  assert.equal(s.missions[2].tokens, 4000);
  assert.equal(s.missions[2].cents, 2);
});
test('cost cap independently blocks an otherwise affordable token step', () => {
  const s = createCommandState();
  s.missions[1] = {...s.missions[1], centCap: 1};
  const next = apply(apply(s, 'start', 'start', 'build-009'), 'advance', 'step', 'build-009');
  assert.equal(next.missions[1].state, 'budget-blocked');
  assert.equal(next.missions[1].tokens, 0);
});
test('cancelled, declined and completed work cannot resume or incur additional cost', () => {
  let s = apply(createCommandState(), 'reject', 'reject');
  s = apply(s, 'approve', 'late-approval');
  assert.equal(s.missions[0].state, 'cancelled');
  s = apply(s, 'start', 'start', 'build-009');
  s = apply(s, 'cancel', 'cancel', 'build-009');
  s = apply(s, 'advance', 'late-step', 'build-009');
  assert.equal(s.missions[1].tokens, 0);
  let complete = apply(createCommandState(), 'start', 'start', 'build-009');
  complete = apply(apply(complete, 'advance', 'step-1', 'build-009'), 'advance', 'step-2', 'build-009');
  const late = apply(complete, 'advance', 'late', 'build-009');
  assert.equal(late.missions[1].state, 'complete');
  assert.equal(late.missions[1].tokens, 8000);
  assert.equal(late.missions[1].cents, 4);
});
test('approval binds one mission and unknown identities cannot mutate the registry', () => {
  const s = createCommandState();
  assert.strictEqual(apply(s, 'approve', 'bad', 'nonexistent'), s);
  const next = apply(s, 'approve', 'good');
  assert.equal(next.missions[0].approved, true);
  assert.equal(next.missions[1].approved, false);
  assert.equal(s.missions[0].approved, false);
});

test('local command log has a hard 128-event ceiling', () => {
  let s = createCommandState();
  for (let i = 0; i < 200; i++) s = apply(s, 'start', `event-${i}`);
  assert.equal(s.events.length, 128);
  assert.equal(s.seen.length, 128);
  assert.equal(s.missions[0].tokens, 0);
});
