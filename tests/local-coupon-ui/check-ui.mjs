import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';

const rootPath = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(rootPath, 'package.json'));
const React = require('react');
const { build } = require('esbuild');
const output = mkdtempSync(path.join(tmpdir(), 'dropealy-landing-ui-'));
const bundle = path.join(output, 'components.cjs');
await build({
  stdin: {
    contents: 'export { CheckoutProvider } from "./src/components/CheckoutProvider.jsx"; export { default as Features } from "./src/components/Features.jsx";',
    resolveDir: rootPath, loader: 'jsx',
  },
  bundle: true, outfile: bundle, format: 'cjs', platform: 'node', jsx: 'automatic',
  plugins: [{ name: 'one-react-instance', setup(builder) {
    builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path: name }) => ({ path: require.resolve(name), external: true }));
  } }],
});
const { CheckoutProvider, Features } = require(bundle);
const { act } = React;
const originals = Object.fromEntries(['window', 'document', 'navigator', 'Event', 'fetch', 'IS_REACT_ACT_ENVIRONMENT'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
// React DOM detects browser event support when its module is loaded.
const bootstrapWindow = new Window();
Object.defineProperty(globalThis, 'window', { value: bootstrapWindow, configurable: true, writable: true });
Object.defineProperty(globalThis, 'document', { value: bootstrapWindow.document, configurable: true, writable: true });
Object.defineProperty(globalThis, 'navigator', { value: bootstrapWindow.navigator, configurable: true, writable: true });
const { createRoot } = require('react-dom/client');
for (const key of ['window', 'document', 'navigator']) {
  if (originals[key]) Object.defineProperty(globalThis, key, originals[key]); else delete globalThis[key];
}
bootstrapWindow.close();
let win, host, root, current, fetches, opened;
const checkout = code => `https://checkout.centerpag.com/pay/${code}?ref=a%2Fb&tag=1%262`;
const offer = (slug = 'fornecedor') => ({
  slug, version: 1, status: 'published', coupon: 'PRESENTE50',
  checkout: { starter: null, trial: checkout(`${slug}_T`), master: checkout(`${slug}_M`) },
  offer: {
    mode: 'coupon', coupon_enabled: true,
    normal: { trial_cents: 24700, master_cents: 49700 },
    discount: { ready: true, trial_cents: 19700, master_cents: 29700, master_installment_cents: 3790,
      checkout: { trial: checkout(`${slug}_TD`), master: checkout(`${slug}_MD`) } },
  },
});
const master = () => host.querySelector('.pricing-card--featured');
const price = () => master().querySelector('.pricing-card__price--master');
const trial = () => host.querySelector('.pricing-card:not(.pricing-card--featured)');
const normalized = element => element.textContent.replace(/\s+/g, ' ').trim();
const flush = async () => { await act(async () => { await new Promise(resolve => setImmediate(resolve)); }); };
const normal = () => {
  assert.equal(price().querySelector('span').textContent, '12x de');
  assert.equal(price().querySelector('strong').textContent, 'R$ 49,90');
  assert.equal(price().classList.contains('pricing-card__price--promotional'), false);
  assert.equal(trial().querySelector('.pricing-card__price').classList.contains('pricing-card__price--promotional'), false);
  assert.equal(host.querySelector('.coupon-applied-bar'), null);
  assert.match(normalized(master()), /ou R\$ 497 à vista/);
  assert.match(normalized(master()), /Total no parcelamento: R\$ 598,80/);
  assert.match(normalized(trial()), /R\$ 247/);
};
const discounted = (expected = 'R$ 37,90') => {
  assert.equal(price().querySelector('span').textContent, '12x de');
  assert.equal(price().querySelector('strong').textContent, expected);
  assert.equal(price().classList.contains('pricing-card__price--promotional'), true);
  assert.equal(trial().querySelector('.pricing-card__price').classList.contains('pricing-card__price--promotional'), true);
  assert.match(normalized(host.querySelector('.coupon-applied-bar')), /PRESENTE50/);
  assert.match(normalized(master()), /ou R\$ 297 à vista/);
  assert.match(normalized(trial()), /R\$ 197/);
};
const navigate = async url => { await act(async () => win.history.pushState({}, '', url)); await flush(); };
const mount = async (url = '/fornecedor?CUPOM=PRESENTE50') => {
  win.history.replaceState({}, '', url);
  await act(async () => root.render(React.createElement(React.StrictMode, null,
    React.createElement(CheckoutProvider, null, React.createElement(Features)))));
  await flush();
};
const clickText = async text => {
  const button = [...host.querySelectorAll('button')].find(item => normalized(item) === text);
  assert.ok(button, `Botão ${text} presente`);
  await act(async () => button.dispatchEvent(new win.MouseEvent('click', { bubbles: true })));
  await flush();
};
const couponForm = () => host.querySelector('form.coupon-control');
const couponGift = () => host.querySelector('.coupon-entry__gift');
const couponToggle = () => [...host.querySelectorAll('button')].find(item => /tem um cupom ou indica[çc][ãa]o/i.test(normalized(item)));
const openCoupon = async () => {
  const toggle = couponToggle();
  assert.ok(toggle, 'Botão para informar cupom ou indicação presente');
  await act(async () => toggle.dispatchEvent(new win.MouseEvent('click', { bubbles: true })));
  await flush();
};
const submitCoupon = async () => {
  await act(async () => couponForm().dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true })));
  await flush();
};
const assertNormalLinks = (slug = 'fornecedor') => {
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout(`${slug}_M`));
  assert.equal(host.querySelector('[data-checkout-plan="trial"]').getAttribute('href'), checkout(`${slug}_T`));
};
const setInput = async value => {
  const input = host.querySelector('#dropealy-coupon');
  await act(async () => {
    Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    input.dispatchEvent(new win.Event('change', { bubbles: true }));
  });
};

