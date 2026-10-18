import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { consumeInitialPromo, discardPreviousInitialPromo, fetchInitialPromo, initialPromoSnapshot } from '../src/lib/initialPromo.mjs';
import { PROMO_API } from '../src/lib/promoCreator.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = html.match(/<script data-promo-bootstrap>([\s\S]*?)<\/script>/)?.[1];
const key = '__DROPEALY_PROMO_BOOTSTRAP__';
const href = code => `https://pay.pagamentorevealy.com/${code}?ref=original%2Fpartner`;
const offer = (slug = 'fornecedor') => ({
  slug, status: 'published', version: 7, coupon: '100OFF',
  checkout: { starter: null, trial: href('TRIAL'), master: href('MASTER') },
  offer: { mode: 'coupon', coupon_enabled: true, coupon_tier: 100,
    normal: { trial_cents: 24700, master_cents: 49700 },
    discount: { ready: true, trial_cents: 19700, master_cents: 39700, master_installment_cents: 3986,
      checkout: { trial: href('TRIAL_COUPON'), master: href('MASTER_COUPON') } } },
});
const response = (data = offer(), status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => data });
const options = win => ({ windowObject: win, pathname: win.location.pathname, coupon: '100OFF' });

function runBootstrap(url = 'https://www.dropealy.com/fornecedor?CUPOM=100OFF', fetchImpl = async () => response()) {
  const calls = [], timers = new Map(), listeners = new Map();
  let timerId = 0;
  const win = {
    location: new URL(url),
    fetch: (url, init) => { calls.push({ url, init }); return fetchImpl(url, init); },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
  };
  vm.runInNewContext(source, { window: win, URLSearchParams, AbortController, Date, encodeURIComponent });
  return { win, calls, timers, listeners, record: win[key] };
}

test('bootstrap público está no head antes de fontes, ícone e módulo da aplicação', () => {
  assert.ok(source);
  const start = html.indexOf('<script data-promo-bootstrap>');
  assert.ok(start > html.indexOf('<head>') && start < html.indexOf('</head>'));
  for (const resource of ['fonts.googleapis.com', 'fonts.gstatic.com', 'rel="icon"', 'type="module"']) assert.ok(start < html.indexOf(resource), resource);
  assert.ok(source.includes(PROMO_API));
});

test('URL explícita inicia uma única consulta pública sem cookies, cache ou redirecionamento', async () => {
  const { record, calls } = runBootstrap();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${PROMO_API}/fornecedor`);
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.equal(calls[0].init.cache, 'no-store');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(calls[0].init.headers.Accept, 'application/json');
  assert.equal(record.status, 'pending');
  await record.promise;
  assert.equal(record.status, 'settled');
  assert.equal(record.outcome.ok, true);
});

test('aliases e barra final seguem a mesma intenção da aplicação', async () => {
  for (const query of ['CUPOM=100OFF', 'coupon=%20100off%20', 'CoUpOn_CoDe=100OFF']) {
    const { calls, record } = runBootstrap(`https://www.dropealy.com/fornecedor/?${query}`);
    assert.equal(calls.length, 1);
    assert.equal(record.coupon, '100OFF');
    assert.equal(record.pathname, '/fornecedor/');
    await record.promise;
  }
});

test('home, navegação sem cupom, parâmetros ambíguos e rotas reservadas não fazem preload', () => {
  for (const path of ['/', '/?CUPOM=100OFF', '/fornecedor', '/fornecedor?CUPOM=', '/fornecedor?CUPOM=A',
    '/fornecedor?CUPOM=100OFF&coupon=100OFF', '/fornecedor?CUPOM=%3Cscript%3E',
    '/admin?CUPOM=100OFF', '/login?CUPOM=100OFF', '/api?CUPOM=100OFF',
    '/fornecedor/outro?CUPOM=100OFF', '//fornecedor?CUPOM=100OFF', '/ab?CUPOM=100OFF']) {
    const { calls, record } = runBootstrap(`https://www.dropealy.com${path}`);
    assert.equal(calls.length, 0, path);
    assert.equal(record, undefined, path);
  }
});

