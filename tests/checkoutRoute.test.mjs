import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutRoute, checkoutProps, checkoutMessage, RESERVED_ROUTES } from '../src/lib/checkoutRoute.mjs';
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
