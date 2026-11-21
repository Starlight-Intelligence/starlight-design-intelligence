import { ImageResponse } from 'next/og';
import { Mark } from '@/components/site/mark';

// Real PNG icons for the web app manifest, generated at build time.

const variants = {
  '192': { px: 192, padding: 0.12 },
  '512': { px: 512, padding: 0.12 },
  // Maskable icons keep the mark inside the central 80% safe zone.
  maskable: { px: 512, padding: 0.26 },
} as const;

export function generateStaticParams() {
  return Object.keys(variants).map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const v = variants[size as keyof typeof variants];
  if (!v) return new Response('Not found', { status: 404 });
  return new ImageResponse(<Mark size={v.px} padding={v.padding} />, { width: v.px, height: v.px });
}
