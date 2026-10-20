'use client';

import * as React from 'react';
import { cn } from 'cn';
import { SERVER_PLAN } from '../gate/glass-gate.ts';
import { useGlassPlan } from '../gate/use-glass-plan.ts';
import { materialSurface } from '../primitives/material.ts';
import { mountGlass, type GlassState } from './mount-glass.ts';

export interface GlassSurfaceProps extends Omit<React.ComponentProps<'section'>, 'children'> {
  // The scene behind the glass. Rendered as an <img> poster with no script, and reused as
  // the refraction texture, so the CSS tier and the WebGL tier show the same picture.
  poster: string;
  posterAlt: string;
  // Intrinsic size of the poster, so the image reserves its box before it loads.
  posterWidth: number;
  posterHeight: number;
  // The panel's contents. A Server Component can pass server-rendered children here.
  children: React.ReactNode;
  panelClassName?: string;
  // Called with every tier decision: the server plan, the gate's answer, the probe result,
  // and every later teardown. The frame cost in milliseconds rides on `frameMs`.
  onPlan?: (state: GlassState) => void;
}

// The glass material as one component. It renders the poster and the CSS-blurred panel on
// the server and on every client; on a capable desktop it mounts the three.js refraction
// pass over the same poster, only after useGlassPlan() says webgl and the 12-frame probe
// stays under budget. Reduced motion and reduced transparency keep the designed still
// (materials.css); leaving the viewport pauses the pass; unmount, a preference change, a
// resize under 900px, a lost context or a failed poster all go through one teardown.
export function GlassSurface({
  poster,
  posterAlt,
  posterWidth,
  posterHeight,
  children,
  className,
  panelClassName,
  onPlan,
  ...props
}: GlassSurfaceProps) {
  const plan = useGlassPlan();
  const sceneRef = React.useRef<HTMLElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<GlassState>(SERVER_PLAN);
  const planRef = React.useRef(onPlan);
  planRef.current = onPlan;

  const report = React.useCallback((next: GlassState) => {
    setState(next);
    planRef.current?.(next);
  }, []);

  React.useEffect(() => {
    if (plan.mode !== 'webgl') {
      report({ mode: 'css', reason: plan.reason });
      return;
    }
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!scene || !canvas || !panel) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;
    mountGlass({ scene, canvas, panel, poster, plan, onChange: report })
      .then((handle) => {
        if (cancelled) handle.teardown();
        else teardown = handle.teardown;
      })
      .catch((err: unknown) => {
        report({ mode: 'css', reason: `WebGL failed: ${err instanceof Error ? err.message : String(err)}` });
      });
    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [plan, poster, report]);

  return (
    <section
      ref={sceneRef}
      data-glass={state.mode}
      data-glass-reason={state.reason}
      className={cn('sl-glass-scene overflow-hidden', className)}
      {...props}
    >
      <img
        src={poster}
        alt={posterAlt}
        width={posterWidth}
        height={posterHeight}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div
        ref={panelRef}
        data-slot="glass-panel"
        className={cn('relative z-10 rounded-xl p-6', materialSurface.glass, panelClassName)}
      >
        {children}
      </div>
    </section>
  );
}
