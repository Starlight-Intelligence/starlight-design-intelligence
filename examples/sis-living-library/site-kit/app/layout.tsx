import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@/components/ui/starlight/tokens.css';
import '@/components/ui/starlight/components.css';
import './site.css';
import { site, themeColor } from '@/lib/site.config';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { title: site.name, description: site.description, url: site.url, siteName: site.name, type: 'website' },
  alternates: { types: { 'text/plain': site.agents.llms } },
};

// Phone contract: cover the notch area, allow pinch zoom to 5x, never disable scaling.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: themeColor,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={site.locale} data-theme={site.theme} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint so motion start states never flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
      </head>
      <body className="ks-body">
        <a className="ks-skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
