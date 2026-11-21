/** Server-only preparation adapter. No default fetch, storefront route or fulfillment. */
export const SANDBOX_CHECKOUT_ENDPOINT = 'https://api.stripe.com/v1/checkout/sessions';

export const CHECKOUT_SKUS = [
  'aurora-ui-kit:essential',
  'aurora-ui-kit:pro',
  'command-center-template:agent',
] as const;
export type CheckoutSku = (typeof CHECKOUT_SKUS)[number];

export interface SandboxConfig {
  mode: 'test';
  secretKey: string;
  /** Trusted server configuration. Never take a price or amount from a browser. */
  prices: Record<CheckoutSku, string>;
  successUrl: string;
  cancelUrl: string;
  timeoutMs?: number;
}

export interface SandboxIntent {
  sku: CheckoutSku;
  /** Stable, server-issued purchase-attempt ID; reuse for retries of one intent. */
  idempotencyKey: string;
  edition: string;
  sourceSha: string;
}

export type CheckoutTransport = (
  url: string,
  init: { method: 'POST'; headers: Record<string, string>; body: string; signal: AbortSignal },
) => Promise<Response>;

export class SandboxCheckoutError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
    this.name = 'SandboxCheckoutError';
  }
}

function refuse(code: string): never { throw new SandboxCheckoutError(code); }

function trustedUrl(raw: string): string {
  let url: URL;
  try { url = new URL(raw); } catch { return refuse('INVALID_RETURN_URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    return refuse('INVALID_RETURN_URL');
  }
  return url.href;
}

async function fingerprint(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Transport must be explicitly supplied by a server owner. Tests inject fixtures.
 * Neither a fixture result nor a session URL grants an entitlement or proves payment.
 */
export async function createSandboxCheckout(
  config: SandboxConfig,
  intent: SandboxIntent,
  transport: CheckoutTransport,
): Promise<{ mode: 'test'; sessionId: string; url: string; idempotencyKey: string }> {
  if (typeof window !== 'undefined') refuse('SERVER_ONLY');
  if (!config || config.mode !== 'test' || typeof config.secretKey !== 'string' ||
      !/^sk_test_[A-Za-z0-9]{8,}$/.test(config.secretKey)) refuse('TEST_KEY_REQUIRED');
  // Snapshot before the first await; caller mutation cannot swap in a live key.
  const secretKey = config.secretKey;
  if (!intent || !CHECKOUT_SKUS.includes(intent.sku)) refuse('UNKNOWN_SKU');
  if (typeof transport !== 'function') refuse('TRANSPORT_REQUIRED');
  if (typeof intent.idempotencyKey !== 'string' ||
      !/^[A-Za-z0-9_-]{16,128}$/.test(intent.idempotencyKey)) refuse('INVALID_IDEMPOTENCY_KEY');
  if (typeof intent.edition !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(intent.edition) ||
      typeof intent.sourceSha !== 'string' || !/^[a-f0-9]{40}$/.test(intent.sourceSha)) refuse('INVALID_SOURCE_EDITION');
  const price = config.prices?.[intent.sku];
  if (typeof price !== 'string' || !/^price_[A-Za-z0-9]{3,}$/.test(price)) refuse('PRICE_NOT_CONFIGURED');
  const success = trustedUrl(config.successUrl);
  const cancel = trustedUrl(config.cancelUrl);
  const timeoutMs = config.timeoutMs ?? 10_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) refuse('INVALID_TIMEOUT');

  const [productSlug, tier] = intent.sku.split(':');
  const body = new URLSearchParams({
    mode: 'payment',
    success_url: success,
    cancel_url: cancel,
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
  });
  // Preserve FrankX's canonical webhook/delivery productSlug convention.
  const metadata = { productSlug, tier, edition: intent.edition, sourceSha: intent.sourceSha };
  for (const [key, value] of Object.entries(metadata)) {
    body.set(`metadata[${key}]`, value);
    body.set(`payment_intent_data[metadata][${key}]`, value);
  }
  // Bind retries to the complete intended request. A changed edition/price/URL is a new intent.
  const idempotencyKey = `foundry-test-${await fingerprint(`${intent.idempotencyKey}\n${body}`)}`;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new SandboxCheckoutError('CHECKOUT_TIMEOUT'));
    }, timeoutMs);
  });
  try {
    const operation = (async () => {
      const response = await transport(SANDBOX_CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': idempotencyKey },
        body: body.toString(),
        signal: controller.signal,
      });
      if (!response.ok) refuse('PROVIDER_REJECTED');
      if (!response.headers.get('content-type')?.includes('application/json')) refuse('INVALID_PROVIDER_RESPONSE');
      const reader = response.body?.getReader();
      if (!reader) refuse('INVALID_PROVIDER_RESPONSE');
      let text = '';
      let bytes = 0;
      const decoder = new TextDecoder();
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 32_768) refuse('INVALID_PROVIDER_RESPONSE');
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } finally { await reader.cancel().catch(() => {}); }
      let session: unknown;
      try { session = JSON.parse(text); } catch { return refuse('INVALID_PROVIDER_RESPONSE'); }
      if (!session || typeof session !== 'object') refuse('INVALID_PROVIDER_RESPONSE');
      const result = session as Record<string, unknown>;
      if (result.livemode !== false || result.mode !== 'payment' ||
          typeof result.id !== 'string' || !/^cs_test_[A-Za-z0-9]+$/.test(result.id) ||
          typeof result.url !== 'string') refuse('TEST_SESSION_REQUIRED');
      let url: URL;
      try { url = new URL(result.url); } catch { return refuse('INVALID_PROVIDER_URL'); }
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.port ||
          url.username || url.password || !url.pathname.startsWith(`/c/pay/${result.id}`) ||
          (url.pathname !== `/c/pay/${result.id}` && url.pathname !== `/c/pay/${result.id}/`)) {
        refuse('INVALID_PROVIDER_URL');
      }
      return { mode: 'test' as const, sessionId: result.id, url: url.href, idempotencyKey };
    })();
    return await Promise.race([operation, deadline]);
  } catch (error) {
    if (error instanceof SandboxCheckoutError) throw error;
    // Do not surface provider errors, response bodies, request headers or secrets.
    return refuse('PROVIDER_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
