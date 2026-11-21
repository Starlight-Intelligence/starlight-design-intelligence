'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { site } from '@/lib/site.config';

// Provider hook: replace `submit` with your auth or waitlist call (Clerk,
// Supabase, Resend, your own API). The kit sends nothing anywhere by default.
async function submit(_data: { email: string; plan: string }): Promise<void> {
  // await fetch('/api/signup', { method: 'POST', body: JSON.stringify(_data) });
}

function Form() {
  const params = useSearchParams();
  const plan = site.pricing.plans.find((p) => p.id === params.get('plan')) ?? site.pricing.plans[0];
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'invalid' | 'sent'>('idle');
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState('invalid');
    await submit({ email, plan: plan.id });
    setState('sent');
  };
  if (state === 'sent')
    return (
      <p role="status" className="ks-signup__done">
        Check {email} for a sign-in link. (Demo: nothing was sent. Connect a provider in signup-form.tsx.)
      </p>
    );
  return (
    <form className="ks-signup" onSubmit={onSubmit} noValidate>
      <p className="ks-label">Plan: {plan.name}</p>
      <label className="ks-signup__field">
        <span>Work email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState('idle');
          }}
          aria-invalid={state === 'invalid' || undefined}
          aria-describedby={state === 'invalid' ? 'email-error' : undefined}
        />
      </label>
      {state === 'invalid' ? (
        <p id="email-error" className="ks-signup__error">
          Enter an email address like name@company.com.
        </p>
      ) : null}
      <button type="submit" className="sl-button sl-button--primary ks-action">
        {plan.action.label}
      </button>
    </form>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={null}>
      <Form />
    </Suspense>
  );
}
