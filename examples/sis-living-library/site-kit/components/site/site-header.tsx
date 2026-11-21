import Link from 'next/link';
import { site } from '@/lib/site.config';

export function SiteHeader() {
  return (
    <header className="ks-header">
      <Link href="/" className="ks-wordmark" aria-label={`${site.name} home`}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.25" opacity=".55" />
          <circle cx="21" cy="12" r="1.6" fill="currentColor" />
        </svg>
        {site.name}
      </Link>
      <nav aria-label="Main" className="ks-nav">
        {site.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
