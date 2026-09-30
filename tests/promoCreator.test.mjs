import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublishedPromo, isAllowedCheckout, isValidSlug, validatePublishedPromo } from '../src/lib/promoCreator.mjs';

const url = code => `https://checkout.perfectpay.com.br/pay/${code}?ref=parceiro&src=teste`;
const published = (slug = 'parceiro-a') => ({
  slug, version: 1, status: 'published', coupon: 'PRESENTE50',
  checkout: { starter: url('STARTER'), trial: url('TRIAL'), master: url('MASTER') },
});
const ok = data => ({ ok: true, status: 200, json: async () => data });

test('valida formato e limites do slug', () => {
  assert.equal(isValidSlug('parceiro-a'), true);
  for (const slug of ['', 'ab', 'Teste', '../login', 'a--b', 'a'.repeat(61), null]) {
    assert.equal(isValidSlug(slug), false);
  }
});
test('bloqueia destinos arbitrários e formatos enganosos', () => {
  assert.equal(isAllowedCheckout(url('ABC')), true);
  assert.equal(isAllowedCheckout('https://checkout.centerpag.com/pay/ABC?'), true);
  for (const value of ['http://checkout.perfectpay.com.br/pay/ABC',
    'https://checkout.perfectpay.com.br.evil.test/pay/ABC',
    'https://checkout.perfectpay.com.br@evil.test/pay/ABC',
    'javascript:alert(1)', 'https://checkout.perfectpay.com.br/outro/ABC',
    'https://checkout.perfectpay.com.br/pay/ABC#troca', null]) {
    assert.equal(isAllowedCheckout(value), false);
  }
});
test('preserva os três destinos, seus parâmetros e o cupom separado', () => {
  const data = published();
  assert.deepEqual(validatePublishedPromo(data, data.slug), data);
});
test('aceita Trial legado nulo sem trocar seu destino', () => {
  const data = published(); data.checkout.trial = null;
  assert.equal(validatePublishedPromo(data, data.slug).checkout.trial, null);
});
test('rejeita outro parceiro, rascunho e dados incompletos', () => {
  for (const data of [{ ...published(), slug: 'outro' }, { ...published(), status: 'draft' },
    { ...published(), version: 0 }, { ...published(), checkout: {} },
    { ...published(), coupon: {} }]) {
    assert.throws(() => validatePublishedPromo(data, 'parceiro-a'), { code: 'invalid_response' });
  }
});
test('consulta sem cookies, cache ou redirecionamentos', async () => {
  const data = await fetchPublishedPromo('parceiro-a', { fetchImpl: async (address, options) => {
    assert.equal(address, 'https://app.dropealy.com/api/public/promo-creator/parceiro-a');
    assert.equal(options.cache, 'no-store'); assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error'); return ok(published());
  }});
  assert.equal(data.slug, 'parceiro-a');
});
test('404 bloqueia a página, sem checkout alternativo', async () => {
  await assert.rejects(fetchPublishedPromo('parceiro-a', {
    fetchImpl: async () => ({ ok: false, status: 404 }),
  }), { code: 'not_found' });
});
test('503 e erro de rede bloqueiam os planos', async () => {
  for (const fetchImpl of [async () => ({ ok: false, status: 503 }), async () => { throw new Error('rede'); }]) {
    await assert.rejects(fetchPublishedPromo('parceiro-a', { fetchImpl }), { code: 'unavailable' });
  }
});
test('JSON inválido não disponibiliza links', async () => {
  await assert.rejects(fetchPublishedPromo('parceiro-a', {
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError(); } }),
  }), { code: 'unavailable' });
});
test('timeout cancela a consulta', async () => {
  await assert.rejects(fetchPublishedPromo('parceiro-a', { timeoutMs: 5,
    fetchImpl: (_, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('', 'AbortError')), { once: true });
    }),
  }), { code: 'unavailable' });
});
test('cancelamento do navegador não consulta nem reaproveita links', async () => {
  const controller = new AbortController(); controller.abort();
  let called = false;
  await assert.rejects(fetchPublishedPromo('parceiro-a', { signal: controller.signal,
    fetchImpl: async () => { called = true; return ok(published()); },
  }), { name: 'AbortError' });
  assert.equal(called, false);
});
