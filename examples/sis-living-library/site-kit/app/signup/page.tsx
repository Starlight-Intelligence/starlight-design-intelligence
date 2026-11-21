import type { Metadata } from 'next';
import { site } from '@/lib/site.config';
import { SignupForm } from '@/components/site/signup-form';

export const metadata: Metadata = { title: 'Start free', description: site.pricing.lede, robots: { index: false } };

export default function Signup() {
  return (
    <div className="ks-page ks-page--narrow">
      <header className="ks-page__head">
        <h1 className="ks-claim ks-claim--page">Start with one agent.</h1>
        <p className="ks-lede">{site.pricing.plans[0].steps}, no card.</p>
      </header>
      <SignupForm />
    </div>
  );
}
