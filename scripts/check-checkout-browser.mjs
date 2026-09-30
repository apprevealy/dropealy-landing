// Testes reais de navegador, com servidor local e configurações de parceiros simuladas.
// Nenhuma compra, gravação no painel ou requisição externa é permitida neste teste.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const origin = 'http://127.0.0.1:4173';
const output = 'checkout-browser-results';
mkdirSync(output, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
const report = { simulatedPartnerData: true, realPartnerApprovalTested: false, externalWrites: 0, scenarios: [] };
let browser;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function record(name, fn) {
  await fn(); report.scenarios.push({ name, passed: true }); console.log(`OK: ${name}`);
}
function published(slug, version = 1) {
  return { slug, version, status: 'published', coupon: 'CUPOM_SIMULADO', checkout:
    Object.fromEntries(['starter', 'trial', 'master'].map(plan => [plan,
      `https://checkout.perfectpay.com.br/pay/SIMULADO-${slug}-${plan}-v${version}?ref=${slug}&src=teste`])) };
}
const homeLinks = { starter: 'https://checkout.perfectpay.com.br/pay/PPU38CQGGMG?',
  master: 'https://checkout.perfectpay.com.br/pay/PPU38CQGGNH?',
  trial: 'https://checkout.perfectpay.com.br/pay/PPU38CQGI6H?' };
async function waitReady(page, slug, version = 1) {
  await page.waitForFunction(({ slug, version }) => {
    const links = [...document.querySelectorAll('a[data-checkout-plan]')];
    return links.length === 5 && links.every(a => a.getAttribute('href')?.includes(`SIMULADO-${slug}-${a.dataset.checkoutPlan}-v${version}?`));
  }, { slug, version });
}
async function cardStructure(page) {
  return page.locator('#planos').evaluate(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('a').forEach(a => ['href', 'data-checkout-plan', 'aria-disabled', 'tabindex', 'title'].forEach(attr => a.removeAttribute(attr)));
    return clone.outerHTML;
  });
}
async function assertBlocked(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('a[data-checkout-plan]')].length === 5 &&
    [...document.querySelectorAll('a[data-checkout-plan]')].every(a => !a.hasAttribute('href') && a.getAttribute('aria-disabled') === 'true'));
}
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await delay(200);
  }
  assert.ok(ready, 'O servidor local não iniciou.');
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1365, height: 900 }, { width: 390, height: 844 }]) {
    const label = viewport.width === 390 ? 'celular' : 'desktop';
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const configs = new Map([['parceiro-a', published('parceiro-a')], ['parceiro-b', published('parceiro-b')],
      ['trial-legado', { ...published('trial-legado'), checkout: { ...published('trial-legado').checkout, trial: null } }]]);
    let calls = 0;
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET') return route.abort();
      if (url.origin === origin) return route.continue();
      if (url.origin === 'https://app.dropealy.com' && url.pathname.startsWith('/api/public/promo-creator/')) {
        calls++;
        const slug = url.pathname.split('/').pop();
        const status = slug === 'erro-api' ? 503 : slug === 'lento-a' || configs.has(slug) ? 200 : 404;
        const data = slug === 'lento-a' ? published(slug) : configs.get(slug) || { error: status === 503 ? 'unavailable' : 'not_found' };
        if (slug === 'lento-a') await delay(700);
        try { return await route.fulfill({ status, headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' }, contentType: 'application/json', body: JSON.stringify(data) }); }
        catch { return; } // A consulta antiga pode já ter sido cancelada ao trocar a rota.
      }
      return route.abort(); // Nunca abre os links de pagamento nem serviços externos.
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    let baseline;
    await record(`${label}: início mantém os três destinos e não consulta parceiros`, async () => {
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#planos');
      for (const [plan, href] of Object.entries(homeLinks)) assert.equal(await page.locator(`#planos a[data-checkout-plan="${plan}"]`).getAttribute('href'), href);
      assert.equal(calls, 0);
      baseline = await cardStructure(page);
    });
    for (const slug of ['parceiro-a', 'parceiro-b']) {
      await record(`${label}: ${slug} mantém o conteúdo visual e usa seus cinco destinos`, async () => {
        await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
        await waitReady(page, slug);
        assert.equal(await cardStructure(page), baseline);
        assert.equal(await page.locator('a[data-checkout-plan]').count(), 5);
        for (const a of await page.locator('a[data-checkout-plan]').all()) {
          const plan = await a.getAttribute('data-checkout-plan');
          assert.equal(await a.getAttribute('href'), configs.get(slug).checkout[plan]);
        }
        await page.locator('#planos').screenshot({ path: `${output}/${label}-${slug}-planos.png`, animations: 'disabled' });
      });
    }
    await record(`${label}: versão publicada muda ao recarregar, sem recompilar`, async () => {
      await page.goto(`${origin}/parceiro-a`);
      await waitReady(page, 'parceiro-a');
      configs.set('parceiro-a', published('parceiro-a', 2));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitReady(page, 'parceiro-a', 2);
    });
    for (const slug of ['sem-publicacao', 'erro-api']) {
      await record(`${label}: ${slug} não oferece checkout alternativo`, async () => {
        await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
        await page.getByRole('status').filter({ hasText: slug === 'erro-api' ? 'temporariamente' : 'ainda não aprovada' }).waitFor();
        await assertBlocked(page);
      });
    }
    await record(`${label}: Trial legado nulo não usa o link de outro plano`, async () => {
      await page.goto(`${origin}/trial-legado`);
      await page.waitForFunction(() => document.querySelector('a[data-checkout-plan="starter"]')?.getAttribute('href')?.includes('SIMULADO-trial-legado'));
      assert.equal(await page.locator('a[data-checkout-plan="trial"]').getAttribute('href'), null);
      assert.equal(await page.locator('#planos a[data-checkout-plan="master"]').getAttribute('href'), configs.get('trial-legado').checkout.master);
    });
    await record(`${label}: troca rápida de endereço descarta a resposta antiga`, async () => {
      await page.goto(`${origin}/lento-a`, { waitUntil: 'domcontentloaded' });
      await assertBlocked(page);
      await page.evaluate(() => history.pushState(null, '', '/parceiro-b'));
      await waitReady(page, 'parceiro-b');
      await delay(850);
      await waitReady(page, 'parceiro-b');
    });
    assert.deepEqual(pageErrors, [], `Erros de execução no ${label}.`);
    await context.close();
  }
  report.passed = report.scenarios.length;
  console.log(JSON.stringify({ passed: report.passed, simulatedPartnerData: true, externalWrites: 0 }));
} catch (error) {
  report.error = error.message;
  throw error;
} finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  server.kill('SIGTERM');
}
