/** Deterministic in-memory simulation. Never call this reducer an execution policy. */
export type MissionState = 'awaiting-approval' | 'ready' | 'running' | 'complete' | 'cancelled' | 'budget-blocked';
export type Command = { id: string; missionId: string; type: 'approve' | 'reject' | 'start' | 'advance' | 'cancel' };
export interface Mission {
  id: string; name: string; role: string; scope: string; state: MissionState;
  approved: boolean; requiresApproval: boolean; steps: string[]; cursor: number;
  tokens: number; cents: number; tokenCap: number; centCap: number;
  tokensPerStep: number; centsPerStep: number;
}
export interface CommandState {
  missions: Mission[]; seen: string[];
  events: { sequence: number; missionId: string; action: string; result: string }[];
}
export function createCommandState(): CommandState {
  return { seen: [], events: [], missions: [
    { id: 'research-014', name: 'Compare inference architectures', role: 'research.compare', scope: 'Knowledge / inference-options.md', state: 'awaiting-approval', requiresApproval: true, approved: false, steps: ['Inspect six fixture references', 'Compare the architecture constraints', 'Prepare the reviewed artifact'], cursor: 0, tokens: 0, cents: 0, tokenCap: 12000, centCap: 6, tokensPerStep: 4000, centsPerStep: 2 },
    { id: 'build-009', name: 'Assemble the launch workspace', role: 'frontend.build', scope: 'Local fixture / launch-preview', state: 'ready', requiresApproval: false, approved: false, steps: ['Read the component contract', 'Assemble the local preview'], cursor: 0, tokens: 0, cents: 0, tokenCap: 8000, centCap: 4, tokensPerStep: 4000, centsPerStep: 2 },
    { id: 'review-007', name: 'Exercise the budget boundary', role: 'quality.review', scope: 'Local fixture / budget-test', state: 'ready', requiresApproval: false, approved: false, steps: ['Inspect the fixture surface', 'Prepare an oversized review'], cursor: 0, tokens: 0, cents: 0, tokenCap: 4000, centCap: 2, tokensPerStep: 4000, centsPerStep: 2 },
  ] };
}
export const missionLabel: Record<MissionState, string> = {
  'awaiting-approval': 'Awaiting approval', ready: 'Ready', running: 'Running', complete: 'Complete', cancelled: 'Cancelled', 'budget-blocked': 'Budget blocked',
};
/** A duplicate command key, stale state or terminal mission cannot accrue usage. */
export function transitionCommand(state: CommandState, command: Command): CommandState {
  if (!command.id || state.seen.includes(command.id) || state.events.length >= 128) return state;
  const target = state.missions.find(m => m.id === command.missionId);
  if (!target) return state;
  let result = 'Ignored: action unavailable in this state';
  let next = { ...target };
  const terminal = ['complete', 'cancelled', 'budget-blocked'].includes(target.state);
  if (!terminal) {
    if (command.type === 'approve' && target.state === 'awaiting-approval') {
      next = { ...target, state: 'ready', approved: true }; result = 'Decision recorded locally';
    } else if (command.type === 'reject' && target.state === 'awaiting-approval') {
      next.state = 'cancelled'; result = 'Scope declined locally';
    } else if (command.type === 'start' && target.state === 'ready' && (!target.requiresApproval || target.approved)) {
      next.state = 'running'; result = 'Local simulation started';
    } else if (command.type === 'cancel') {
      next.state = 'cancelled'; result = 'Local simulation cancelled';
    } else if (command.type === 'advance' && target.state === 'running') {
      if (target.tokens + target.tokensPerStep > target.tokenCap || target.cents + target.centsPerStep > target.centCap) {
        next.state = 'budget-blocked'; result = 'Budget cap held; step not performed';
      } else {
        next.tokens += target.tokensPerStep; next.cents += target.centsPerStep; next.cursor += 1;
        next.state = next.cursor === next.steps.length ? 'complete' : 'running';
        result = `${target.steps[target.cursor]} / fixture step recorded`;
      }
    }
  }
  return { missions: state.missions.map(m => m.id === target.id ? next : m), seen: [...state.seen, command.id], events: [...state.events, { sequence: state.events.length + 1, missionId: target.id, action: command.type, result }] };
}
