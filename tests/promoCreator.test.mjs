import test from 'node:test';
import assert from 'node:assert/strict';
import {
  couponIsAvailable, couponMatches, fetchPublishedPromo, isAllowedCheckout, isValidSlug,
  normalizeCoupon, promoRevision, validatePublishedPromo,
} from '../src/lib/promoCreator.mjs';

const url = code => `https://checkout.perfectpay.com.br/pay/${code}?ref=parceiro&src=teste`;
const published = (slug = 'parceiro-a') => ({
  slug, version: 1, status: 'published', coupon: 'PRESENTE50',
  checkout: { starter: url('STARTER'), trial: url('TRIAL'), master: url('MASTER') },
});
const ok = data => ({ ok: true, status: 200, json: async () => data });
const configured = (slug = 'parceiro-a') => ({
  ...published(slug),
  offer: {
    mode: 'coupon', coupon_enabled: true,
    normal: { trial_cents: 24700, master_cents: 49700 },
    discount: {
      ready: true, trial_cents: 19700, master_cents: 39700,
      checkout: {
        trial: 'https://checkout.perfectpay.com.br/pay/CUPOM_TRIAL?ref=parceiro%2Fa&src=cupom&src=segundo',
        master: 'https://checkout.centerpag.com/pay/CUPOM_MASTER?ref=parceiro%2Fa&utm_source=teste+',
      },
    },
  },
});

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
test('cupom legado preserva a resposta original e não concede a oferta promocional', () => {
  for (const coupon of ['PRESENTE50', null, '']) {
    const data = { ...published(), coupon };
    const validated = validatePublishedPromo(data, data.slug);
    assert.deepEqual(validated, data);
    assert.equal(Object.hasOwn(validated, 'offer'), false);
    assert.equal(couponIsAvailable(validated), false);
    assert.equal(couponMatches(validated, 'presente50'), false);
  }
});
test('valida a oferta aprovada preservando centavos e URLs promocionais sem reescrita', () => {
  const data = configured();
  const validated = validatePublishedPromo(data, data.slug);
  assert.deepEqual(validated, data);
  assert.equal(couponIsAvailable(validated), true);
  assert.equal(validated.offer.discount.checkout.trial, data.offer.discount.checkout.trial);
  assert.equal(validated.offer.discount.checkout.master, data.offer.discount.checkout.master);
  // A integração normal indisponível não substitui o checkout próprio do cupom.
  data.checkout.trial = null;
  assert.deepEqual(validatePublishedPromo(data, data.slug), data);
});
test('configurar descontos não basta: modo, permissão e prontidão precisam autorizar o cupom', () => {
  for (const change of [
    data => { data.offer.mode = 'standard'; },
    data => { data.offer.coupon_enabled = false; },
    data => { data.offer.discount.ready = false; },
  ]) {
    const data = configured(); change(data);
    const validated = validatePublishedPromo(data, data.slug);
    assert.deepEqual(validated, data);
    assert.equal(couponIsAvailable(validated), false);
    assert.equal(couponMatches(validated, data.coupon), false);
  }
  const pending = configured();
  pending.offer.discount = {
    ready: false, trial_cents: null, master_cents: null,
    checkout: { trial: null, master: null },
  };
  pending.coupon = null;
  assert.deepEqual(validatePublishedPromo(pending, pending.slug), pending);
  assert.equal(couponIsAvailable(pending), false);
});
test('normaliza a entrada sem ativar códigos diferentes ou ultrapassar o limite', () => {
  const data = configured(); data.coupon = ' presente50 ';
  assert.equal(normalizeCoupon('  presente50\n'), 'PRESENTE50');
  assert.equal(normalizeCoupon('a'.repeat(128)), 'A'.repeat(128));
  for (const input of [null, undefined, {}, 50, '', '  ', 'a'.repeat(129)]) {
    assert.equal(normalizeCoupon(input), '');
    assert.equal(couponMatches(data, input), false);
  }
  assert.equal(couponMatches(data, ' PRESENTE50\n'), true);
  assert.equal(couponMatches(data, 'PRESENTE51'), false);
  assert.equal(couponMatches(data, 'PRESENTE50-extra'), false);
});
test('rejeita ofertas com estrutura, permissões ou preços incompatíveis', () => {
  const invalid = [
    ['offer nulo', data => { data.offer = null; }],
    ['offer vazio', data => { data.offer = {}; }],
    ['modo desconhecido', data => { data.offer.mode = 'promotional'; }],
    ['permissão ausente', data => { delete data.offer.coupon_enabled; }],
    ['permissão textual', data => { data.offer.coupon_enabled = 'true'; }],
    ['normal ausente', data => { delete data.offer.normal; }],
    ['trimestral normal alterado', data => { data.offer.normal.trial_cents = 24701; }],
    ['vitalício normal alterado', data => { data.offer.normal.master_cents = 49701; }],
    ['normal em texto', data => { data.offer.normal.master_cents = '49700'; }],
    ['desconto ausente', data => { delete data.offer.discount; }],
    ['prontidão textual', data => { data.offer.discount.ready = 'true'; }],
    ['checkout ausente', data => { delete data.offer.discount.checkout; }],
  ];
  for (const plan of ['trial', 'master']) {
    const normal = plan === 'trial' ? 24700 : 49700;
    for (const value of [0, -1, 1.5, normal, normal + 1, '100', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, undefined]) {
      invalid.push([`${plan} inválido: ${String(value)}`, data => {
        data.offer.discount.ready = false;
        data.offer.discount[`${plan}_cents`] = value;
      }]);
    }
  }
  for (const [name, change] of invalid) {
    const data = configured(); change(data);
    assert.throws(() => validatePublishedPromo(data, data.slug), { code: 'invalid_response' }, name);
  }
});
test('prontidão exige os dois preços, os dois destinos aprovados e o código utilizável', () => {
  const invalid = [
    ['código vazio', data => { data.coupon = ' '; }],
    ['código nulo', data => { data.coupon = null; }],
    ['código excessivo', data => { data.coupon = 'A'.repeat(129); }],
  ];
  for (const plan of ['trial', 'master']) {
    invalid.push([`${plan} sem preço`, data => { data.offer.discount[`${plan}_cents`] = null; }]);
    invalid.push([`${plan} sem destino`, data => { data.offer.discount.checkout[plan] = null; }]);
    for (const link of [
      'https://evil.test/pay/CUPOM',
      'https://checkout.perfectpay.com.br.evil.test/pay/CUPOM',
      'https://checkout.perfectpay.com.br/pay/CUPOM#desconto',
      'javascript:alert(1)',
    ]) {
      invalid.push([`${plan} destino inválido: ${link}`, data => {
        // Também rejeitar links presentes em uma configuração ainda não pronta.
        data.offer.discount.ready = false;
        data.offer.discount.checkout[plan] = link;
      }]);
    }
  }
  for (const [name, change] of invalid) {
    const data = configured(); change(data);
    assert.throws(() => validatePublishedPromo(data, data.slug), { code: 'invalid_response' }, name);
  }
});
test('revisão muda ao trocar parceiro, versão, código, destino ou autorização', () => {
  const data = configured(); const revision = promoRevision(data);
  assert.equal(promoRevision(structuredClone(data)), revision);
  const changes = [
    next => { next.slug = 'parceiro-b'; },
    next => { next.version += 1; },
    next => { next.coupon = 'OUTRO'; },
    next => { next.checkout.starter = url('OUTRO_STARTER'); },
    next => { next.checkout.trial = null; },
    next => { next.checkout.master = url('OUTRO_MASTER'); },
    next => { next.offer.mode = 'standard'; },
    next => { next.offer.coupon_enabled = false; },
    next => { next.offer.discount.ready = false; },
    next => { next.offer.discount.trial_cents -= 100; },
    next => { next.offer.discount.master_cents -= 100; },
    next => { next.offer.discount.checkout.trial += '&ref=novo'; },
    next => { next.offer.discount.checkout.master += '&ref=novo'; },
  ];
  for (const change of changes) {
    const next = structuredClone(data); change(next);
    assert.notEqual(promoRevision(next), revision);
  }
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
test('consulta rejeita oferta malformada publicada sem recuperar a oferta anterior', async () => {
  const data = configured(); data.offer.discount.master_cents = 49700;
  await assert.rejects(fetchPublishedPromo(data.slug, { fetchImpl: async () => ok(data) }), {
    code: 'invalid_response',
  });
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