beforeEach(() => {
  win = new Window({ url: 'https://www.dropealy.com/' });
  for (const [key, value] of Object.entries({ window: win, document: win.document, navigator: win.navigator, Event: win.Event, IS_REACT_ACT_ENVIRONMENT: true })) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  current = offer(); fetches = []; opened = [];
  globalThis.fetch = async (url, options) => {
    fetches.push({ url, options });
    if (current instanceof Error) throw current;
    return { ok: true, status: 200, json: async () => structuredClone(current) };
  };
  win.open = () => {
    const tabWindow = new Window();
    return { opener: win, document: tabWindow.document, location: { replace: href => opened.push(href) }, close: () => opened.push('closed') };
  };
  host = win.document.createElement('div');
  win.document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  await win.happyDOM.abort();
  win.close();
  for (const [key, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
});
after(() => rmSync(output, { recursive: true, force: true }));

test('URL válida aplica a oferta aprovada e mostra parcelas reais no cartão Master', async () => {
  await mount();
  discounted();
  assert.match(normalized(master()), /Total no parcelamento: R\$ 454,80/);
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout('fornecedor_MD'));
  assert.equal(couponToggle(), undefined);
  assert.equal(couponForm().hidden, false);
  assert.match(normalized(couponGift()), /CUPOM PRESENTE APLICADO/i);
  assert.match(normalized(couponGift()), /PRESENTE50/);
  assert.ok(fetches.every(item => item.options.credentials === 'omit' && item.options.cache === 'no-store'));
});

test('valor da parcela segue a configuração publicada, sem fixar o exemplo 29,90', async () => {
  current.offer.discount.master_installment_cents = 2990;
  await mount('/fornecedor?cupom=presente50');
  discounted('R$ 29,90');
  assert.match(normalized(master()), /Total no parcelamento: R\$ 358,80/);
});

test('sem parâmetro mantém os preços normais; aplicar e remover restaura os links normais', async () => {
  await mount('/fornecedor');
  normal();
  assertNormalLinks();
  assert.equal(couponToggle().getAttribute('aria-expanded'), 'false');
  assert.ok(!couponForm() || couponForm().hidden);
  assert.equal(couponGift(), null);
  assert.equal(couponToggle().getAttribute('aria-controls'), 'dropealy-coupon-panel');
  await openCoupon();
  assert.equal(couponToggle(), undefined);
  assert.equal(couponForm().hidden, false);
  assert.equal(couponForm().querySelector('label:not(.sr-only)'), null);
  assert.equal(host.querySelector('#dropealy-coupon').getAttribute('placeholder'), 'Digite seu cupom');
  assert.equal(normalized(couponForm().querySelector('button[type="submit"]')), 'APLICAR');
  assert.equal(host.querySelector('.coupon-control__promotion'), null);
  assert.equal(couponGift(), null);
  await setInput('presente50');
  await submitCoupon();
  discounted();
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout('fornecedor_MD'));
  assert.equal(host.querySelector('[data-checkout-plan="trial"]').getAttribute('href'), checkout('fornecedor_TD'));
  await clickText('Remover cupom');
  normal();
  assertNormalLinks();
});

