'use client';

import { useId, useState } from 'react';
import { formatPrice, type Plan } from '@/lib/site.config';

// Motion reason: the price text cross-fades (120 ms, CSS) because the period
// changed. Reduced motion swaps instantly.

export function PricingPlans({ plans }: { plans: readonly Plan[] }) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const name = useId();
  return (
    <div className="ks-plans" data-period={period}>
      <fieldset className="ks-period">
        <legend className="ks-label">Billing</legend>
        {(['monthly', 'yearly'] as const).map((p) => (
          <label key={p} className="ks-period__option">
            <input type="radio" name={name} value={p} checked={period === p} onChange={() => setPeriod(p)} />
            <span>{p === 'monthly' ? 'Monthly' : 'Yearly, two months free'}</span>
          </label>
        ))}
      </fieldset>
      <p className="ks-sr" role="status">{period === 'monthly' ? 'Showing monthly prices' : 'Showing yearly prices'}</p>
      <ol className="ks-plan-list">
        {plans.map((plan) => {
          const amount = period === 'monthly' ? plan.monthly : plan.yearly;
          return (
            <li key={plan.id} id={plan.id} className="ks-plan" data-recommended={plan.recommended || undefined}>
              <div className="ks-plan__head">
                <h2 className="ks-plan__name">
                  {plan.name}
                  {plan.recommended ? <span className="ks-plan__flag">Recommended</span> : null}
                </h2>
                <p className="ks-plan__price">
                  <span key={`${plan.id}-${period}`} className="ks-plan__amount">
                    {formatPrice(amount)}
                  </span>
                  {amount ? <span className="ks-plan__unit"> per month{period === 'yearly' ? ', billed yearly' : ''}</span> : null}
                </p>
              </div>
              <p className="ks-plan__steps">{plan.steps}</p>
              <p className="ks-plan__summary">{plan.summary}</p>
              <ul className="ks-plan__includes">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className={plan.recommended ? 'sl-button sl-button--primary' : 'sl-button sl-button--secondary'} href={plan.action.href}>
                {plan.action.label}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
