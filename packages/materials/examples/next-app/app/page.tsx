import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starlight/materials/primitives';

// The index is a Server Component: three cards, one per material, each wearing the material
// it links to. Nothing here hydrates.
const materials = [
  {
    href: '/glass',
    material: 'glass',
    title: 'Glass',
    body: 'A panel over a scene. CSS blur everywhere; WebGL refraction only where the device, the preferences and a measured frame cost allow it.',
  },
  {
    href: '/paper',
    material: 'paper',
    title: 'Paper',
    body: 'The reading surface. Warm limestone and ivory, hairlines instead of shadows, a press that sinks.',
  },
  {
    href: '/ink',
    material: 'ink',
    title: 'Ink',
    body: 'The night shell. Flat, hairline hierarchy, a sheet that respects the safe area and owns one scroll axis.',
  },
] as const;

export default function Page() {
  return (
    <main className="mx-auto grid max-w-[1120px] gap-6 px-4 py-10 md:px-8">
      <h1 className="text-headline-lg font-semibold tracking-headline-lg text-balance md:text-display md:tracking-display">
        Three materials, <em className="font-serif font-normal text-accent-bright">one contract.</em>
      </h1>
      <p className="max-w-[46ch] text-body-lg opacity-80">
        Each route is a Server Component poster with a client island where the material needs one. A motion score sits beside every route.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {materials.map((m) => (
          <Card key={m.href} material={m.material} interactive asChild className="h-full">
            <Link href={m.href}>
              <CardHeader>
                <CardTitle>{m.title}</CardTitle>
                <CardDescription>{m.body}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto text-label-md font-medium">Open the route</CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
