# Sandbox checkout preparation

`sandbox-checkout.ts` is a server-only, injected-transport Stripe test adapter.
It has no default network transport, storefront route or connection to the demo.
The implementation made no provider request and created no Stripe records.

The current connected provider inspection exposed a live account only. A genuine
test/sandbox account and test price mappings remain an integration blocker.
Do not substitute a live key to finish this demonstration.

The fixed API endpoint is Stripe's normal checkout endpoint; Stripe selects test
mode through a server-held `sk_test_` credential. The adapter refuses other key
types/modes before invoking transport, requires returned `livemode: false`, a
`cs_test_` session, payment mode, and an exact Stripe checkout host/session path.
Server-owned configuration selects prices for these allowlisted proposed SKUs:

| SKU | Existing storefront productSlug | Tier |
|---|---|---|
| `aurora-ui-kit:essential` | `aurora-ui-kit` | essential |
| `aurora-ui-kit:pro` | `aurora-ui-kit` | pro |
| `command-center-template:agent` | `command-center-template` | agent |

These are mapping proposals, not created products or verified prices. No browser
may supply an amount, price ID, secret, return URL or server configuration. A host
must authenticate/authorize requests and bind the attempt ID, edition and source
revision to trusted server records before calling this module. Keep this source
outside every client bundle; the runtime browser check is defense in depth.

Retry one exact intent with the same server-issued idempotency key. The header
also hashes the full prepared request so edition/source/price/URL changes cannot
silently reuse the prior key. Stable headers demonstrate retry semantics; the
provider owns deduplication and this local adapter has no durable request ledger.
Response reads are capped at 32 KiB and completion at ten seconds maximum.
Timeout aborts transport but cannot prove that a remote side effect was undone;
retry using the same key and reconcile with Stripe before creating another intent.

`metadata.productSlug` and PaymentIntent metadata preserve the owning FrankX
webhook convention. `tier`, `edition` and `sourceSha` identify the delivered
edition candidate. A created test session is neither a payment receipt nor an
entitlement. Canonical webhook verification, deduplication, entitlement and
artifact delivery remain owned by `frankxai/frankx.ai-vercel-website`:
`app/api/webhooks/stripe/route.ts` and `lib/delivery.ts`. No fulfillment or refund
workflow is implemented here. Sandbox checkout is not yet wired to that owner.

Run offline fixture tests using Node 24:

```sh
node --test scripts/sandbox-checkout.test.mjs
```

Fixtures cover forbidden live transport, unknown SKUs, stable retries, source
binding, trusted price selection, response mode/host validation, timeout,
malformed/oversized output and sanitized failures. They do not establish provider
connectivity, tax treatment, live checkout, commercial licensing or buyer access.
