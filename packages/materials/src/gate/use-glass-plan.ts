import { useSyncExternalStore } from 'react';
import {
  DESKTOP_QUERY,
  PREFERENCE_QUERIES,
  SERVER_PLAN,
  detectWebgl2,
  gpuPlan,
  readPreferences,
  type GlassPlan,
} from './glass-gate.ts';

// One cached plan per distinct answer, so useSyncExternalStore sees a stable reference and
// a resize that changes nothing does not re-render every glass surface on the page.
const plans = new Map<string, GlassPlan>();

function snapshot(): GlassPlan {
  // detectWebgl2 probes once per window and releases its context; the preferences are
  // re-read on every snapshot because they do change.
  const plan = gpuPlan({ webgl2: detectWebgl2(window), ...readPreferences(window) });
  const key = `${plan.mode}:${plan.reason}`;
  let cached = plans.get(key);
  if (!cached) {
    cached = plan;
    plans.set(key, cached);
  }
  return cached;
}

function subscribe(onChange: () => void): () => void {
  const lists = [...PREFERENCE_QUERIES, DESKTOP_QUERY].map((q) => window.matchMedia(q));
  for (const l of lists) l.addEventListener('change', onChange);
  const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
  conn?.addEventListener?.('change', onChange);
  return () => {
    for (const l of lists) l.removeEventListener('change', onChange);
    conn?.removeEventListener?.('change', onChange);
  };
}

function serverSnapshot(): GlassPlan {
  return SERVER_PLAN;
}

// SSR-safe: the server and the hydrating client both answer { mode: 'css', reason: 'server' },
// then the client re-renders with the measured plan. Re-evaluates when a preference, the
// desktop breakpoint or data saver changes, which is exactly the list a mounted surface
// tears down on.
export function useGlassPlan(): GlassPlan {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
