// The run contract: what state a step can be in, which moves are legal, and which effects
// stop at a gate. No React and no DOM, so the rules run under `node --test` and can be
// shared by a server, a worker and every shell that renders a run.

export type RunState = 'queued' | 'running' | 'needs-approval' | 'done' | 'failed';

export const RUN_STATES: readonly RunState[] = ['queued', 'running', 'needs-approval', 'done', 'failed'];

// The words a person reads, and a screen reader hears, for each state. Colour and icon are
// never the only signal; RunStep always renders this label.
export const runStateLabel: Record<RunState, string> = {
  queued: 'Queued',
  running: 'Running',
  'needs-approval': 'Needs approval',
  done: 'Done',
  failed: 'Failed',
};

// Legal moves. A step waits, runs, may stop at a gate, and ends. `done` and `failed` are
// final: a retry is a new step, so the record of what happened is never rewritten.
// From a gate, approval resumes the step and a denial or a timeout fails it.
const NEXT: Record<RunState, readonly RunState[]> = {
  queued: ['running', 'failed'],
  running: ['needs-approval', 'done', 'failed'],
  'needs-approval': ['running', 'failed'],
  done: [],
  failed: [],
};

export function canTransition(from: RunState, to: RunState): boolean {
  return NEXT[from].includes(to);
}

export function isSettled(state: RunState): boolean {
  return state === 'done' || state === 'failed';
}

// What a tool call does to the world. Reading is free; everything else changes something
// a person owns and waits for them.
export type Effect = 'read' | 'write' | 'send' | 'spend';

export const EFFECTS: readonly Effect[] = ['read', 'write', 'send', 'spend'];

export function needsGate(effect: Effect): boolean {
  return effect !== 'read';
}

export type RunSummary = {
  total: number;
  done: number;
  failed: number;
  /** A step is waiting on a person. Nothing after it has started. */
  blocked: boolean;
  /** Every step has ended. */
  settled: boolean;
  /** One line for a header or a live region, e.g. "2 of 5 steps done. Waiting for approval." */
  label: string;
};

export function summarizeRun(states: readonly RunState[]): RunSummary {
  const total = states.length;
  const done = states.filter((s) => s === 'done').length;
  const failed = states.filter((s) => s === 'failed').length;
  const blocked = states.includes('needs-approval');
  const settled = total > 0 && states.every(isSettled);
  const progress = `${done} of ${total} ${total === 1 ? 'step' : 'steps'} done.`;
  let tail = '';
  if (total === 0) tail = '';
  else if (blocked) tail = ' Waiting for approval.';
  else if (failed > 0) tail = ` ${failed} failed.`;
  else if (states.includes('running')) tail = ' Running.';
  return { total, done, failed, blocked, settled, label: total === 0 ? 'No steps yet.' : progress + tail };
}
