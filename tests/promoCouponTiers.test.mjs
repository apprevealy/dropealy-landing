import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutProps, checkoutRoute, hasAppliedCoupon, publicMasterPayment, publicPrices } from '../src/lib/checkoutRoute.mjs';
import {
  couponEntryIsVisible, couponIsAvailable, couponMatches, fetchPublishedPromo,
  promoRevision, validatePublishedPromo,
} from '../src/lib/promoCreator.mjs';

const checkout = code => `https://pay.pagamentorevealy.com/${code}?ref=parceiro%2Fa&src=cupom+aprovado`;
const fixture = (tier = 100) => ({
  slug: 'parceiro-tiers', version: 2, status: 'published', coupon: tier === 100 ? 'PRESENTE100' : 'PRESENTE200',
  checkout: { starter: null, trial: checkout('NORMAL_TRIAL'), master: checkout('NORMAL_MASTER') },
  offer: {
    mode: 'coupon', coupon_enabled: true, coupon_tier: tier,
    normal: { trial_cents: 24700, master_cents: 49700 },
    discount: {
      ready: true, trial_cents: 19700, master_cents: tier === 100 ? 39700 : 29700,
      master_installment_cents: tier === 100 ? 3986 : 2982,
      checkout: { trial: checkout(`TIER${tier}_TRIAL`), master: checkout(`TIER${tier}_MASTER`) },
    },
  },
});
const stateFor = (data, applied = false) => ({
  route: checkoutRoute(`/${data.slug}`), status: 'ready', data,
  ...(applied ? { couponAppliedRevision: promoRevision(data) } : {}),
});

test('preserva o tier publicado sem alterar códigos, preços ou atribuição dos checkouts', () => {
  for (const tier of [100, 200]) {
    const data = fixture(tier);
    const parsed = validatePublishedPromo(data, data.slug);
    assert.deepEqual(parsed, data);
    assert.equal(parsed.offer.mode, 'coupon');
    assert.equal(parsed.offer.coupon_tier, tier);
    assert.equal(couponEntryIsVisible(parsed), true);
    assert.equal(couponIsAvailable(parsed), true);
    assert.equal(couponMatches(parsed, parsed.coupon), true);
    assert.equal(couponMatches(parsed, tier === 100 ? 'PRESENTE200' : 'PRESENTE100'), false);
  }
});

test('tier100 pronto exige os valores confirmados e rejeita parcelas não autorizadas', () => {
  for (const change of [
    data => { data.offer.discount.trial_cents = 19600; },
    data => { data.offer.discount.master_cents = 29700; },
    data => { data.offer.discount.master_installment_cents = 2982; },
    data => { data.offer.discount.master_installment_cents = 3985; },
    data => { data.offer.discount.master_installment_cents = 3987; },
    data => { delete data.offer.discount.master_installment_cents; },
  ]) {
    const data = fixture(); change(data);
    assert.throws(() => validatePublishedPromo(data, data.slug), { code: 'invalid_response' });
  }
});

test('tier100 legado à vista continua válido durante a atualização da publicação', () => {
  const data = fixture();
  data.offer.discount.master_installment_cents = null;
  const parsed = validatePublishedPromo(data, data.slug);
  assert.deepEqual(parsed, data);
  const applied = stateFor(parsed, true);
  assert.deepEqual(publicPrices(applied), { trial: 19700, master: 39700 });
  assert.deepEqual(publicMasterPayment(applied), { installmentCount: 12, installmentCents: null, totalCents: null });
  assert.equal(checkoutProps(applied, 'master', 'HOME').href, data.offer.discount.checkout.master);
});

test('tier200 e ofertas sem tier mantêm parcelas opcionais e valores legados aprovados', () => {
  for (const tier of [200, undefined]) {
    for (const installment of [2982, null, undefined]) {
      const data = fixture(200);
      if (tier === undefined) delete data.offer.coupon_tier;
      if (installment === undefined) delete data.offer.discount.master_installment_cents;
      else data.offer.discount.master_installment_cents = installment;
      // A identificação nova não reescreve publicações antigas com outros valores aprovados.
      data.offer.discount.master_cents = 34900;
      data.offer.discount.trial_cents = 19900;
      assert.deepEqual(validatePublishedPromo(data, data.slug), data);
    }
  }
});

