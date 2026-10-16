// Smoke visual local: dados publicados simulados, sem compras nem chamadas externas.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright');

const origin = 'http://127.0.0.1:4174';
const output = process.env.COUPON_SMOKE_OUTPUT || path.resolve('coupon-entry-browser-results');
mkdirSync(output, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: 'ignore' });
const report = { simulatedPartnerData: true, externalWrites: 0, blockedExternalRequests: 0, scenarios: [] };
const checkout = (slug, plan, discount = false) => `https://checkout.centerpag.com/pay/${slug}_${plan}${discount ? '_D' : ''}?ref=a%2Fb&tag=1%262`;
function published(slug, enabled = true) {
  return { slug, version: 1, status: 'published', coupon: 'PRESENTE50',
    checkout: { starter: null, trial: checkout(slug, 'T'), master: checkout(slug, 'M') },
    offer: { mode: enabled ? 'coupon' : 'standard', coupon_enabled: enabled,
      normal: { trial_cents: 24700, master_cents: 49700 },
      discount: { ready: true, trial_cents: 19700, master_cents: 29700, master_installment_cents: null,
        checkout: { trial: checkout(slug, 'T', true), master: checkout(slug, 'M', true) } } } };
}
const configs = new Map([['parceiro', published('parceiro')], ['ofc', published('ofc', false)]]);
let browser;
async function prices(page, slug, discounted) {
  const data = configs.get(slug);
  const links = discounted ? data.offer.discount.checkout : data.checkout;
  await page.waitForFunction(({ links, discounted }) => {
    const master = document.querySelector('#planos .pricing-card--featured');
    const trial = document.querySelector('#planos .pricing-card:not(.pricing-card--featured)');
    return master?.querySelector('[data-checkout-plan]')?.getAttribute('href') === links.master &&
      trial?.querySelector('[data-checkout-plan]')?.getAttribute('href') === links.trial &&
      trial?.querySelector('.pricing-card__price strong')?.textContent.trim() === (discounted ? 'R$ 197' : 'R$ 247') &&
      master?.querySelector('.pricing-card__price strong')?.textContent.trim() === (discounted ? 'R$ 297' : 'R$ 49,90');
  }, { links, discounted });
}
async function record(name, run) {
  await run();
  report.scenarios.push({ name, passed: true });
  console.log(`OK: ${name}`);
}
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Servidor local disponível');
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    const label = viewport.width > 1000 ? 'desktop' : 'mobile';
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.route('**/*', async route => {
      const req = route.request();
      const url = new URL(req.url());
      assert.equal(req.method(), 'GET', 'Nenhuma escrita deve ser feita');
      if (url.origin === origin) return route.continue();
      if (url.origin === 'https://app.dropealy.com' && url.pathname.startsWith('/api/public/promo-creator/')) {
        assert.equal(req.headers().authorization, undefined);
        assert.equal(req.headers().cookie, undefined);
        const data = configs.get(url.pathname.split('/').pop());
        return route.fulfill({ status: data ? 200 : 404, contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' }, body: JSON.stringify(data || {}) });
      }
      report.blockedExternalRequests++;
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const toggle = page.getByRole('button', { name: 'TEM UM CUPOM OU INDICAÇÃO?', exact: true });
    const input = page.locator('#dropealy-coupon');
    await record(`${label}: botão amarelo em pílula abre o formulário sem transbordar`, async () => {
      await page.goto(`${origin}/parceiro`);
      await prices(page, 'parceiro', false);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('#dropealy-coupon-panel').isVisible(), false);
      const style = await toggle.evaluate(el => ({ background: getComputedStyle(el).backgroundImage,
        borderRadius: getComputedStyle(el).borderRadius, height: el.getBoundingClientRect().height }));
      assert.match(style.background, /linear-gradient.*227, 165, 38.*255, 231, 117/);
      assert.equal(style.borderRadius, '999px');
      assert.ok(style.height >= 59);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await toggle.scrollIntoViewIfNeeded();
      await page.locator('.coupon-entry').screenshot({ path: path.join(output, `${label}-closed.png`), animations: 'disabled' });
      await toggle.click();
      assert.equal(await toggle.count(), 0);
      await input.waitFor({ state: 'visible' });
      assert.equal(await input.isEnabled(), true);
      assert.equal(await input.getAttribute('placeholder'), 'Digite seu cupom');
      assert.equal(await page.locator('.coupon-control__promotion').count(), 0);
      assert.equal(await page.locator('.coupon-entry__gift').count(), 0);
    });
    await record(`${label}: aplicar e remover usa R$197/R$297 e URLs exatas do parceiro`, async () => {
      await input.fill('  presente50  ');
      await page.getByRole('button', { name: 'APLICAR', exact: true }).click();
      await prices(page, 'parceiro', true);
      assert.equal(await input.inputValue(), 'PRESENTE50');
      assert.match(await page.locator('.coupon-entry__gift').textContent(), /CUPOM PRESENTE APLICADO/i);
      assert.equal(await input.isVisible(), true);
      assert.equal(await page.getByRole('button', { name: 'APLICAR', exact: true }).isVisible(), true);
      assert.equal(await page.locator('#planos .pricing-card--featured .pricing-card__price span').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#planos').screenshot({ path: path.join(output, `${label}-applied.png`), animations: 'disabled' });
      await page.getByRole('button', { name: 'Remover cupom', exact: true }).click();
      await prices(page, 'parceiro', false);
      assert.equal(await page.locator('.coupon-entry__gift').count(), 0);
    });
    await record(`${label}: URL válida autoaplica e abre o campo`, async () => {
      await page.goto(`${origin}/parceiro?CUPOM=PRESENTE50`);
      await prices(page, 'parceiro', true);
      assert.equal(await toggle.count(), 0);
      assert.equal(await input.isVisible(), true);
      assert.equal(await page.locator('.coupon-entry__gift').count(), 1);
    });
    await record(`${label}: cupom publicado inativo mostra orientação e mantém oferta normal`, async () => {
      await page.goto(`${origin}/ofc?CUPOM=PRESENTE50`);
      await prices(page, 'ofc', false);
      if (await toggle.count()) await toggle.click();
      assert.equal(await input.isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: 'APLICAR', exact: true }).isDisabled(), true);
      assert.match(await page.locator('#dropealy-coupon-message').textContent(), /ainda não está ativo/);
      assert.equal(await page.locator('.coupon-entry__gift').count(), 0);
    });
    assert.deepEqual(errors, [], `Sem erros de execução: ${label}`);
    assert.equal(context.pages().length, 1);
    await context.close();
  }
  report.passed = report.scenarios.length;
  console.log(JSON.stringify(report));
} catch (error) {
  report.error = error.message;
  throw error;
} finally {
  writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close();
  server.kill('SIGTERM');
}
