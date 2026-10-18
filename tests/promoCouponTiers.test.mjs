import test from 'node:test';
import assert from 'node:assert/strict';
import { couponFromSearch, couponMatches, fetchPublishedPromo, promoRevision, validatePublishedPromo } from '../src/lib/promoCreator.mjs';
import { checkoutProps, checkoutRoute, hasAppliedCoupon, publicMasterPayment, publicPrices } from '../src/lib/checkoutRoute.mjs';

const checkout = code => `https://checkout.centerpag.com/pay/${code}?ref=parceiro%2Foficial&tag=1%262`;
function published(tier) {
  return {
    slug: 'parceiro', version: 4, status: 'published', coupon: tier === 100 ? 'CEMOFF' : 'DUZENTOSOFF',
    checkout: { starter: null, trial: checkout('NORMAL_TRIMESTRAL'), master: checkout('NORMAL_VITALICIO') },
    offer: {
      mode: 'coupon', coupon_enabled: true, coupon_tier: tier,
      normal: { trial_cents: 24700, master_cents: 49700 },
      discount: {
        ready: true, trial_cents: 19700, master_cents: tier === 100 ? 39700 : 29700,
        master_installment_cents: tier === 100 ? null : 2982,
        checkout: { trial: checkout(`TRIMESTRAL_${tier}`), master: checkout(`VITALICIO_${tier}`) },
      },
    },
  };
}
const state = data => ({ route: checkoutRoute(`/${data.slug}`), status: 'ready', data });

test('cada bloco aprovado associa seus valores, cupom e checkouts sem alterar a atribuição', async () => {
  for (const tier of [100, 200]) {
    const source = published(tier);
    const parsed = await fetchPublishedPromo(source.slug, { fetchImpl: async () => ({ ok: true, status: 200, json: async () => source }) });
    assert.deepEqual(parsed, source);
    const current = state(parsed);
    assert.deepEqual(publicPrices(current), { trial: 24700, master: 49700 });
    for (const plan of ['trial', 'master']) assert.equal(checkoutProps(current, plan).href, source.checkout[plan]);
    assert.equal(couponMatches(parsed, source.coupon), true);
    current.couponAppliedRevision = promoRevision(parsed);
    assert.deepEqual(publicPrices(current), { trial: 19700, master: tier === 100 ? 39700 : 29700 });
    for (const plan of ['trial', 'master']) assert.equal(checkoutProps(current, plan).href, source.offer.discount.checkout[plan]);
    assert.equal(checkoutProps(current, 'starter').href, undefined);
    assert.deepEqual(publicMasterPayment(current), tier === 100
      ? { installmentCount: 12, installmentCents: null, totalCents: null }
      : { installmentCount: 12, installmentCents: 2982, totalCents: 35784 });
  }
});

test('bloco 2.1 rejeita valor trocado, trimestral diferente e parcela não confirmada', () => {
  const changes = [
    data => { data.offer.discount.master_cents = 29700; },
    data => { data.offer.discount.trial_cents = 19600; },
    data => { data.offer.discount.master_installment_cents = 2982; },
    data => { data.offer.coupon_tier = '100'; },
    data => { data.offer.coupon_tier = 300; },
  ];
  for (const ready of [true, false]) for (const change of changes) {
    const data = published(100); data.offer.discount.ready = ready; change(data);
    assert.throws(() => validatePublishedPromo(data, data.slug), { code: 'invalid_response' });
    assert.equal(couponMatches(data, data.coupon), false);
  }
});

test('metadados novos preservam as ofertas legadas e o modo padrão sem migrar seus valores', () => {
  const legacy = published(200);
  legacy.offer.discount.master_cents = 34700;
  legacy.offer.discount.master_installment_cents = 3790;
  assert.deepEqual(validatePublishedPromo(legacy, legacy.slug), legacy);
  delete legacy.offer.coupon_tier;
  assert.deepEqual(validatePublishedPromo(legacy, legacy.slug), legacy);
  const standard = published(100);
  standard.offer.mode = 'standard'; standard.offer.coupon_enabled = false; standard.offer.coupon_tier = null;
  assert.deepEqual(validatePublishedPromo(standard, standard.slug), standard);
  assert.equal(couponMatches(standard, standard.coupon), false);
});

test('URL não seleciona outro bloco nem aceita o código do bloco não publicado', () => {
  for (const tier of [100, 200]) {
    const data = published(tier);
    const other = published(tier === 100 ? 200 : 100);
    const input = couponFromSearch(`?CUPOM=${other.coupon}&coupon_tier=${other.offer.coupon_tier}&master_cents=${other.offer.discount.master_cents}`);
    assert.equal(couponMatches(data, input), false);
    assert.equal(couponMatches(data, couponFromSearch(`?CUPOM=${data.coupon}&coupon_tier=${other.offer.coupon_tier}`)), true);
    assert.equal(data.offer.coupon_tier, tier);
  }
});

test('troca de bloco na mesma versão revoga a revisão aplicada antes de usar os novos checkouts', () => {
  const first = published(100), next = published(200);
  next.coupon = first.coupon;
  const current = state(first); current.couponAppliedRevision = promoRevision(first);
  assert.equal(hasAppliedCoupon(current), true);
  current.data = next;
  assert.equal(hasAppliedCoupon(current), false);
  assert.deepEqual(publicPrices(current), { trial: 24700, master: 49700 });
  assert.equal(checkoutProps(current, 'master').href, next.checkout.master);
  current.couponAppliedRevision = promoRevision(next);
  assert.deepEqual(publicPrices(current), { trial: 19700, master: 29700 });
  assert.equal(checkoutProps(current, 'master').href, next.offer.discount.checkout.master);
  current.data = { ...next, offer: { ...next.offer, mode: 'standard', coupon_enabled: false } };
  assert.deepEqual(publicPrices(current), { trial: 24700, master: 49700 });
  assert.equal(checkoutProps(current, 'master').href, next.checkout.master);
});

test('resposta pública contém somente o bloco selecionado e não conserva campos extras', () => {
  const data = published(100);
  data.offer.other_tier = published(200).offer.discount;
  data.offer.draft_coupon = 'NAO_PUBLICADO';
  const parsed = validatePublishedPromo(data, data.slug);
  assert.equal(parsed.offer.coupon_tier, 100);
  assert.equal(Object.hasOwn(parsed.offer, 'other_tier'), false);
  assert.equal(Object.hasOwn(parsed.offer, 'draft_coupon'), false);
});
