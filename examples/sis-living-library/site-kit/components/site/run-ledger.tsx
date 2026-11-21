'use client';

import { useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { LedgerStep } from '@/lib/site.config';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Motion reasons (see SCENE-BRIEF.md):
// 1. Rows verify in order: state and causality. The flagged row resolves last.
// 2. The lens travels to the flagged row: focus and spatial relationship.
// The server markup is the final state. Reduced motion and no-JS readers get
// exactly that markup. With JS and motion allowed, CSS holds the rows in their
// queued look (html[data-js]) until the sequence has played once.

export type RunLedgerProps = {
  label: string;
  steps: readonly LedgerStep[];
  verdict: string;
};

function Rows({ steps, hidden }: { steps: readonly LedgerStep[]; hidden?: boolean }) {
  return (
    <ol className="ks-ledger__rows" aria-hidden={hidden || undefined}>
      {steps.map((s, i) => (
        <li key={s.id} className="ks-step" data-step={s.id} data-state="verified" data-flagged={s.flagged || undefined}>
          <span className="ks-step__n">{String(i + 1).padStart(2, '0')}</span>
          <span className="ks-step__tool">{s.tool}</span>
          <span className="ks-step__detail">{s.detail}</span>
          <span className="ks-step__status">
            <span className="ks-step__queued" aria-hidden="true">queued</span>
            <span className="ks-step__verified">{s.flagged ? 'changed outcome' : 'verified'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function RunLedger({ label, steps, verdict }: RunLedgerProps) {
  const root = useRef<HTMLDivElement>(null);
  const flagged = Math.max(0, steps.findIndex((s) => s.flagged));

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const setState = (id: string, state: string) =>
          el.querySelectorAll<HTMLElement>(`[data-step="${id}"]`).forEach((n) => (n.dataset.state = state));
        const order = [...steps.filter((s) => !s.flagged), steps[flagged]];
        const tl = gsap.timeline({
          paused: true,
          onStart: () => {
            el.dataset.run = 'running';
            steps.forEach((s) => setState(s.id, 'queued'));
          },
          onComplete: () => {
            el.dataset.run = 'done';
            el.dataset.played = 'true';
          },
        });
        order.forEach((s, i) => tl.call(() => setState(s.id, 'verified'), [], 0.25 + i * 0.09));
        tl.fromTo(el, { '--lens-i': 0 }, { '--lens-i': flagged, duration: 0.6, ease: 'expo.out' }, '>+0.15');
        const st = ScrollTrigger.create({ trigger: el, start: 'top 75%', once: true, onEnter: () => tl.play() });
        return () => {
          st.kill();
          tl.kill();
          el.dataset.run = 'done';
          el.dataset.played = 'true';
          steps.forEach((s) => setState(s.id, 'verified'));
          gsap.set(el, { clearProps: '--lens-i' });
        };
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [steps, flagged] },
  );

  return (
    <figure ref={root} className="ks-ledger" data-run="done" style={{ '--lens-final': flagged } as CSSProperties}>
      <figcaption className="ks-ledger__label">{label}</figcaption>
      <div className="ks-ledger__frame">
        <Rows steps={steps} />
        <div className="ks-lens" aria-hidden="true">
          <div className="ks-lens__content">
            <Rows steps={steps} hidden />
          </div>
        </div>
      </div>
      <p className="ks-ledger__verdict">{verdict}</p>
    </figure>
  );
}
