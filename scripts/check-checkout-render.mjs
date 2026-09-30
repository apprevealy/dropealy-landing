import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const baselinePath = 'src/components/__CheckoutBaseline.jsx';
const tempDir = '.checkout-render-test';
try {
  const baseline = execFileSync('git', ['show', '4e1b010ed720904d04fdeaabfffb55ebf59b2ce5:src/components/Features.jsx'], { encoding: 'utf8' });
  writeFileSync(baselinePath, baseline);
  mkdirSync(tempDir, { recursive: true });
  const outfile = `${tempDir}/render.mjs`;
  await build({
    stdin: { contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import Baseline from './src/components/__CheckoutBaseline.jsx';
      import Features from './src/components/Features.jsx';
      import { CheckoutContext } from './src/components/CheckoutProvider.jsx';
      export const before = () => renderToStaticMarkup(React.createElement(Baseline));
      export const after = state => renderToStaticMarkup(React.createElement(CheckoutContext.Provider, { value: state }, React.createElement(Features)));
    `, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
    external: ['react', 'react-dom/server', 'react/jsx-runtime'], outfile,
  });
  const { before, after } = await import(pathToFileURL(resolve(outfile)));
  const stripMetadata = html => html.replace(/ data-checkout-plan="(?:starter|trial|master)"/g, '');
  const original = before();
  const home = after({ route: { kind: 'home', slug: null }, status: 'home', data: null });
  assert.equal(stripMetadata(home), original, 'A página inicial deve preservar integralmente o HTML e os links.');
  assert.equal((home.match(/data-checkout-plan=/g) || []).length, 5);
  for (const slug of ['parceiro-a', 'parceiro-b']) {
    const checkout = Object.fromEntries(['starter', 'trial', 'master'].map(plan => [plan, `https://checkout.perfectpay.com.br/pay/${slug}-${plan}?ref=${slug}`]));
    const html = after({ route: { kind: 'partner', slug }, status: 'ready', data: { slug, checkout } });
    let expected = original;
    for (const [code, plan] of [['PPU38CQGGMG?', 'starter'], ['PPU38CQGGNH?', 'master'], ['PPU38CQGI6H?', 'trial'], ['PPU38CQDJIE', 'starter'], ['PPU38CQDIQM', 'master']]) {
      expected = expected.replaceAll(`https://checkout.perfectpay.com.br/pay/${code}`, checkout[plan]);
    }
    assert.equal(stripMetadata(html), expected, 'Só os cinco destinos de checkout podem mudar.');
  }
  for (const status of ['loading', 'error', 'not_found']) {
    const html = after({ route: { kind: 'partner', slug: 'parceiro-a' }, status, data: null });
    assert.equal((html.match(/aria-disabled="true"/g) || []).length, 5);
    assert.doesNotMatch(html, /href="https:\/\/checkout\.(?:perfectpay|centerpag)/);
  }
  console.log('Renderização validada: início preservado; 2 parceiros; 5 botões; carregamento e falhas sem checkout alternativo.');
} finally {
  rmSync(baselinePath, { force: true });
  rmSync(tempDir, { recursive: true, force: true });
}
