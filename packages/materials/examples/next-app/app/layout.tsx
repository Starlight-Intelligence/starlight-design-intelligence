import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument-sans', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-instrument-serif', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Starlight materials',
  description: 'Glass, paper and ink: one route per material, each with its motion score.',
};

// viewportFit cover, or every safe-area inset resolves to 0; zoom stays allowed.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#070A10' },
    { media: '(prefers-color-scheme: light)', color: '#EFEDE7' },
  ],
};

const routes = [
  { href: '/glass', label: 'Glass' },
  { href: '/paper', label: 'Paper' },
  { href: '/ink', label: 'Ink' },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <header className="flex h-16 items-center justify-between px-4 pt-[env(safe-area-inset-top)] md:px-8">
          <Link href="/" className="text-label-md font-medium focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus">
            Starlight materials
          </Link>
          <nav aria-label="Materials" className="flex gap-4 text-label-md">
            {routes.map((r) => (
              <Link key={r.href} href={r.href} className="opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus">
                {r.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
