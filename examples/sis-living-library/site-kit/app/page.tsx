import Link from 'next/link';
import { site } from '@/lib/site.config';
import { ShaderField } from '@/components/site/shader-field';
import { RunLedger } from '@/components/site/run-ledger';

export default function Home() {
  const { home } = site;
  return (
    <>
      <section className="ks-open" aria-labelledby="claim">
        <ShaderField />
        <div className="ks-open__inner">
          <h1 id="claim" className="ks-claim">
            {home.claim}
          </h1>
          <p className="ks-lede">{home.lede}</p>
          <Link className="sl-button sl-button--primary ks-action" href={site.primaryAction.href}>
            {site.primaryAction.label}
          </Link>
        </div>
      </section>

      <section className="ks-screen ks-evidence" aria-labelledby="ledger-claim">
        <div className="ks-evidence__text">
          <h2 id="ledger-claim" className="ks-heading">
            {home.ledger.claim}
          </h2>
          <Link className="ks-link" href={home.ledger.action.href}>
            {home.ledger.action.label}
          </Link>
        </div>
        <RunLedger label={home.ledger.label} steps={home.ledger.steps} verdict={home.ledger.verdict} />
      </section>

      <section className="ks-screen" aria-labelledby="method">
        <h2 id="method" className="ks-heading">
          {home.method.title}
        </h2>
        <ol className="ks-method">
          {home.method.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Link className="ks-link" href={home.method.action.href}>
          {home.method.action.label}
        </Link>
      </section>

      <section className="ks-screen ks-close" aria-labelledby="price">
        <h2 id="price" className="ks-heading ks-heading--large">
          {home.price.claim}
        </h2>
        <Link className="sl-button sl-button--secondary ks-action" href={home.price.action.href}>
          {home.price.action.label}
        </Link>
      </section>
    </>
  );
}
