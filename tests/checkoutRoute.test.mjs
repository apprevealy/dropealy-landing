import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutRoute, checkoutProps, checkoutMessage, hasAppliedCoupon, publicPrices, RESERVED_ROUTES } from '../src/lib/checkoutRoute.mjs';
import { promoRevision } from '../src/lib/promoCreator.mjs';
const data = slug => ({ slug, checkout: { starter: `https://checkout.perfectpay.com.br/pay/${slug}?ref=a`, trial: 'https://checkout.centerpag.com/pay/TRIAL?', master: 'https://checkout.centerpag.com/pay/MASTER?' } });
const state = slug => ({ route: checkoutRoute(`/${slug}`), status: 'ready', data: data(slug) });
test('somente / mantém os links da página inicial', () => {
  assert.deepEqual(checkoutRoute('/'), { kind: 'home', slug: null });
  assert.equal(checkoutProps({ route: checkoutRoute('/'), status: 'home' }, 'starter', 'original').href, 'original');
});
test('slug único e barra final são aceitos', () => {
  assert.deepEqual(checkoutRoute('/parceiro-a/'), { kind: 'partner', slug: 'parceiro-a' });
});
test('rotas reservadas, arquivos e caminhos inválidos não são parceiros', () => {
  for (const name of RESERVED_ROUTES) assert.equal(checkoutRoute(`/${name}`).kind, 'unavailable');
  for (const path of ['/ab', '/a--b', '/Parceiro', '/api/teste', '/monitor/shopee', '/assets/a.png', '/a%2Fb', '//parceiro-a']) {
    assert.equal(checkoutRoute(path).kind, 'unavailable');
  }
});
test('dois parceiros usam apenas seus respectivos destinos', () => {
  assert.notEqual(checkoutProps(state('parceiro-a'), 'starter', 'original').href, checkoutProps(state('parceiro-b'), 'starter', 'original').href);
  for (const plan of ['starter', 'trial', 'master']) {
    assert.equal(checkoutProps(state('parceiro-a'), plan, 'original').href, data('parceiro-a').checkout[plan]);
  }
});
test('resposta do parceiro anterior não vaza após mudar o slug', () => {
  const mismatch = { ...state('parceiro-a'), route: checkoutRoute('/parceiro-b') };
  assert.equal(checkoutProps(mismatch, 'starter', 'original').href, undefined);
});
test('carregamento, erro e não aprovado bloqueiam compra sem fallback', () => {
  for (const status of ['loading', 'error', 'not_found']) {
    const props = checkoutProps({ ...state('parceiro-a'), status, data: null }, 'starter', 'original');
    assert.equal(props.href, undefined); assert.equal(props['aria-disabled'], true);
    let blocked = false; props.onClick({ preventDefault() { blocked = true; } }); assert.equal(blocked, true);
  }
});
test('Trial nulo não utiliza outro link nem o original', () => {
  const current = state('parceiro-a'); current.data.checkout.trial = null;
  assert.equal(checkoutProps(current, 'trial', 'original').href, undefined);
  assert.equal(checkoutProps(current, 'master', 'original').href, current.data.checkout.master);
});
test('mensagens são apenas estados funcionais e plano inválido falha', () => {
  assert.equal(checkoutMessage({ status: 'ready' }), '');
  assert.match(checkoutMessage({ status: 'not_found' }), /indisponível/);
  assert.throws(() => checkoutProps(state('parceiro-a'), 'outro', 'original'), TypeError);
});

