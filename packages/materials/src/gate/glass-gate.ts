// The gpu-artist contract as code: WebGL only when the device, the reader's preferences
// and a measured frame cost all allow it. Anything else keeps the CSS glass.
//
// Ported from starlight-web-studio examples/gpu-glass/glass-gate.mjs (2026-10-20) with the
// same thresholds and the same seven tests, so a decision made in the lab still holds here.

export const FRAME_BUDGET_MS = 8;
export const MIN_DESKTOP_WIDTH = 900;
export const MIN_DEVICE_MEMORY_GB = 4;
export const PROBE_FRAMES = 12;

export type GlassMode = 'css' | 'webgl';

export interface GlassPlan {
  mode: GlassMode;
  reason: string;
}

export interface GlassEnv {
  webgl2: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  saveData: boolean;
  // navigator.deviceMemory is Chromium-only; absent means unknown, not low.
  deviceMemory: number | undefined;
  viewportWidth: number;
}

export function gpuPlan(env: GlassEnv): GlassPlan {
  if (!env.webgl2) return { mode: 'css', reason: 'no WebGL2' };
  if (env.reducedMotion) return { mode: 'css', reason: 'reduced motion requested' };
  if (env.reducedTransparency) return { mode: 'css', reason: 'reduced transparency requested' };
  if (env.saveData) return { mode: 'css', reason: 'data saver on' };
  if (typeof env.deviceMemory === 'number' && env.deviceMemory < MIN_DEVICE_MEMORY_GB) {
    return { mode: 'css', reason: `device memory ${env.deviceMemory} GB` };
  }
  if (env.viewportWidth < MIN_DESKTOP_WIDTH) return { mode: 'css', reason: 'phone layout' };
  return { mode: 'webgl', reason: 'capable' };
}

// Median, so one slow first frame (shader compile) cannot fail the probe on its own.
export function medianMs(samples: readonly number[]): number {
  const valid = samples.filter((n) => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
  if (!valid.length) return Infinity;
  const mid = valid.length >> 1;
  const hi = valid[mid] as number;
  const lo = valid[mid - 1] as number;
  return valid.length % 2 ? hi : (lo + hi) / 2;
}

export function withinBudget(samples: readonly number[], budgetMs: number = FRAME_BUDGET_MS): boolean {
  return medianMs(samples) <= budgetMs;
}

// The preference queries the gate reads. A change to any of them after mount is a reason
// to tear WebGL down, so the hook subscribes to exactly this list.
export const PREFERENCE_QUERIES = [
  '(prefers-reduced-motion: reduce)',
  '(prefers-reduced-transparency: reduce)',
] as const;
export const DESKTOP_QUERY = `(min-width: ${MIN_DESKTOP_WIDTH}px)`;

interface NavigatorWithHints extends Navigator {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

export function readEnv(win: Window & typeof globalThis): GlassEnv {
  const mq = (q: string) => win.matchMedia(q).matches;
  let webgl2 = false;
  try {
    webgl2 = !!win.document.createElement('canvas').getContext('webgl2');
  } catch {
    webgl2 = false;
  }
  const nav = win.navigator as NavigatorWithHints;
  return {
    webgl2,
    reducedMotion: mq(PREFERENCE_QUERIES[0]),
    reducedTransparency: mq(PREFERENCE_QUERIES[1]),
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    viewportWidth: win.innerWidth,
  };
}

// What the server, and the first client render, always answer. Refusing by default means a
// hydration mismatch is impossible and the poster is what paints first.
export const SERVER_PLAN: GlassPlan = { mode: 'css', reason: 'server' };
