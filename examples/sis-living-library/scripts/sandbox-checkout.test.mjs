import test from 'node:test';
import assert from 'node:assert/strict';
import { createSandboxCheckout, SANDBOX_CHECKOUT_ENDPOINT } from '../commercial/sandbox-checkout.ts';

const config = () => ({ mode: 'test', secretKey: 'sk_test_fixtureOnly123',
  prices: { 'aurora-ui-kit:essential': 'price_essential', 'aurora-ui-kit:pro': 'price_pro',
    'command-center-template:agent': 'price_agent' },
  successUrl: 'https://example.com/checkout/success', cancelUrl: 'https://example.com/checkout/cancel' });
const intent = () => ({ sku: 'aurora-ui-kit:essential', idempotencyKey: 'attempt_fixture_123456',
  edition: '0.3.0', sourceSha: 'a'.repeat(40) });
const session = (overrides = {}) => new Response(JSON.stringify({ id: 'cs_test_fixture123',
  livemode: false, mode: 'payment', url: 'https://checkout.stripe.com/c/pay/cs_test_fixture123',
  ...overrides }), { headers: { 'content-type': 'application/json' } });

test('prepares fixed-endpoint, server-price test checkout with canonical metadata', async () => {
  let seen;
  const result = await createSandboxCheckout(config(), intent(), async (url, request) => {
    seen = { url, request }; return session();
  });
  assert.equal(seen.url, SANDBOX_CHECKOUT_ENDPOINT);
  assert.equal(seen.request.method, 'POST');
  const fields = new URLSearchParams(seen.request.body);
  assert.equal(fields.get('line_items[0][price]'), 'price_essential');
  assert.equal(fields.get('metadata[productSlug]'), 'aurora-ui-kit');
  assert.equal(fields.get('payment_intent_data[metadata][productSlug]'), 'aurora-ui-kit');
  assert.equal(fields.get('metadata[tier]'), 'essential');
  assert.equal(fields.get('metadata[edition]'), '0.3.0');
  assert.equal(fields.get('metadata[sourceSha]'), 'a'.repeat(40));
  assert.equal(fields.has('line_items[0][price_data][unit_amount]'), false);
  assert.equal(result.mode, 'test');
  assert.equal(JSON.stringify(result).includes('sk_test'), false);
});

test('duplicate exact intent uses the same stable idempotency key; edition changes bind a new key', async () => {
  const keys = [];
  const transport = async (_url, request) => { keys.push(request.headers['Idempotency-Key']); return session(); };
  await createSandboxCheckout(config(), intent(), transport);
  await createSandboxCheckout(config(), intent(), transport);
  await createSandboxCheckout(config(), { ...intent(), edition: '0.3.1' }, transport);
  assert.equal(keys[0], keys[1]);
  assert.notEqual(keys[0], keys[2]);
  assert.match(keys[0], /^foundry-test-[a-f0-9]{64}$/);
});

test('snapshots validated credentials before asynchronous preparation', async () => {
  const cfg = config();
  const validatedKey = cfg.secretKey;
  const pending = createSandboxCheckout(cfg, intent(), async (_url, request) => {
    assert.equal(request.headers.Authorization, `Bearer ${validatedKey}`);
    return session();
  });
  cfg.secretKey = 'sk_live_FORBIDDEN_MUTATION';
  await pending;
});

test('rejects live keys and modes before transport; failure never includes secret', async () => {
  let calls = 0;
  const transport = async () => { calls++; return session(); };
  for (const cfg of [{ ...config(), mode: 'live' }, { ...config(), secretKey: 'sk_live_NEVER_CALL123' },
    { ...config(), secretKey: 'rk_test_NOT_SUPPORTED' }]) {
    await assert.rejects(createSandboxCheckout(cfg, intent(), transport), error =>
      error.code === 'TEST_KEY_REQUIRED' && !error.message.includes(cfg.secretKey));
  }
  assert.equal(calls, 0);
});

test('rejects unknown SKU, missing server price, malformed key and source before transport', async () => {
  let calls = 0;
  const transport = async () => { calls++; return session(); };
  for (const [cfg, data, code] of [
    [config(), { ...intent(), sku: '__proto__' }, 'UNKNOWN_SKU'],
    [{ ...config(), prices: {} }, intent(), 'PRICE_NOT_CONFIGURED'],
    [config(), { ...intent(), idempotencyKey: 'bad\nheader' }, 'INVALID_IDEMPOTENCY_KEY'],
    [config(), { ...intent(), sourceSha: 'main' }, 'INVALID_SOURCE_EDITION'],
    [{ ...config(), successUrl: 'http://example.com' }, intent(), 'INVALID_RETURN_URL'],
    [{ ...config(), timeoutMs: 10001 }, intent(), 'INVALID_TIMEOUT'],
  ]) await assert.rejects(createSandboxCheckout(cfg, data, transport), { code });
  assert.equal(calls, 0);
});

test('supports all allowed editions using trusted mappings', async () => {
  for (const [sku, price] of Object.entries(config().prices)) {
    await createSandboxCheckout(config(), { ...intent(), sku }, async (_url, request) => {
      assert.equal(new URLSearchParams(request.body).get('line_items[0][price]'), price);
      return session();
    });
  }
});

test('refuses live or ambiguous provider sessions and unsafe checkout URLs', async () => {
  for (const overrides of [{ livemode: true }, { livemode: undefined }, { mode: 'subscription' },
    { id: 'cs_live_BAD' }, { url: 'https://checkout.stripe.com.evil.test/c/pay/cs_test_fixture123' },
    { url: 'https://checkout.stripe.com/c/pay/cs_test_other' },
    { url: 'https://evil@checkout.stripe.com/c/pay/cs_test_fixture123' },
    { url: 'http://checkout.stripe.com/c/pay/cs_test_fixture123' }]) {
    await assert.rejects(createSandboxCheckout(config(), intent(), async () => session(overrides)),
      error => ['TEST_SESSION_REQUIRED', 'INVALID_PROVIDER_URL'].includes(error.code));
  }
});

test('bounds a transport that ignores AbortSignal and cancels the signal', async () => {
  let signal;
  await assert.rejects(createSandboxCheckout({ ...config(), timeoutMs: 5 }, intent(), async (_url, request) => {
    signal = request.signal; return new Promise(() => {});
  }), { code: 'CHECKOUT_TIMEOUT' });
  assert.equal(signal.aborted, true);
});

test('sanitizes transport failures and rejects malformed/oversized provider responses', async () => {
  await assert.rejects(createSandboxCheckout(config(), intent(), async () => {
    throw new Error('Authorization: secret provider internals');
  }), error => error.code === 'PROVIDER_UNAVAILABLE' && !error.message.includes('secret'));
  for (const response of [new Response('{}', { status: 500 }),
    new Response('not JSON', { headers: { 'content-type': 'application/json' } }),
    new Response('x'.repeat(32769), { headers: { 'content-type': 'application/json' } })]) {
    await assert.rejects(createSandboxCheckout(config(), intent(), async () => response));
  }
});