const normalPrices = { trial: 24700, master: 49700 };
function couponState(slug = 'parceiro-a') {
  const current = state(slug);
  current.data = {
    ...current.data, version: 1, status: 'published', coupon: 'PRESENTE50',
    checkout: {
      starter: `https://checkout.perfectpay.com.br/pay/${slug}-M?ref=${slug}&src=normal%2Fmensal`,
      trial: `https://checkout.centerpag.com/pay/${slug}-T?ref=${slug}&src=normal%2Ftrial&tag=a%2Bb`,
      master: `https://checkout.perfectpay.com.br/pay/${slug}-V?ref=${slug}&src=normal%2Fmaster&tag=1%262`,
    },
    offer: {
      mode: 'coupon', coupon_enabled: true,
      normal: { trial_cents: 24700, master_cents: 49700 },
      discount: {
        ready: true, trial_cents: 19700, master_cents: 39700,
        checkout: {
          trial: `https://checkout.perfectpay.com.br/pay/${slug}-TD?ref=${slug}&src=cupom%2Ftrial&tag=a%2Bb`,
          master: `https://checkout.centerpag.com/pay/${slug}-VD?ref=${slug}&src=cupom%2Fmaster&tag=1%262`,
        },
      },
    },
  };
  return current;
}
function appliedCouponState(slug) {
  const current = couponState(slug);
  current.couponAppliedRevision = promoRevision(current.data);
  return current;
}
function assertBlocked(props) {
  assert.equal(props.href, undefined);
  assert.equal(props['aria-disabled'], true);
  assert.equal(props.tabIndex, -1);
  for (const eventName of ['onClick', 'onAuxClick']) {
    let blocked = false;
    props[eventName]({ preventDefault() { blocked = true; } });
    assert.equal(blocked, true);
  }
}
function assertNormalPartner(current) {
  assert.equal(hasAppliedCoupon(current), false);
  assert.deepEqual(publicPrices(current), normalPrices);
  for (const plan of ['starter', 'trial', 'master']) {
    assert.equal(checkoutProps(current, plan, 'original-da-home').href, current.data.checkout[plan] ?? undefined);
  }
}

test('oferta configurada mantém preços e links próprios normais até aplicar o cupom', () => {
  assertNormalPartner(couponState());
});

test('cupom aplicado usa preços e URLs promocionais exatos e bloqueia Starter', () => {
  const current = appliedCouponState();
  assert.equal(hasAppliedCoupon(current), true);
  assert.deepEqual(publicPrices(current), { trial: 19700, master: 39700 });
  for (const plan of ['trial', 'master']) {
    const props = checkoutProps(current, plan, 'original-da-home');
    assert.equal(props.href, current.data.offer.discount.checkout[plan]);
    assert.equal(props['aria-disabled'], undefined);
    assert.equal(props.onClick, undefined);
    assert.equal(props.onAuxClick, undefined);
  }
  assertBlocked(checkoutProps(current, 'starter', 'original-da-home'));
});

test('marcador compatível não ativa oferta sem modo, permissão, configuração ou cupom', () => {
  for (const [reason, change] of [
    ['modo padrão', current => { current.data.offer.mode = 'standard'; }],
    ['permissão revogada', current => { current.data.offer.coupon_enabled = false; }],
    ['desconto não pronto', current => { current.data.offer.discount.ready = false; }],
    ['cupom nulo', current => { current.data.coupon = null; }],
    ['cupom vazio', current => { current.data.coupon = '   '; }],
    ['resposta legada com identificador de cupom', current => { delete current.data.offer; }],
  ]) {
    const current = couponState();
    change(current);
    current.couponAppliedRevision = promoRevision(current.data);
    assert.equal(hasAppliedCoupon(current), false, reason);
    assertNormalPartner(current);
  }
});

test('alterações aprovadas revogam aplicação antiga mesmo sem aumento da versão', () => {
  for (const [reason, change] of [
    ['versão', current => { current.data.version += 1; }],
    ['cupom', current => { current.data.coupon = 'NOVOCUPOM'; }],
    ['permissão', current => { current.data.offer.coupon_enabled = false; }],
    ['modo', current => { current.data.offer.mode = 'standard'; }],
    ['preço do desconto', current => { current.data.offer.discount.master_cents -= 100; }],
    ['checkout do desconto', current => { current.data.offer.discount.checkout.trial += '&revision=2'; }],
    ['checkout normal', current => { current.data.checkout.master += '&revision=2'; }],
  ]) {
    const current = appliedCouponState();
    const previousRevision = current.couponAppliedRevision;
    change(current);
    assert.notEqual(promoRevision(current.data), previousRevision, reason);
    assertNormalPartner(current);
  }
});

