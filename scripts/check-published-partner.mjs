// Aplicação compilada + API pública REAL. Só leitura, sem sessão, aprovação ou compra.
// A resposta aprovada NÃO é simulada. Os testes negativos usam uma rota inexistente.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { chromium } from 'playwright';
import { fetchPublishedPromo } from '../src/lib/promoCreator.mjs';

const slug = process.env.PROMO_TEST_SLUG || 'ofc';
const origin = 'http://127.0.0.1:4174';
const output = 'published-partner-results';
const api = `https://app.dropealy.com/api/public/promo-creator/${slug}`;
const report = { checkedAt: new Date().toISOString(), codeSha: process.env.GITHUB_SHA || null,
  application: 'compilação local no CI', partnerApi: 'real, publicada', slug,
  databaseWrites: 0, payments: 0, checks: [] };
mkdirSync(output, { recursive: true });
let browser, server;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function record(name, action) { await action(); report.checks.push({ name, passed: true }); console.log(`OK: ${name}`); }
async function get(url) {
  const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `HTTP ${response.status}: ${new URL(url).pathname}`);
  return response;
}
function cssPath(html) { const result = html.match(/href="(\/assets\/[^" ]+\.css)"/); assert.ok(result); return result[1]; }
async function normalizeCards(page) {
  return page.locator('#planos').evaluate(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('a').forEach(a => ['href', 'data-checkout-plan', 'aria-disabled', 'tabindex', 'title'].forEach(attr => a.removeAttribute(attr)));
    return clone.outerHTML;
  });
}
async function verifyLinks(page, approved) {
  await page.waitForFunction(data => {
    const anchors = [...document.querySelectorAll('a[data-checkout-plan]')];
    return anchors.length === 5 && anchors.every(a => a.getAttribute('href') === data.checkout[a.dataset.checkoutPlan]);
  }, approved, { timeout: 15000 });
  const anchors = await page.locator('a[data-checkout-plan]').evaluateAll(elements => elements.map(a => ({ plan: a.dataset.checkoutPlan, href: a.getAttribute('href') })));
  assert.equal(anchors.length, 5);
  for (const a of anchors) assert.equal(a.href, approved.checkout[a.plan]);
}
try {
  let approved;
  await record('API real entrega apenas a configuração aprovada, com os três planos', async () => {
    approved = await fetchPublishedPromo(slug, { timeoutMs: 15000 });
    assert.ok(approved.checkout.trial, 'O parceiro de teste precisa dos três planos.');
    report.publishedVersion = approved.version;
    const response = await get(api);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    assert.match(response.headers.get('cache-control') || '', /no-store/);
    assert.deepEqual(await response.json(), approved);
  });
  await record('CSS da compilação é idêntico ao site principal atual', async () => {
    const liveHtml = await (await get('https://www.dropealy.com/')).text();
    const liveCss = await (await get(`https://www.dropealy.com${cssPath(liveHtml)}`)).arrayBuffer();
    const localHtml = readFileSync('dist/index.html', 'utf8');
    const localCss = readFileSync(`dist${cssPath(localHtml)}`);
    assert.equal(hash(Buffer.from(liveCss)), hash(localCss));
    report.cssSha256 = hash(localCss);
  });
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 50; i++) { try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {} await delay(200); }
  assert.ok(ready, 'Servidor local não iniciou.');
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    const label = viewport.width === 390 ? 'celular' : 'computador';
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    let blockedWrites = 0;
    await context.route('**/*', async route => {
      const request = route.request();
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) { blockedWrites++; return route.abort(); }
      const host = new URL(request.url()).hostname;
      if (host === 'checkout.perfectpay.com.br' || host === 'checkout.centerpag.com') return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#planos');
    const cards = await normalizeCards(page);
    await record(`${label}: /${slug} carrega os cinco destinos da API real`, async () => {
      const apiResponse = page.waitForResponse(response => response.url() === api && response.status() === 200, { timeout: 20000 });
      await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
      await apiResponse;
      await verifyLinks(page, approved);
      assert.equal(await normalizeCards(page), cards);
      await page.locator('#planos').screenshot({ path: `${output}/${label}-${slug}-aprovado.png`, animations: 'disabled' });
    });
    await record(`${label}: recarregamento e barra final mantêm os checkouts`, async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }); await verifyLinks(page, approved);
      await page.goto(`${origin}/${slug}/`, { waitUntil: 'domcontentloaded' }); await verifyLinks(page, approved);
    });
    await record(`${label}: página inexistente não herda os checkouts do parceiro`, async () => {
      const missing = `qa-nao-publicada-${randomBytes(8).toString('hex')}`;
      const response = await fetch(`https://app.dropealy.com/api/public/promo-creator/${missing}`);
      assert.equal(response.status, 404);
      await page.goto(`${origin}/${missing}`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('status').filter({ hasText: 'ainda não aprovada' }).waitFor({ timeout: 15000 });
      assert.equal(await page.locator('a[data-checkout-plan][href]').count(), 0);
      await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' }); await verifyLinks(page, approved);
    });
    assert.deepEqual(errors, [], `Erro JavaScript no ${label}`);
    report[`${label}BlockedWrites`] = blockedWrites;
    await context.close();
  }
  await record('API continua com a mesma versão e checkouts após os testes', async () => {
    assert.deepEqual(await fetchPublishedPromo(slug, { timeoutMs: 15000 }), approved);
  });
  report.passed = report.checks.length;
} catch (error) { report.error = error.message; throw error; }
finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser?.close(); server?.kill('SIGTERM');
}
