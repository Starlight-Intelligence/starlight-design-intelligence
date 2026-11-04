import { Button } from '@starlight/materials/primitives';
import { GlassDemo } from './GlassDemo.tsx';

// Server Component. The poster, the headline and the panel's contents render here with no
// script; GlassDemo is the client island that decides which glass tier runs.
export default function GlassPage() {
  return (
    <main>
      <GlassDemo>
        <div className="grid gap-4">
          <p className="text-label-sm opacity-80">Development snapshot, materials package</p>
          <h1 className="text-headline-md font-semibold tracking-headline-md text-balance">
            Glass that <em className="font-serif font-normal text-accent-bright">earns</em> its refraction.
          </h1>
          <ol className="grid gap-2 font-mono text-code opacity-90">
            <li>gate: WebGL2, no reduced motion or transparency, no data saver, 900px up</li>
            <li>probe: 12 frames, 8 ms median budget, measured here</li>
            <li>still: CSS blur with no script; opaque ink under reduced transparency</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <Button material="glass">Read the gate</Button>
            <Button material="ink" size="sm">Score</Button>
          </div>
        </div>
      </GlassDemo>
      <section className="mx-auto grid max-w-[1120px] gap-3 px-4 pb-16 md:px-8">
        <h2 className="text-headline-md font-semibold tracking-headline-md">What the gate decided, and why</h2>
        <p className="max-w-[70ch] text-body-md opacity-80">
          The line above the fold is written by the client island from the plan. On the server it reads CSS glass; on a phone it
          reads phone layout; on a desktop that passes the probe it reads the measured median frame cost. Resize under 900px,
          switch on reduced motion, or lose the WebGL context and the line changes with the surface.
        </p>
      </section>
    </main>
  );
}