test('standard, revogação e desconto incompleto preservam tier sem habilitar cupom', () => {
  for (const tier of [null, 100, 200]) {
    for (const mode of ['standard', 'coupon']) {
      const data = fixture();
      data.offer.mode = mode;
      data.offer.coupon_tier = tier;
      data.offer.coupon_enabled = false;
      data.offer.discount = {
        ready: false, trial_cents: null, master_cents: null, master_installment_cents: null,
        checkout: { trial: null, master: null },
      };
      const parsed = validatePublishedPromo(data, data.slug);
      const expected = structuredClone(data);
      if (tier === null) delete expected.offer.coupon_tier;
      assert.deepEqual(parsed, expected);
      assert.equal(couponIsAvailable(parsed), false);
      assert.equal(couponMatches(parsed, parsed.coupon), false);
      const current = stateFor(parsed, true);
      assert.equal(hasAppliedCoupon(current), false);
      assert.deepEqual(publicPrices(current), { trial: 24700, master: 49700 });
      assert.equal(checkoutProps(current, 'master', 'HOME').href, data.checkout.master);
    }
  }
});

test('modos internos ou desconhecidos e tiers inválidos falham sem checkout alternativo', async () => {
  const invalid = [
    ...['coupon100', 'coupon_100', 'promotional'].map(mode => data => { data.offer.mode = mode; }),
    ...[0, 50, 300, '100', true, {}, undefined].map(tier => data => { data.offer.coupon_tier = tier; }),
  ];
  for (const change of invalid) {
    const data = fixture(); change(data);
    await assert.rejects(fetchPublishedPromo(data.slug, {
      fetchImpl: async () => ({ ok: true, status: 200, json: async () => data }),
    }), { code: 'invalid_response' });
    const failed = { route: checkoutRoute(`/${data.slug}`), status: 'error', data: null };
    assert.equal(checkoutProps(failed, 'master', 'HOME').href, undefined);
    assert.equal(checkoutProps(failed, 'trial', 'HOME').href, undefined);
  }
});

test('cada tier aplicado usa somente seus preços e URLs selecionados; sem cupom mantém a oferta normal', () => {
  for (const tier of [100, 200]) {
    const data = validatePublishedPromo(fixture(tier), 'parceiro-tiers');
    const pending = stateFor(data);
    assert.deepEqual(publicPrices(pending), { trial: 24700, master: 49700 });
    assert.deepEqual(publicMasterPayment(pending), { installmentCount: 12, installmentCents: 4990, totalCents: 59880 });
    const applied = stateFor(data, true);
    assert.deepEqual(publicPrices(applied), { trial: 19700, master: tier === 100 ? 39700 : 29700 });
    assert.deepEqual(publicMasterPayment(applied), tier === 100
      ? { installmentCount: 12, installmentCents: 3986, totalCents: 47832 }
      : { installmentCount: 12, installmentCents: 2982, totalCents: 35784 });
    for (const plan of ['trial', 'master']) {
      assert.equal(checkoutProps(pending, plan, 'HOME').href, data.checkout[plan]);
      assert.equal(checkoutProps(applied, plan, 'HOME').href, data.offer.discount.checkout[plan]);
    }
    assert.equal(checkoutProps(applied, 'starter', 'HOME').href, undefined);
  }
});

test('a identidade inclui o tier e revoga aplicação anterior mesmo com demais campos iguais', () => {
  const data = validatePublishedPromo(fixture(), 'parceiro-tiers');
  const previous = promoRevision(data);
  data.offer.coupon_tier = 200;
  const changed = validatePublishedPromo(data, data.slug);
  assert.notEqual(promoRevision(changed), previous);
  const stale = { ...stateFor(changed), couponAppliedRevision: previous };
  assert.equal(hasAppliedCoupon(stale), false);
  assert.deepEqual(publicPrices(stale), { trial: 24700, master: 49700 });
  assert.equal(checkoutProps(stale, 'master', 'HOME').href, data.checkout.master);
});
