import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starlight/materials/primitives';

// Server Component, no island. Paper is the reading surface: the whole route is static
// markup and the only motion is the state contract on the interactive card and the buttons.
const notes = [
  { title: 'Hairline, not shadow', body: 'A card on paper is ivory with a hairline. Pressed, it drops to paper. There is no elevation scale.' },
  { title: 'Measure', body: 'Body text holds under 46 characters on a phone and 70 on desktop. Two weights on a screen.' },
  { title: 'Hover is gated', body: 'A touch screen never sees a hover state. The hover rule exists only where a fine pointer does.' },
] as const;

export default function PaperPage() {
  return (
    <main className="bg-surface-paper text-on-paper">
      <div className="mx-auto grid max-w-[1120px] gap-8 px-4 py-10 md:px-8">
        <header className="grid gap-3">
          <p className="text-label-sm opacity-70">Paper</p>
          <h1 className="text-headline-lg font-semibold tracking-headline-lg text-balance md:text-display md:tracking-display">
            The reading <em className="font-serif font-normal text-accent">surface.</em>
          </h1>
          <p className="max-w-[46ch] text-body-lg opacity-80 md:max-w-[70ch]">
            Warm limestone rather than white, so a page feels like a studio page and not a blank template. Nothing on this
            route hydrates.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {notes.map((n, i) => (
            <Card key={n.title} material="paper" interactive={i === 0} className={i === 0 ? 'bg-surface-ivory' : ''}>
              <CardHeader>
                <CardTitle>{n.title}</CardTitle>
                <CardDescription>{n.body}</CardDescription>
              </CardHeader>
              <CardContent className="text-label-sm opacity-60">{i === 0 ? 'Interactive: press it' : 'Static: no hover, no press'}</CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button material="paper">Paper button</Button>
          <Button material="ink">Ink on paper</Button>
          <Button material="paper" disabled>
            Disabled
          </Button>
        </div>
      </div>
    </main>
  );
}
