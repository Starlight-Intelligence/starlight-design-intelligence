export {
  DESKTOP_QUERY,
  FRAME_BUDGET_MS,
  MIN_DESKTOP_WIDTH,
  MIN_DEVICE_MEMORY_GB,
  PREFERENCE_QUERIES,
  PROBE_FRAMES,
  SERVER_PLAN,
  detectWebgl2,
  gpuPlan,
  medianMs,
  readEnv,
  readPreferences,
  withinBudget,
} from './glass-gate.ts';
export type { GlassEnv, GlassMode, GlassPlan } from './glass-gate.ts';
export { useGlassPlan } from './use-glass-plan.ts';