test('remover não é desfeito por parâmetros de rastreamento; nova intenção explícita reaplica', async () => {
  await mount();
  discounted();
  await clickText('Remover cupom');
  await navigate('/fornecedor?CUPOM=PRESENTE50&utm_source=nova');
  normal();
  await navigate('/fornecedor?CUPOM=OUTRO');
  normal();
  assert.match(host.textContent, /cupom informado não é válido/);
  await navigate('/fornecedor?CUPOM=PRESENTE50');
  discounted();
});

test('modo padrão com identificador publicado mostra o campo sem habilitar desconto', async () => {
  current.offer.mode = 'standard';
  current.offer.coupon_enabled = false;
  await mount();
  normal();
  assertNormalLinks();
  if (!couponForm() || couponForm().hidden) await openCoupon();
  assert.equal(couponGift(), null);
  assert.equal(host.querySelector('#dropealy-coupon').disabled, true);
  assert.equal(couponForm().querySelector('button[type="submit"]').disabled, true);
  await setInput('PRESENTE50');
  await submitCoupon();
  normal();
  assertNormalLinks();
  assert.match(normalized(couponForm()), /cupom.*(?:não.*ativ|indisponível)/i);
  assert.match(host.textContent, /cupom não está disponível nesta página/);
  assert.match(host.textContent, /valores normais foram mantidos/);
});

test('home ignora cupom e mantém o preço normal', async () => {
  await mount('/?CUPOM=PRESENTE50');
  normal();
  assert.equal(fetches.length, 0);
  assert.equal(host.querySelector('.coupon-control'), null);
});

test('oferta antiga à vista continua válida sem inventar parcelamento', async () => {
  delete current.offer.discount.master_installment_cents;
  await mount();
  assert.equal(price().querySelector('span'), null);
  assert.equal(price().querySelector('strong').textContent, 'R$ 297');
  assert.equal(price().classList.contains('pricing-card__price--promotional'), true);
  assert.equal(trial().querySelector('.pricing-card__price').classList.contains('pricing-card__price--promotional'), true);
  assert.match(normalized(host.querySelector('.coupon-applied-bar')), /PRESENTE50/);
  assert.match(normalized(master()), /À vista · Acesso vitalício/);
  assert.doesNotMatch(normalized(master()), /Total no parcelamento/);
});

test('revalidação de permissão revogada remove o desconto sem reaplicar a URL antiga', async () => {
  await mount();
  discounted();
  current.offer.coupon_enabled = false;
  await act(async () => win.dispatchEvent(new win.Event('focus')));
  await flush();
  normal();
  assert.match(host.textContent, /planos foram atualizados/);
  assert.equal(couponGift(), null);
});

test('mudança de parcela aprovada invalida o desconto anterior e exige nova aplicação', async () => {
  await mount();
  discounted();
  current.offer.discount.master_installment_cents = 2990;
  await act(async () => win.dispatchEvent(new win.Event('focus')));
  await flush();
  normal();
  assert.match(host.textContent, /planos foram atualizados/);
  assert.equal(couponGift(), null);
});

test('navegação para outro parceiro não mantém cupom nem checkouts do parceiro anterior', async () => {
  await mount();
  discounted();
  current = offer('outro-parceiro');
  current.coupon = 'OUTRO10';
  await navigate('/outro-parceiro?CUPOM=PRESENTE50');
  normal();
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout('outro-parceiro_M'));
  assert.match(host.textContent, /cupom informado não é válido/);
});

test('compra reconfere a oferta e preserva exatamente o checkout promocional do parceiro', async () => {
  await mount();
  await act(async () => host.querySelector('[data-checkout-plan="master"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })));
  await flush();
  assert.deepEqual(opened, [checkout('fornecedor_MD')]);
});

test('falha ao reconferir bloqueia a compra e não preserva o desconto antigo', async () => {
  await mount();
  discounted();
  current = new Error('offline');
  await act(async () => win.dispatchEvent(new win.Event('focus')));
  await flush();
  normal();
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), null);
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('aria-disabled'), 'true');
});


test('cupom aplicado mantém entrada simples, mostra presente e remover oculta o presente', async () => {
  await mount();
  const form = couponForm();
  const input = host.querySelector('#dropealy-coupon');
  discounted();
  assert.equal(couponToggle(), undefined);
  assert.equal(input.value, 'PRESENTE50');
  assert.equal(input.getAttribute('placeholder'), 'Digite seu cupom');
  assert.equal(normalized(form.querySelector('button[type="submit"]')), 'APLICAR');
  assert.equal(form.querySelector('label:not(.sr-only)'), null);
  assert.equal(host.querySelector('.coupon-control__promotion'), null);
  assert.match(normalized(couponGift()), /CUPOM PRESENTE APLICADO.*PRESENTE50/i);
  assert.doesNotMatch(normalized(couponGift()), /compra realizada|pagamento aprovado|cupom comprado/i);
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout('fornecedor_MD'));
  await clickText('Remover cupom');
  assert.equal(couponGift(), null);
  assert.equal(couponForm(), form);
  assert.equal(host.querySelector('#dropealy-coupon'), input);
  assert.equal(input.value, '');
  normal();
  assertNormalLinks();
});