test('resposta concluída limpa timeout e pagehide e oferece snapshot validado', async () => {
  const { win, record, timers, listeners } = runBootstrap();
  await record.promise;
  assert.equal(timers.size, 0);
  assert.equal(listeners.size, 0);
  const snapshot = initialPromoSnapshot('fornecedor', '/fornecedor', '100OFF', { windowObject: win });
  assert.equal(snapshot.data.version, 7);
  assert.equal(snapshot.data.offer.discount.master_installment_cents, 3986);
  assert.equal(snapshot.data.offer.discount.checkout.master, href('MASTER_COUPON'));
  assert.equal(snapshot.bootstrap, record);
});

test('snapshot rejeita dados de outro dono/slug, rascunho, versão inválida e checkout não permitido', async () => {
  for (const change of [data => { data.slug = 'outro'; }, data => { data.status = 'draft'; },
    data => { data.version = 0; }, data => { data.offer.discount.checkout.master = 'https://example.com/checkout'; },
    data => { data.offer.discount.master_installment_cents = 2990; }]) {
    const data = offer(); change(data);
    const { win, record } = runBootstrap(undefined, async () => response(data));
    await record.promise;
    assert.equal(initialPromoSnapshot('fornecedor', '/fornecedor', '100OFF', { windowObject: win }), null);
  }
});

test('snapshot não reaproveita outra intenção, resposta antiga ou já consumida', async () => {
  const { win, record } = runBootstrap();
  await record.promise;
  for (const args of [
    ['outro', '/outro', '100OFF', {}], ['fornecedor', '/fornecedor', 'OUTRO', {}],
    ['fornecedor', '/fornecedor', '100OFF', { now: record.startedAt + 15_001 }],
    ['fornecedor', '/fornecedor', '100OFF', { now: record.startedAt - 1 }],
  ]) assert.equal(initialPromoSnapshot(...args.slice(0, 3), { windowObject: win, ...args[3] }), null);
  consumeInitialPromo(record);
  assert.equal(initialPromoSnapshot('fornecedor', '/fornecedor', '100OFF', { windowObject: win }), null);
});

test('StrictMode pode cancelar um assinante e reutilizar a mesma consulta pendente', async () => {
  let resolve;
  const { win, record, calls } = runBootstrap(undefined, () => new Promise(done => { resolve = done; }));
  const firstController = new AbortController(), secondController = new AbortController();
  const first = fetchInitialPromo('fornecedor', { ...options(win), signal: firstController.signal });
  firstController.abort();
  const second = fetchInitialPromo('fornecedor', { ...options(win), signal: secondController.signal });
  await assert.rejects(first, error => error.name === 'AbortError');
  assert.equal(record.consumed, false);
  assert.equal(calls[0].init.signal.aborted, false);
  resolve(response());
  const loaded = await second;
  assert.equal(loaded.data.slug, 'fornecedor');
  assert.equal(calls.length, 1);
});

test('assinante já cancelado não consome nem cancela a consulta compartilhada', async () => {
  const { win, record, calls } = runBootstrap();
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchInitialPromo('fornecedor', { ...options(win), signal: controller.signal }), error => error.name === 'AbortError');
  assert.equal(record.consumed, false);
  assert.equal(calls[0].init.signal.aborted, false);
  await record.promise;
});

