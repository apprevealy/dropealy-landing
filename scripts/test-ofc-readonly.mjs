// Verificação específica de /ofc. Não aprova páginas nem modifica dados.
// Os destinos abaixo já existem na landing pública; foram comparados aos blocos 2/3.
// A única simulação é responder published no navegador LOCAL, nunca no servidor.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { validatePublishedPromo } from '../src/lib/promoCreator.mjs';

const out = 'ofc-test-results';
mkdirSync(out, { recursive: true });
const origin = 'http://127.0.0.1:4175';
const endpoint = 'https://app.dropealy.com/api/public/promo-creator/ofc';
const checkout = {
  starter: 'https://checkout.perfectpay.com.br/pay/PPU38CQGGMG?',
  trial: 'https://checkout.perfectpay.com.br/pay/PPU38CQGI6H?',
  master: 'https://checkout.perfectpay.com.br/pay/PPU38CQGGNH?',
};
const simulatedPublished = { slug: 'ofc', version: 1, status: 'published', checkout, coupon: 'PRESENTE50' };
const report = { startedAt: new Date().toISOString(), slug: 'ofc', mode: 'read-only', approvalChanged: false, simulatedApprovalOnlyInLocalBrowser: true, checks: [], providerReads: {} };
const wait = ms => new Promise(r => setTimeout(r, ms));
let server, browser;
async function read(url, extra = {}) {
  const r = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(12000), headers: { Accept: 'text/html,application/json', ...extra } });
  return { status: r.status, contentType: r.headers.get('content-type'), etag: r.headers.get('etag'), cors: r.headers.get('access-control-allow-origin'), cacheControl: r.headers.get('cache-control'), text: await r.text() };
}
async function check(name, fn) {
  try { await fn(); report.checks.push({ name, passed: true }); console.log('OK: ' + name); }
  catch (e) { report.checks.push({ name, passed: false, error: e.message }); throw e; }
}
try {
  const before = await read('https://www.dropealy.com/');
  report.productionBefore = { status: before.status, etag: before.etag };
  await check('Página inicial de produção responde antes do teste', () => assert.equal(before.status, 200));
  const actual = await read(endpoint, { Origin: 'https://www.dropealy.com' });
  report.publicApi = { status: actual.status, cors: actual.cors, cacheControl: actual.cacheControl, contentType: actual.contentType };
  await check('API real de ofc mantém a página pendente indisponível', () => {
    assert.equal(actual.status, 404);
    assert.deepEqual(JSON.parse(actual.text), { error: 'not_found' });
    assert.equal(actual.cors, '*');
    assert.match(actual.cacheControl || '', /no-store/);
  });
  await check('Cliente aceita o mapeamento salvo sem reescrever URLs ou cupom', () => {
    assert.deepEqual(validatePublishedPromo(simulatedPublished, 'ofc'), simulatedPublished);
  });
  for (const [plan, url] of Object.entries(checkout)) {
    try {
      const result = await read(url);
      // Não registrar cookies, HTML completo, tokens de formulário nem dados de compra.
      report.providerReads[plan] = {
        status: result.status,
        title: result.text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.slice(0, 200) || null,
        mentionsDropealy: /dropealy/i.test(result.text),
        mentionsExpectedPlan: (plan === 'master' ? /master|vital[ií]cio/i : plan === 'trial' ? /trial|trimestral/i : /starter|mensal/i).test(result.text),
        commercialOwnershipVerified: false,
      };
    } catch (error) { report.providerReads[plan] = { error: error.name, commercialOwnershipVerified: false }; }
  }
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await wait(200);
  }
  assert.ok(ready);
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    const label = viewport.width === 390 ? 'celular' : 'desktop';
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    let simulated = false;
    await context.route('**/*', async route => {
      const request = route.request();
      if (request.method() !== 'GET') return route.abort();
      const url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (request.url() === endpoint) return route.fulfill({
        status: simulated ? 200 : actual.status,
        headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
        contentType: 'application/json',
        body: simulated ? JSON.stringify(simulatedPublished) : actual.text,
      });
      if (url.origin === 'https://app.dropealy.com') return route.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{"error":"not_found"}' });
      return route.abort(); // Inclui destinos de compra; nenhum pagamento é iniciado.
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    async function blocked() {
      await page.waitForFunction(() => {
        const links = [...document.querySelectorAll('a[data-checkout-plan]')];
        return links.length === 5 && links.every(a => !a.hasAttribute('href') && a.getAttribute('aria-disabled') === 'true');
      });
    }
    await check(`${label}: resposta real pendente bloqueia os cinco botões`, async () => {
      await page.goto(`${origin}/ofc`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('status').filter({ hasText: 'ainda não aprovada' }).waitFor();
      await blocked();
      await page.locator('#planos').screenshot({ path: `${out}/${label}-ofc-pendente.png`, animations: 'disabled' });
    });
    await check(`${label}: aprovação simulada localmente usa os três checkouts exatos`, async () => {
      simulated = true;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => [...document.querySelectorAll('a[data-checkout-plan]')].length === 5 && [...document.querySelectorAll('a[data-checkout-plan]')].every(a => a.hasAttribute('href')));
      for (const anchor of await page.locator('a[data-checkout-plan]').all()) {
        const plan = await anchor.getAttribute('data-checkout-plan');
        assert.equal(await anchor.getAttribute('href'), checkout[plan]);
      }
      assert.equal(await page.getByRole('status').count(), 0);
      assert.equal(await page.locator('#planos a').count(), 3);
      await page.locator('#planos').screenshot({ path: `${out}/${label}-ofc-aprovacao-SIMULADA.png`, animations: 'disabled' });
    });
    await check(`${label}: outro slug não herda os checkouts de ofc`, async () => {
      await page.evaluate(() => history.pushState(null, '', '/outro-teste-ofc'));
      await page.getByRole('status').filter({ hasText: 'ainda não aprovada' }).waitFor();
      await blocked();
    });
    await check(`${label}: sem a simulação, ofc continua bloqueada ao recarregar`, async () => {
      simulated = false;
      await page.goto(`${origin}/ofc/`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('status').filter({ hasText: 'ainda não aprovada' }).waitFor();
      await blocked();
      assert.deepEqual(errors, []);
    });
    await context.close();
  }
  const after = await read('https://www.dropealy.com/');
  report.productionAfter = { status: after.status, etag: after.etag };
  await check('Produção mantém HTTP 200, HTML e ETag durante o teste', () => {
    assert.equal(after.status, 200); assert.equal(after.etag, before.etag); assert.equal(after.text, before.text);
  });
  const finalApi = await read(endpoint);
  await check('API de ofc continua pendente no encerramento', () => {
    assert.equal(finalApi.status, 404); assert.deepEqual(JSON.parse(finalApi.text), { error: 'not_found' });
  });
} catch (error) { report.error = error.message; process.exitCode = 1; }
finally {
  await browser?.close(); server?.kill('SIGTERM');
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.filter(x => x.passed).length;
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
