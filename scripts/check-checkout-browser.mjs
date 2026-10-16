// Testes reais de navegador, com servidor local e configurações de parceiros simuladas.
// Nenhuma compra, gravação no painel ou requisição externa é permitida neste teste.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const origin = 'http://127.0.0.1:4173';
const output = 'checkout-browser-results';
mkdirSync(output, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
const report = { simulatedPartnerData: true, realPartnerApprovalTested: false, externalWrites: 0,
  checkoutNavigationStubbed: true, pollingTimerSimulated: true, blockedExternalRequests: 0, scenarios: [] };
let browser;
const heldResponses = new Set();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function record(name, fn) {
  await fn(); report.scenarios.push({ name, passed: true }); console.log(`OK: ${name}`);
}
function published(slug, version = 1) {
  return { slug, version, status: 'published', coupon: 'CUPOM_SIMULADO', checkout:
    Object.fromEntries(['starter', 'trial', 'master'].map(plan => [plan,
      `https://checkout.perfectpay.com.br/pay/SIMULADO-${slug}-${plan}-v${version}?ref=${slug}&src=teste`])) };
}
// Preços e destinos inventados exclusivamente para este teste, sem ofertas reais.
function couponPublished(slug, version = 1) {
  return { ...published(slug, version), offer: {
    mode: 'coupon', coupon_enabled: true,
    normal: { trial_cents: 24700, master_cents: 49700 },
    discount: { ready: true, trial_cents: 19789, master_cents: 39745, checkout: {
      trial: `https://checkout.perfectpay.com.br/pay/CUPOM-${slug}-trial-v${version}?ref=${slug}%2Fa&src=cupom&src=segundo&tag=a%2Bb`,
      master: `https://checkout.centerpag.com/pay/CUPOM-${slug}-master-v${version}?ref=${slug}%2Fa&src=cupom%2Fmaster&tag=1%262`,
    } },
  } };
}
async function waitOffer(page, data, discounted = false) {
  const links = discounted ? data.offer.discount.checkout : data.checkout;
  const prices = discounted ? ['R$ 197,89', 'R$ 397,45'] : ['R$ 247', 'R$ 49,90'];
  await page.waitForFunction(({ links, prices, discounted }) => {
    const cards = [...document.querySelectorAll('#planos .pricing-card')];
    return cards.length === 2 && cards.every((card, i) => {
      const link = card.querySelector('a[data-checkout-plan]');
      return link && link.getAttribute('href') === links[link.dataset.checkoutPlan] &&
        card.querySelector('.pricing-card__price strong')?.textContent.trim() === prices[i];
    }) && document.querySelectorAll('#planos .pricing-card__original s').length === (discounted ? 2 : 0);
  }, { links, prices, discounted });
}
async function showCoupon(page) {
  const toggle = page.getByRole('button', { name: 'TEM UM CUPOM OU INDICAÇÃO?', exact: true });
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
}
async function applyCoupon(page, data, input = '  cupom_simulado  ') {
  await showCoupon(page);
  await page.getByLabel('Cupom de indicação', { exact: true }).fill(input);
  await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
  await waitOffer(page, data, true);
  assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), 'CUPOM_SIMULADO');
  assert.equal(await page.locator('#dropealy-coupon-message').textContent(), 'Cupom aplicado.');
}
async function captureNavigation(page) {
  return page.evaluate(() => ({ navigations: [...window.__checkoutNavigations], tabs: window.__checkoutTabs.map(tab => ({ ...tab })) }));
}
const homeLinks = { trial: 'https://checkout.perfectpay.com.br/pay/PPU38CQGI6H?',
  master: 'https://checkout.perfectpay.com.br/pay/PPU38CQGGNH?' };
