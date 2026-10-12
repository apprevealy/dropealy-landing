import { mkdirSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

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
  for (const slug of ['parceiro-a', 'parceiro-b']) {
    const checkout = Object.fromEntries(['starter', 'trial', 'master'].map(plan => [plan, `https://checkout.perfectpay.com.br/pay/${slug}-${plan}?ref=${slug}`]));
    const html = after({ route: { kind: 'partner', slug }, status: 'ready', data: { slug, checkout } });
    let expected = original;
    for (const [code, plan] of [['PPU38CQGI6H?', 'trial'], ['PPU38CQGGNH?', 'master']]) {
      expected = expected.replaceAll(`https://checkout.perfectpay.com.br/pay/${code}`, checkout[plan]);
    }
    assert.equal(stripMetadata(html), expected, 'Só os dois destinos de checkout podem mudar.');
  }
  for (const status of ['loading', 'error', 'not_found']) {
    const html = after({ route: { kind: 'partner', slug: 'parceiro-a' }, status, data: null });
    assert.equal((html.match(/aria-disabled="true"/g) || []).length, 2);
    assert.doesNotMatch(html, /href="https:\/\/checkout\.(?:perfectpay|centerpag)/);
  }
  console.log('Renderização validada: trimestral antes do vitalício; 2 parceiros; 2 botões; carregamento e falhas sem checkout alternativo.');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
