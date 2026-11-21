import Link from 'next/link';
import { site } from '@/lib/site.config';

export function SiteFooter() {
  return (
    <footer className="ks-footer">
      <p className="ks-footer__name">
        {site.name}. {site.tagline}
      </p>
      <nav aria-label="For agents" className="ks-footer__agents">
        <span className="ks-label">For agents</span>
        <a href={site.agents.llms}>llms.txt</a>
        <a href={site.agents.wellKnown}>.well-known/starlight.json</a>
        <Link href="/docs/agents">MCP endpoint</Link>
      </nav>
      <p className="ks-footer__note">Demo content. Every name, price and number on this site is fictional.</p>
    </footer>
  );
}
