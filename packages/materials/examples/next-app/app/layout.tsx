import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import './globals.css';

const sans = localFont({ src: './fonts/InstrumentSans[wdth,wght].ttf', weight: '400 700', style: 'normal', variable: '--font-instrument-sans', display: 'swap' });
const serif = localFont({ src: './fonts/InstrumentSerif-Italic.ttf', weight: '400', style: 'italic', variable: '--font-instrument-serif', display: 'swap' });
const mono = localFont({ src: './fonts/IBMPlexMono-Regular.ttf', weight: '400', style: 'normal', variable: '--font-plex-mono', display: 'swap' });

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
    <html lang="en" data-theme="ink" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8">
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
          <ThemeSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
