'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { docs, docSections } from '@/lib/docs';

// Native disclosure on phones, sticky rail on desktop (CSS). The filter input
// is 16px so iOS Safari does not zoom on focus.

export function DocsNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDetailsElement>(null);
  // Closed on phones so the article comes first; always open on wide screens.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 960px)');
    const sync = () => {
      if (ref.current && wide.matches) ref.current.open = true;
    };
    sync();
    wide.addEventListener('change', sync);
    return () => wide.removeEventListener('change', sync);
  }, []);
  const q = query.trim().toLowerCase();
  const visible = docs.filter((d) => !q || d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q));
  const current = docs.find((d) => pathname === `/docs/${d.slug}`);
  return (
    <details ref={ref} className="ks-docnav">
      <summary className="ks-docnav__summary">
        <span className="ks-label">Docs</span> {current?.title ?? 'Contents'}
      </summary>
      <div className="ks-docnav__body">
        <label className="ks-docnav__filter">
          <span className="ks-label">Filter pages</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        </label>
        {docSections.map((section) => {
          const items = visible.filter((d) => d.section === section);
          if (!items.length) return null;
          return (
            <div key={section} className="ks-docnav__group">
              <p className="ks-label">{section}</p>
              <ul>
                {items.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/docs/${d.slug}`} aria-current={pathname === `/docs/${d.slug}` ? 'page' : undefined}>
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {!visible.length ? <p className="ks-docnav__none">No page matches “{query}”.</p> : null}
      </div>
    </details>
  );
}