test('A para B para A descarta o preload antigo e faz nova consulta, mesmo ainda pendente', async () => {
  let resolve;
  const { win, record } = runBootstrap(undefined, () => new Promise(done => { resolve = done; }));
  win.location = new URL('https://www.dropealy.com/outro?CUPOM=OUTRO');
  discardPreviousInitialPromo(win);
  assert.equal(record.consumed, true);
  win.location = new URL('https://www.dropealy.com/fornecedor?CUPOM=100OFF');
  let fresh = 0;
  const loaded = await fetchInitialPromo('fornecedor', { ...options(win), fetchImpl: async () => { fresh++; return response(); } });
  assert.equal(fresh, 1);
  assert.equal(loaded.bootstrap, null);
  resolve(response()); await record.promise;
});

test('StrictMode e parâmetros de rastreamento não invalidam a intenção atual', async () => {
  const { win, record } = runBootstrap();
  win.location = new URL('https://www.dropealy.com/fornecedor?cupom=100off&utm_source=teste');
  discardPreviousInitialPromo(win);
  assert.equal(record.consumed, false);
  await record.promise;
});

test('alterar somente o código invalida a resposta de inicialização anterior', async () => {
  const { win, record } = runBootstrap();
  win.location = new URL('https://www.dropealy.com/fornecedor?CUPOM=OUTRO');
  discardPreviousInitialPromo(win);
  assert.equal(record.consumed, true);
  await record.promise;
});

test('preload consumido não vira cache de consulta posterior', async () => {
  const { win, record } = runBootstrap(); await record.promise; consumeInitialPromo(record);
  let fresh = 0;
  const data = offer(); data.version++;
  const loaded = await fetchInitialPromo('fornecedor', { ...options(win), fetchImpl: async () => { fresh++; return response(data); } });
  assert.equal(fresh, 1);
  assert.equal(loaded.data.version, 8);
  assert.equal(loaded.bootstrap, null);
});

test('falha de rede/HTTP/JSON termina sem rejeição solta e permite recuperação em nova montagem', async () => {
  for (const fetchImpl of [async () => { throw new Error('offline'); }, async () => response(null, 503),
    async () => ({ ok: true, status: 200, json: async () => { throw new Error('JSON inválido'); } })]) {
    const { win, record } = runBootstrap(undefined, fetchImpl);
    await record.promise;
    await assert.rejects(fetchInitialPromo('fornecedor', options(win)), error => error.code === 'unavailable');
    assert.equal(record.consumed, true);
    let fresh = 0;
    await fetchInitialPromo('fornecedor', { ...options(win), fetchImpl: async () => { fresh++; return response(); } });
    assert.equal(fresh, 1);
  }
});

test('configuração malformada é consumida como falha, sem liberar desconto ou impedir nova consulta', async () => {
  const invalid = offer(); invalid.slug = 'outro';
  const { win, record } = runBootstrap(undefined, async () => response(invalid));
  await record.promise;
  await assert.rejects(fetchInitialPromo('fornecedor', options(win)), error => error.code === 'invalid_response');
  assert.equal(record.consumed, true);
  const loaded = await fetchInitialPromo('fornecedor', { ...options(win), fetchImpl: async () => response() });
  assert.equal(loaded.data.slug, 'fornecedor');
});

test('404 mantém a semântica de página não encontrada', async () => {
  const { win, record } = runBootstrap(undefined, async () => response(null, 404));
  await record.promise;
  await assert.rejects(fetchInitialPromo('fornecedor', options(win)), error => error.code === 'not_found');
  assert.equal(record.consumed, true);
});

test('timeout e saída do documento cancelam o request de head, sem rejeição não tratada', async () => {
  for (const reason of ['timeout', 'pagehide']) {
    const { record, timers, listeners, calls } = runBootstrap(undefined, (_, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('abort', 'AbortError')), { once: true });
    }));
    if (reason === 'timeout') [...timers.values()][0](); else listeners.get('pagehide')();
    const outcome = await record.promise;
    assert.equal(calls[0].init.signal.aborted, true);
    assert.equal(outcome.ok, false);
    assert.equal(outcome.code, 'unavailable');
    assert.equal(timers.size, 0);
    assert.equal(listeners.size, 0);
  }
});