async function waitReady(page, slug, version = 1) {
  await page.waitForFunction(({ slug, version }) => {
    const links = [...document.querySelectorAll('a[data-checkout-plan]')];
    return links.length === 2 && links.every(a => a.getAttribute('href')?.includes(`SIMULADO-${slug}-${a.dataset.checkoutPlan}-v${version}?`));
  }, { slug, version });
}
async function cardStructure(page) {
  return page.locator('#planos').evaluate(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.coupon-entry, [role="status"]').forEach(el => el.remove());
    clone.querySelectorAll('a').forEach(a => ['href', 'data-checkout-plan', 'aria-disabled', 'tabindex', 'title'].forEach(attr => a.removeAttribute(attr)));
    return clone.outerHTML;
  });
}
async function assertBlocked(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('a[data-checkout-plan]')].length === 2 &&
    [...document.querySelectorAll('a[data-checkout-plan]')].every(a => !a.hasAttribute('href') && a.getAttribute('aria-disabled') === 'true'));
}
async function assertPlanLayout(page, viewport) {
  const cards = page.locator('#planos .pricing-card');
  assert.equal(await cards.count(), 2);
  assert.deepEqual(await cards.locator('a[data-checkout-plan]').evaluateAll(links => links.map(link => link.dataset.checkoutPlan)), ['trial', 'master']);
  const trial = await cards.nth(0).boundingBox();
  const master = await cards.nth(1).boundingBox();
  assert.ok(trial && master, 'Os dois planos devem estar visíveis.');
  if (viewport.width > 1100) {
    assert.ok(trial.x + trial.width <= master.x, 'Trimestral à esquerda do vitalício.');
    assert.ok(Math.abs(trial.y - master.y) <= 1, 'Planos alinhados na mesma linha.');
  } else {
    assert.ok(trial.y + trial.height <= master.y, 'Trimestral antes do vitalício no celular.');
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Sem rolagem horizontal.');
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
      ['trial-legado', { ...published('trial-legado'), checkout: { ...published('trial-legado').checkout, trial: null } }],
      ['cupom-ativo', couponPublished('cupom-ativo')],
      ['cupom-padrao', { ...couponPublished('cupom-padrao'), offer: { ...couponPublished('cupom-padrao').offer, mode: 'standard' } }],
      ['cupom-bloqueado', { ...couponPublished('cupom-bloqueado'), offer: { ...couponPublished('cupom-bloqueado').offer, coupon_enabled: false } }],
      ['cupom-pendente', { ...couponPublished('cupom-pendente'), offer: { ...couponPublished('cupom-pendente').offer,
        discount: { ready: false, trial_cents: null, master_cents: null, checkout: { trial: null, master: null } } } }],
      ['cupom-legado', published('cupom-legado')]]);
    let calls = 0;
    const apiCalls = [];
    const responseHolds = new Map();
    const holdResponse = slug => {
      let resolve;
      const promise = new Promise(done => { resolve = done; });
      const release = () => { responseHolds.delete(slug); heldResponses.delete(release); resolve(); };
      responseHolds.set(slug, promise); heldResponses.add(release);
      return release;
    };
    await context.addInitScript(() => {
      window.__checkoutNavigations = [];
      window.__checkoutTabs = [];
      // Documento isolado: nenhum popup ou endereço de pagamento é aberto.
      window.open = (initialUrl, target) => {
        const record = { initialUrl, target, closed: false, href: null };
        window.__checkoutTabs.push(record);
        return {
          document: document.implementation.createHTMLDocument(''), opener: null,
          get closed() { return record.closed; },
          close() { record.closed = true; },
          location: { replace(href) { record.href = href; window.__checkoutNavigations.push(href); } },
        };
      };
      // Somente o polling de 30 s é acionado manualmente para uma QA determinística.
      const nativeSetInterval = window.setInterval.bind(window);
      const nativeClearInterval = window.clearInterval.bind(window);
      const polls = new Map();
      let nextPoll = -1;
      window.setInterval = (callback, milliseconds, ...args) => {
        if (milliseconds !== 30000 || typeof callback !== 'function') return nativeSetInterval(callback, milliseconds, ...args);
        const id = nextPoll--; polls.set(id, () => callback(...args)); return id;
      };
      window.clearInterval = id => { if (polls.has(id)) polls.delete(id); else nativeClearInterval(id); };
      window.__runPromoPoll = () => {
        if (polls.size !== 1) throw new Error(`Esperado um polling ativo, encontrados ${polls.size}.`);
        for (const poll of polls.values()) poll();
      };
    });
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET') return route.abort();
      if (url.origin === origin) return route.continue();
      if (url.origin === 'https://app.dropealy.com' && url.pathname.startsWith('/api/public/promo-creator/')) {
        calls++;
        const slug = url.pathname.split('/').pop();
        apiCalls.push(slug);
        assert.equal(request.headers().authorization, undefined, 'A API pública simulada não recebe autenticação.');
        assert.equal(request.headers().cookie, undefined, 'A API pública simulada não recebe cookies.');
        const status = slug === 'erro-api' ? 503 : slug === 'lento-a' || configs.has(slug) ? 200 : 404;
        const data = slug === 'lento-a' ? published(slug) : configs.get(slug) || { error: status === 503 ? 'unavailable' : 'not_found' };
        if (slug === 'lento-a') await delay(700);
        if (responseHolds.has(slug)) await responseHolds.get(slug);
        try { return await route.fulfill({ status, headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' }, contentType: 'application/json', body: JSON.stringify(data) }); }
        catch { return; } // A consulta antiga pode já ter sido cancelada ao trocar a rota.
      }
      report.blockedExternalRequests++;
      return route.abort(); // Nunca abre os links de pagamento nem serviços externos.
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    let baseline;
    await record(`${label}: início mostra trimestral e vitalício, sem consultar parceiros`, async () => {
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#planos');
      for (const [plan, href] of Object.entries(homeLinks)) assert.equal(await page.locator(`#planos a[data-checkout-plan="${plan}"]`).getAttribute('href'), href);
      await assertPlanLayout(page, viewport);
      assert.equal(calls, 0);
      baseline = await cardStructure(page);
    });
    for (const slug of ['parceiro-a', 'parceiro-b']) {
      await record(`${label}: ${slug} mantém o conteúdo visual e usa seus dois destinos`, async () => {
        await page.goto(`${origin}/${slug}`, { waitUntil: 'domcontentloaded' });
        await waitReady(page, slug);
        assert.equal(await cardStructure(page), baseline);
        assert.equal(await page.locator('a[data-checkout-plan]').count(), 2);
        await assertPlanLayout(page, viewport);
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
      await page.waitForFunction(() => document.querySelector('a[data-checkout-plan="master"]')?.getAttribute('href')?.includes('SIMULADO-trial-legado'));
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
    for (const slug of ['cupom-padrao', 'cupom-bloqueado', 'cupom-pendente', 'cupom-legado']) {
      await record(`${label}: ${slug} permanece padrão mesmo com cupom na URL`, async () => {
        await page.goto(`${origin}/${slug}?cupom=CUPOM_SIMULADO`, { waitUntil: 'domcontentloaded' });
        await waitOffer(page, configs.get(slug));
        await showCoupon(page);
        assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).isDisabled(), true);
        assert.equal(await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).isDisabled(), true);
        assert.equal(await cardStructure(page), baseline);
        await assertPlanLayout(page, viewport);
      });
    }
    await record(`${label}: query válida abre o campo e aplica a oferta aprovada sem navegação`, async () => {
      const data = configs.get('cupom-ativo');
      for (const parameter of ['cupom', 'coupon', 'coupon_code']) {
        await page.goto(`${origin}/cupom-ativo?${parameter}=cupom_simulado`, { waitUntil: 'domcontentloaded' });
        await waitOffer(page, data, true);
        assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), 'CUPOM_SIMULADO');
        assert.equal(await page.getByRole('button', { name: 'TEM UM CUPOM OU INDICAÇÃO?', exact: true }).getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('#planos .pricing-card__original').count(), 2);
        await assertPlanLayout(page, viewport);
        assert.deepEqual((await captureNavigation(page)).navigations, []);
      }
      await page.locator('.coupon-control').screenshot({ path: `${output}/${label}-cupom-aplicado-controle.png`, animations: 'disabled' });
      await page.locator('#planos').screenshot({ path: `${output}/${label}-cupom-aplicado-planos.png`, animations: 'disabled' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitOffer(page, data, true);
    });
    await record(`${label}: cupom inválido, edição e remoção mantêm ou restauram a oferta normal`, async () => {
      const data = configs.get('cupom-ativo');
      await page.goto(`${origin}/cupom-ativo`, { waitUntil: 'domcontentloaded' });
      await waitOffer(page, data);
      await showCoupon(page);
      await page.getByLabel('Cupom de indicação', { exact: true }).fill('OUTRO_CUPOM');
      await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#dropealy-coupon-message')?.textContent.includes('não é válido'));
      await waitOffer(page, data);
      await applyCoupon(page, data);
      await page.getByLabel('Cupom de indicação', { exact: true }).fill('CUPOM_EDITADO');
      await waitOffer(page, data);
      await applyCoupon(page, data);
      await page.getByRole('button', { name: 'Remover', exact: true }).click();
      await waitOffer(page, data);
      assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), '');
      assert.equal(await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: 'Remover', exact: true }).count(), 0);
      assert.deepEqual((await captureNavigation(page)).navigations, []);
    });
    await record(`${label}: trocar parceiro não reaproveita o cupom aplicado, mesmo com o mesmo código`, async () => {
      const original = couponPublished('cupom-ativo');
      const next = couponPublished('cupom-segundo');
      configs.set(original.slug, original); configs.set(next.slug, next);
      await page.goto(`${origin}/${original.slug}`, { waitUntil: 'domcontentloaded' });
      await waitOffer(page, original);
      await applyCoupon(page, original);
      await page.evaluate(() => history.pushState(null, '', '/cupom-segundo?cupom=cupom_simulado'));
      await waitOffer(page, next, true);
      assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), 'CUPOM_SIMULADO');
      for (const plan of ['trial', 'master']) {
        assert.equal(await page.locator(`#planos a[data-checkout-plan="${plan}"]`).getAttribute('href'), next.offer.discount.checkout[plan]);
        assert.notEqual(next.offer.discount.checkout[plan], original.offer.discount.checkout[plan]);
      }
      assert.deepEqual((await captureNavigation(page)).navigations, []);
    });
    for (const revoke of ['versao', 'permissao']) {
      await record(`${label}: aplicar consulta novamente e recusa configuração alterada por ${revoke}`, async () => {
        const original = couponPublished('cupom-ativo');
        configs.set('cupom-ativo', original);
        await page.goto(`${origin}/cupom-ativo`, { waitUntil: 'domcontentloaded' });
        await waitOffer(page, original);
        await showCoupon(page);
        await page.getByLabel('Cupom de indicação', { exact: true }).fill('cupom_simulado');
        const changed = structuredClone(original);
        if (revoke === 'versao') changed.version += 1;
        else changed.offer.coupon_enabled = false;
        configs.set('cupom-ativo', changed);
        const before = apiCalls.length;
        await page.getByRole('button', { name: 'Aplicar cupom', exact: true }).click();
        await page.getByRole('status').filter({ hasText: 'Os planos foram atualizados' }).waitFor();
        await waitOffer(page, changed);
        assert.ok(apiCalls.length > before, 'Aplicar deve consultar a publicação atual.');
        if (revoke === 'versao') assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), '');
        else assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).isDisabled(), true);
        assert.deepEqual((await captureNavigation(page)).navigations, []);
      });
    }
    for (const trigger of ['focus', 'visibilitychange', 'polling']) {
      await record(`${label}: ${trigger} revoga cupom após alteração aprovada`, async () => {
        const original = couponPublished('cupom-ativo');
        configs.set('cupom-ativo', original);
        await page.goto(`${origin}/cupom-ativo`, { waitUntil: 'domcontentloaded' });
        await waitOffer(page, original);
        await applyCoupon(page, original);
        const changed = structuredClone(original);
        if (trigger === 'visibilitychange') changed.offer.coupon_enabled = false; // Mesmo número de versão.
        else changed.version += 1;
        configs.set('cupom-ativo', changed);
        const before = apiCalls.length;
        await page.evaluate(trigger => {
          if (trigger === 'polling') window.__runPromoPoll();
          else if (trigger === 'focus') window.dispatchEvent(new Event('focus'));
          else document.dispatchEvent(new Event('visibilitychange'));
        }, trigger);
        await page.getByRole('status').filter({ hasText: 'Os planos foram atualizados' }).waitFor();
        await waitOffer(page, changed);
        assert.ok(apiCalls.length > before, 'A reconferência deve consultar a configuração pública atual.');
        if (trigger === 'visibilitychange') assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).isDisabled(), true);
        else assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).inputValue(), '');
      });
    }
    await record(`${label}: reconferência pendente bloqueia navegação e preserva preços até a resposta`, async () => {
      const data = couponPublished('cupom-ativo');
      configs.set('cupom-ativo', data);
      await page.goto(`${origin}/cupom-ativo`, { waitUntil: 'domcontentloaded' });
      await waitOffer(page, data);
      await applyCoupon(page, data);
      const release = holdResponse('cupom-ativo');
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await assertBlocked(page);
      assert.deepEqual(await page.locator('#planos .pricing-card__price strong').allTextContents(), ['R$ 197,89', 'R$ 397,45']);
      assert.equal(await page.getByLabel('Cupom de indicação', { exact: true }).isDisabled(), true);
      assert.equal(await page.locator('#planos .pricing-card__original s').count(), 2);
      await page.locator('#planos a[data-checkout-plan="master"]').dispatchEvent('click');
      await page.locator('#planos a[data-checkout-plan="trial"]').dispatchEvent('auxclick', { button: 1 });
      assert.deepEqual(await captureNavigation(page), { navigations: [], tabs: [] });
      release();
      await waitOffer(page, data, true);
    });
    await record(`${label}: compra reconfere e fecha a aba simulada quando o desconto foi revogado`, async () => {
      const original = couponPublished('cupom-ativo');
      configs.set('cupom-ativo', original);
      await page.goto(`${origin}/cupom-ativo`, { waitUntil: 'domcontentloaded' });
      await waitOffer(page, original);
      await applyCoupon(page, original);
      const changed = structuredClone(original); changed.offer.coupon_enabled = false;
      configs.set('cupom-ativo', changed);
      const release = holdResponse('cupom-ativo');
      const before = apiCalls.length;
      await page.locator('#planos a[data-checkout-plan="master"]').click();
      await assertBlocked(page);
      assert.deepEqual((await captureNavigation(page)).navigations, []);
      assert.equal((await captureNavigation(page)).tabs.length, 1);
      release();
      await waitOffer(page, changed);
      await page.waitForFunction(() => window.__checkoutTabs.length === 1 && window.__checkoutTabs[0].closed);
      const captured = await captureNavigation(page);
      assert.deepEqual(captured.navigations, []);
      assert.equal(captured.tabs[0].href, null);
      assert.ok(apiCalls.length > before, 'O clique deve consultar a publicação novamente.');
      assert.equal(page.url(), `${origin}/cupom-ativo`);
      await page.getByRole('status').filter({ hasText: 'Os planos foram atualizados' }).waitFor();
    });
    await record(`${label}: compra padrão usa URL nova exata após consulta, inclusive clique auxiliar`, async () => {
      const original = published('navegacao-padrao');
      configs.set(original.slug, original);
      await page.goto(`${origin}/${original.slug}`, { waitUntil: 'domcontentloaded' });
      await waitOffer(page, original);
      const changed = published(original.slug, 2);
      changed.checkout.master = 'https://checkout.centerpag.com/pay/NORMAL-FRESH?ref=navegacao%2Fpadrao&src=primeiro&src=segundo&tag=a%2Bb';
      configs.set(original.slug, changed);
      const before = apiCalls.length;
      await page.locator('#planos a[data-checkout-plan="master"]').click();
      await page.waitForFunction(href => window.__checkoutNavigations[0] === href, changed.checkout.master);
      await waitOffer(page, changed);
      assert.ok(apiCalls.length > before);
      const next = structuredClone(changed);
      next.checkout.trial = 'https://checkout.perfectpay.com.br/pay/NORMAL-FRESH-TRIAL?ref=navegacao%2Fpadrao&tag=1%262&src=auxiliar';
      configs.set(original.slug, next);
      await page.locator('#planos a[data-checkout-plan="trial"]').dispatchEvent('auxclick', { button: 1 });
      await page.waitForFunction(href => window.__checkoutNavigations[1] === href, next.checkout.trial);
      const captured = await captureNavigation(page);
      assert.deepEqual(captured.navigations, [changed.checkout.master, next.checkout.trial]);
      assert.equal(captured.tabs.length, 2);
      assert.ok(captured.tabs.every(tab => tab.initialUrl === 'about:blank' && tab.target === '_blank' && !tab.closed));
      assert.equal(page.url(), `${origin}/${original.slug}`);
      assert.equal(context.pages().length, 1, 'Nenhuma aba real de checkout foi aberta.');
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
  for (const release of heldResponses) release();
  await browser?.close();
  server.kill('SIGTERM');
}

