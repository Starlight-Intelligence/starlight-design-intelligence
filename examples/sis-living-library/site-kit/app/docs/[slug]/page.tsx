import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { docs, getDoc } from '@/lib/docs';


export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return doc ? { title: doc.title, description: doc.summary, alternates: { canonical: `/docs/${doc.slug}` } } : {};
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const index = docs.indexOf(doc);
  const prev = docs[index - 1];
  const next = docs[index + 1];
  const headings = doc.blocks.filter((b) => b.kind === 'h2');
  return (
    <article className="ks-article">
      <p className="ks-label">{doc.section}</p>
      <h1 className="ks-article__title">{doc.title}</h1>
      <p className="ks-lede">{doc.summary}</p>
      {headings.length > 2 ? (
        <nav aria-label="On this page" className="ks-toc">
          <span className="ks-label">On this page</span>
          {headings.map((h) => (
            <a key={h.id} href={`#${h.id}`}>
              {h.text}
            </a>
          ))}
        </nav>
      ) : null}
      {doc.blocks.map((b, i) => {
        if (b.kind === 'h2')
          return (
            <h2 key={i} id={b.id} className="ks-article__h2">
              {b.text}
            </h2>
          );
        if (b.kind === 'code')
          return (
            <pre key={i} className="ks-code" tabIndex={0} aria-label={`${b.lang} example`}>
              <code>{b.text}</code>
            </pre>
          );
        return <p key={i}>{b.text}</p>;
      })}
      <nav aria-label="Pagination" className="ks-pager">
        {prev ? (
          <Link href={`/docs/${prev.slug}`} rel="prev">
            <span className="ks-label">Previous</span>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/docs/${next.slug}`} rel="next">
            <span className="ks-label">Next</span>
            {next.title}
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
