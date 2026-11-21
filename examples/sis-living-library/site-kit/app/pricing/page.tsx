import type { Metadata } from 'next';
import { site, absoluteUrl } from '@/lib/site.config';
import { PricingPlans } from '@/components/site/pricing-plans';
import { JsonLd } from '@/components/site/json-ld';

export const metadata: Metadata = {
  title: 'Pricing',
  description: site.pricing.lede,
  alternates: { canonical: '/pricing' },
};

function productJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: site.name,
    description: site.description,
    brand: { '@type': 'Brand', name: site.name },
    url: absoluteUrl('/pricing'),
    image: absoluteUrl('/pwa-icon/512'),
    offers: site.pricing.plans
      .filter((plan) => plan.monthly !== null)
      .map((plan) => ({
        '@type': 'Offer',
        name: `${site.name} ${plan.name}`,
        price: String(plan.monthly),
        priceCurrency: site.currency,
        url: absoluteUrl(`/pricing#${plan.id}`),
        availability: 'https://schema.org/InStock',
        description: `${plan.steps}. ${plan.summary}`,
      })),
  };
}

export default function Pricing() {
  const { pricing } = site;
  return (
    <div className="ks-page">
      <JsonLd data={productJsonLd()} />
      <header className="ks-page__head">
        <h1 className="ks-claim ks-claim--page">{pricing.claim}</h1>
        <p className="ks-lede">{pricing.lede}</p>
      </header>
      <PricingPlans plans={pricing.plans} />
      <section className="ks-faq" aria-labelledby="faq">
        <h2 id="faq" className="ks-heading">
          Questions before you start
        </h2>
        {pricing.faq.map((item) => (
          <details key={item.q} className="ks-faq__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
