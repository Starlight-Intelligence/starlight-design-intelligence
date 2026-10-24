'use client';

import * as React from 'react';
import { GlassSurface, type GlassState } from '@starlight/materials/glass';

// The client island. The Server Component page passes the panel's contents as children;
// this only adds the readout under the scene, which is the lab's "which glass is running
// and why" line, with the measured probe median when the WebGL tier ran.
export function GlassDemo({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<GlassState>({ mode: 'css', reason: 'server' });
  const label =
    state.mode === 'webgl'
      ? `three.js refraction, ${state.frameMs?.toFixed(2)} ms median probe frame`
      : `CSS glass (${state.reason}${state.frameMs !== undefined ? `, ${state.frameMs.toFixed(2)} ms` : ''})`;
  return (
    <>
      <GlassSurface
        poster="/poster.png"
        posterAlt="A studio window at night: a gold horizon under an ink sky, a lamp low on the left, a cold glow upper right."
        posterWidth={1440}
        posterHeight={900}
        onPlan={setState}
        className="grid min-h-[70svh] items-end p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,1fr)_minmax(0,4fr)] md:items-center md:px-20 md:pb-16"
        panelClassName="md:col-start-3 md:self-start md:mt-[4vh] md:rounded-[40px] md:p-8"
      >
        {children}
      </GlassSurface>
      <p className="mx-auto max-w-[1120px] px-4 py-4 font-mono text-code opacity-70 md:px-8" aria-live="polite">
        Glass: {label}
      </p>
    </>
  );
}
