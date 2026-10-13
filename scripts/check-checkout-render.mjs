import { mkdirSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { promoRevision, validatePublishedPromo } from '../src/lib/promoCreator.mjs';

const tempDir = '.checkout-render-test';
try {
  mkdirSync(tempDir, { recursive: true });
  const outfile = `${tempDir}/render.mjs`;
  await build({
    stdin: { contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import Features from './src/components/Features.jsx';
      import { CheckoutContext } from './src/components/CheckoutProvider.jsx';
      export const after = state => renderToStaticMarkup(React.createElement(CheckoutContext.Provider, { value: state }, React.createElement(Features)));
    `, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
    external: ['react', 'react-dom/server', 'react/jsx-runtime'], outfile,
  });
  const { after } = await import(pathToFileURL(resolve(outfile)));
  const stripMetadata = html => html.replace(/ data-checkout-plan="(?:starter|trial|master)"/g, '');
  const home = after({ route: { kind: 'home', slug: null }, status: 'home', data: null });
  const original = stripMetadata(home);
  assert.deepEqual([...home.matchAll(/data-checkout-plan="([^"]+)"/g)].map(match => match[1]), ['trial', 'master']);
  assert.match(home, /R\$ 247/);
  assert.match(home, /R\$ 497/);
  assert.doesNotMatch(home, /12x|parcelamento|49,90|598,80|dropealy-coupon/);
  for (const slug of ['parceiro-a', 'parceiro-b']) {
    const checkout = Object.fromEntries(['starter', 'trial', 'master'].map(plan => [plan, `https://checkout.perfectpay.com.br/pay/${slug}-${plan}?ref=${slug}`]));
    const html = after({ route: { kind: 'partner', slug }, status: 'ready', data: { slug, checkout } });
    let expected = original;
    for (const [code, plan] of [['PPU38CQGI6H?', 'trial'], ['PPU38CQGGNH?', 'master']]) {
      expected = expected.replaceAll(`https://checkout.perfectpay.com.br/pay/${code}`, checkout[plan]);
    }
    assert.equal(stripMetadata(html), expected, 'Só os dois destinos de checkout podem mudar.');
  }
  const slug = 'cupom-local';
  // Test fixtures only: no promotional amounts or checkout codes are added to production data.
  const fixture = {
    slug, version: 1, status: 'published', coupon: 'TESTE_LOCAL',
    checkout: { starter: 'https://checkout.perfectpay.com.br/pay/LOCAL-STARTER?ref=local',
      trial: 'https://checkout.perfectpay.com.br/pay/LOCAL-TRIAL?ref=local', master: 'https://checkout.perfectpay.com.br/pay/LOCAL-MASTER?ref=local' },
    offer: { mode: 'coupon', coupon_enabled: true, normal: { trial_cents: 24700, master_cents: 49700 },
      discount: { ready: true, trial_cents: 19700, master_cents: 39700,
        checkout: { trial: 'https://checkout.perfectpay.com.br/pay/LOCAL-DISCOUNT-TRIAL?ref=local&src=teste',
          master: 'https://checkout.perfectpay.com.br/pay/LOCAL-DISCOUNT-MASTER?ref=local&src=teste' } } },
  };
  const data = validatePublishedPromo(fixture, slug);
  const state = { route: { kind: 'partner', slug }, status: 'ready', data };
  const waiting = after(state);
  assert.match(waiting, /dropealy-coupon/);
  assert.doesNotMatch(waiting, /LOCAL-DISCOUNT|R\$ 197|R\$ 397|pricing-card__original/);
  const applied = after({ ...state, couponAppliedRevision: promoRevision(data), couponInput: 'TESTE_LOCAL' });
  assert.match(applied, /R\$ 197/);
  assert.match(applied, /R\$ 397/);
  assert.equal((applied.match(/class="pricing-card__original"/g) || []).length, 2);
  for (const href of Object.values(data.offer.discount.checkout)) {
    assert.ok(applied.includes(`href="${href.replaceAll('&', '&amp;')}"`), 'Cada CTA usa o checkout promocional aprovado exato.');
  }
  assert.doesNotMatch(applied, /12x|parcelamento|49,90|598,80/);
  for (const offer of [{ ...data.offer, mode: 'standard', coupon_enabled: false },
    { ...data.offer, discount: { ready: false, trial_cents: null, master_cents: null, checkout: { trial: null, master: null } } }]) {
    const html = after({ ...state, data: { ...data, offer }, couponAppliedRevision: promoRevision(data) });
    assert.doesNotMatch(html, /dropealy-coupon|LOCAL-DISCOUNT|R\$ 197|R\$ 397|pricing-card__original/);
    assert.match(html, /R\$ 247/);
    assert.match(html, /R\$ 497/);
  }
  for (const status of ['loading', 'error', 'not_found']) {
    const html = after({ route: { kind: 'partner', slug: 'parceiro-a' }, status, data: null });
    assert.equal((html.match(/aria-disabled="true"/g) || []).length, 2);
    assert.doesNotMatch(html, /href="https:\/\/checkout\.(?:perfectpay|centerpag)/);
  }
  console.log('Renderização validada: 2 planos; preços normais sem parcelas; cupom pronto/aplicado/OFF/incompleto; parceiros isolados e falhas sem checkout alternativo.');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
