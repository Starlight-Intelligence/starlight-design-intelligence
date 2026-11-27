// The words a run is shown in. This file is presentation vocabulary, not a run contract.
//
// The authority for run state is the product's run contract: `RunNodeStatus` in
// `@starlight/agent-client`, in the Starlight application repository. That package owns the
// reducer, the legal moves and the approval rules. The status names and labels below mirror
// it exactly so a view built here reads the same as the product; if the two ever differ, the
// product contract wins and this file is the one to change. Nothing here decides whether a
// step may move or whether an action needs approval.
//
// No React and no DOM, so the summary runs under `node --test`.

export type RunState = 'idle' | 'working' | 'waiting' | 'done' | 'failed';

export const RUN_STATES: readonly RunState[] = ['idle', 'working', 'waiting', 'done', 'failed'];

// What a person reads, and a screen reader hears, for each state. Colour and icon are never
// the only signal; RunStep always renders this label. `waiting` means waiting on a person.
export const runStateLabel: Record<RunState, string> = {
  idle: 'standing by',
  working: 'working',
  waiting: 'waiting for your yes',
  done: 'done',
  failed: 'stopped with an error',
};

export function isSettled(state: RunState): boolean {
  return state === 'done' || state === 'failed';
}

export type RunSummary = {
  total: number;
  done: number;
  failed: number;
  /** A step is waiting on a person. */
  waiting: boolean;
  /** Every step has ended. */
  settled: boolean;
  /** One line for a header or a live region, e.g. "2 of 5 steps done. Waiting for your yes." */
  label: string;
};

// A one-line reading of a list of step states. A step waiting on a person outranks a
// failure in the label: the person can still act on the first, and the second is final.
export function summarizeRun(states: readonly RunState[]): RunSummary {
  const total = states.length;
  const done = states.filter((s) => s === 'done').length;
  const failed = states.filter((s) => s === 'failed').length;
  const waiting = states.includes('waiting');
  const settled = total > 0 && states.every(isSettled);
  if (total === 0) return { total, done, failed, waiting, settled, label: 'No steps yet.' };
  const progress = `${done} of ${total} ${total === 1 ? 'step' : 'steps'} done.`;
  let tail = '';
  if (waiting) tail = ' Waiting for your yes.';
  else if (failed > 0) tail = ` ${failed} stopped with an error.`;
  else if (states.includes('working')) tail = ' Working.';
  return { total, done, failed, waiting, settled, label: progress + tail };
}