test('cupom manual aprovado com preços de 197 e 297 à vista não inventa parcelas', async () => {
  current.offer.discount.master_installment_cents = null;
  await mount('/fornecedor');
  normal();
  await openCoupon();
  await setInput('  presente50  ');
  await submitCoupon();
  assert.equal(price().querySelector('span'), null);
  assert.equal(price().querySelector('strong').textContent, 'R$ 297');
  assert.equal(price().classList.contains('pricing-card__price--promotional'), true);
  assert.equal(trial().querySelector('.pricing-card__price').classList.contains('pricing-card__price--promotional'), true);
  assert.match(normalized(host.querySelector('.coupon-applied-bar')), /PRESENTE50/);
  assert.match(normalized(trial()), /R\$ 197/);
  assert.doesNotMatch(normalized(master()), /Total no parcelamento/);
  assert.equal(host.querySelector('[data-checkout-plan="master"]').getAttribute('href'), checkout('fornecedor_MD'));
  assert.equal(host.querySelector('[data-checkout-plan="trial"]').getAttribute('href'), checkout('fornecedor_TD'));
  await clickText('Remover cupom');
  normal();
  assertNormalLinks();
});

test('cupom inválido não altera preços nem destinos do parceiro', async () => {
  await mount('/fornecedor?CUPOM=INVALIDO');
  normal();
  assertNormalLinks();
  assert.match(host.textContent, /cupom informado não é válido/);
  if (!couponForm() || couponForm().hidden) await openCoupon();
  await setInput('INVALIDO');
  await submitCoupon();
  normal();
  assertNormalLinks();
  assert.match(normalized(couponForm()), /cupom não é válido/);
  assert.equal(couponGift(), null);
});

test('ofc antigo com cupom publicado exibe o botão, porém não autoriza oferta promocional', async () => {
  current = offer('ofc');
  delete current.offer;
  current.checkout.starter = checkout('ofc_S');
  await mount('/ofc');
  normal();
  assertNormalLinks('ofc');
  assert.equal(couponToggle().getAttribute('aria-expanded'), 'false');
  await openCoupon();
  assert.equal(couponForm().hidden, false);
  assert.equal(couponGift(), null);
  assert.equal(host.querySelector('#dropealy-coupon').disabled, true);
  assert.equal(couponForm().querySelector('button[type="submit"]').disabled, true);
  await setInput('PRESENTE50');
  await submitCoupon();
  normal();
  assertNormalLinks('ofc');
});

test('permissão desligada em modo cupom não habilita aplicar nem altera preço via URL', async () => {
  current.offer.coupon_enabled = false;
  await mount();
  normal();
  assertNormalLinks();
  if (!couponForm() || couponForm().hidden) await openCoupon();
  assert.equal(couponGift(), null);
  assert.equal(host.querySelector('#dropealy-coupon').disabled, true);
  assert.equal(couponForm().querySelector('button[type="submit"]').disabled, true);
  await submitCoupon();
  normal();
  assertNormalLinks();
});

test('página padrão sem identificador publicado não mostra controle de cupom', async () => {
  current.offer.mode = 'standard';
  current.offer.coupon_enabled = false;
  current.coupon = null;
  current.offer.discount = { ready: false, trial_cents: null, master_cents: null, checkout: { trial: null, master: null } };
  await mount('/fornecedor');
  normal();
  assertNormalLinks();
  assert.equal(couponToggle(), undefined);
  assert.equal(couponForm(), null);
});

test('CSS mantém o prefixo branco e mostra os valores promocionais dos dois planos em verde', () => {
  const css = readFileSync(path.join(rootPath, 'src/index.css'), 'utf8');
  assert.match(css, /\.pricing-card__price span\s*\{[^}]*color:\s*#fff;/);
  assert.match(css, /\.pricing-card__price--master strong\s*\{\s*color:\s*#ffeb78;/);
  assert.match(css, /\.pricing-card__price\.pricing-card__price--promotional strong\s*\{\s*color:\s*#4ade80;/);
});