test('revogação manual do marcador restaura os preços e links próprios normais', () => {
  const current = appliedCouponState();
  delete current.couponAppliedRevision;
  assertNormalPartner(current);
});

test('troca de slug bloqueia a resposta anterior e não reaproveita seu cupom', () => {
  const previous = appliedCouponState('parceiro-a');
  const stale = { ...previous, route: checkoutRoute('/parceiro-b') };
  assert.equal(hasAppliedCoupon(stale), false);
  assert.deepEqual(publicPrices(stale), normalPrices);
  for (const plan of ['starter', 'trial', 'master']) {
    assertBlocked(checkoutProps(stale, plan, 'original-da-home'));
  }
  const next = couponState('parceiro-b');
  next.couponAppliedRevision = previous.couponAppliedRevision;
  assertNormalPartner(next);
  next.couponAppliedRevision = promoRevision(next.data);
  assert.equal(hasAppliedCoupon(next), true);
  for (const plan of ['trial', 'master']) {
    assert.equal(checkoutProps(next, plan, 'original-da-home').href, next.data.offer.discount.checkout[plan]);
    assert.notEqual(checkoutProps(next, plan, 'original-da-home').href, previous.data.offer.discount.checkout[plan]);
  }
});

test('Trial normal nulo permite apenas o Trial promocional aplicado e configurado', () => {
  const current = couponState();
  current.data.checkout.trial = null;
  assertNormalPartner(current);
  assertBlocked(checkoutProps(current, 'trial', 'original-da-home'));
  current.couponAppliedRevision = promoRevision(current.data);
  assert.equal(hasAppliedCoupon(current), true);
  assert.equal(checkoutProps(current, 'trial', 'original-da-home').href, current.data.offer.discount.checkout.trial);
  delete current.couponAppliedRevision;
  assertNormalPartner(current);
  assertBlocked(checkoutProps(current, 'trial', 'original-da-home'));
});

test('reconferência bloqueia todos os links e preserva a oferta até a nova resposta', () => {
  const current = { ...appliedCouponState(), checking: true };
  assert.equal(hasAppliedCoupon(current), true);
  assert.equal(current.couponAppliedRevision, promoRevision(current.data));
  assert.deepEqual(publicPrices(current), { trial: 19700, master: 39700 });
  assert.match(checkoutMessage(current), /Conferindo/);
  for (const plan of ['starter', 'trial', 'master']) {
    assertBlocked(checkoutProps(current, plan, 'original-da-home'));
  }
});

test('carregamento e falhas bloqueiam inclusive configuração e marcador antigos', () => {
  for (const status of ['loading', 'error', 'not_found']) {
    const current = { ...appliedCouponState(), status };
    assert.equal(hasAppliedCoupon(current), false);
    assert.deepEqual(publicPrices(current), normalPrices);
    for (const plan of ['starter', 'trial', 'master']) {
      assertBlocked(checkoutProps(current, plan, 'original-da-home'));
    }
  }
  const missing = { ...appliedCouponState(), data: null };
  assert.equal(hasAppliedCoupon(missing), false);
  assert.deepEqual(publicPrices(missing), normalPrices);
  for (const plan of ['starter', 'trial', 'master']) {
    assertBlocked(checkoutProps(missing, plan, 'original-da-home'));
  }
});

test('marcador de parceiro não ativa desconto na página inicial ou rota reservada', () => {
  for (const pathname of ['/', '/admin']) {
    const current = { ...appliedCouponState(), route: checkoutRoute(pathname) };
    assert.equal(hasAppliedCoupon(current), false);
    assert.deepEqual(publicPrices(current), normalPrices);
    for (const plan of ['starter', 'trial', 'master']) {
      const props = checkoutProps(current, plan, 'original-da-home');
      if (pathname === '/') assert.equal(props.href, 'original-da-home');
      else assertBlocked(props);
    }
  }
});
