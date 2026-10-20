import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starlight/materials/primitives';
import { InkSheet } from './InkSheet.tsx';

// Server Component. Ink is the shell material: flat, hairline hierarchy, one island (the
// sheet) because a sheet needs state and nothing else here does.
export default function InkPage() {
  return (
    <main className="mx-auto grid max-w-[1120px] gap-8 px-4 py-10 md:px-8">
      <header className="grid gap-3">
        <p className="text-label-sm opacity-70">Ink</p>
        <h1 className="text-headline-lg font-semibold tracking-headline-lg text-balance md:text-display md:tracking-display">
          The night <em className="font-serif font-normal text-accent-bright">shell.</em>
        </h1>
        <p className="max-w-[46ch] text-body-lg opacity-80 md:max-w-[70ch]">
          Ink is flat. Hierarchy comes from hairlines and tonal steps, never from a shadow scale. The sheet is the one thing
          on this route that hydrates.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card material="ink">
          <CardHeader>
            <CardTitle>Command bar</CardTitle>
            <CardDescription>A static ink card. No hover, no press; it frames content and stops there.</CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-code opacity-80">starlight &gt; materials gate . &rarr; PASS</CardContent>
        </Card>
        <Card material="ink" interactive asChild>
          <Link href="/paper">
            <CardHeader>
              <CardTitle>Inspector</CardTitle>
              <CardDescription>An interactive ink card. Hover adds a hairline where a fine pointer exists; press sinks it.</CardDescription>
            </CardHeader>
            <CardContent className="text-label-sm opacity-60">Interactive: a link to /paper, press it</CardContent>
          </Link>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <InkSheet />
        <Button material="paper">Paper on ink</Button>
        <Button material="glass">Glass on ink</Button>
      </div>
    </main>
  );
}
