import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const rule = config.rewrites[0];
const matches = path => new RegExp(`^${rule.source}$`).test(path);

test('a regra da hospedagem recebe parceiros com e sem barra final', () => {
  for (const path of ['/ofc', '/ofc/', '/parceiro-a', '/parceiro-a/', `/${'a'.repeat(60)}/`]) {
    assert.equal(matches(path), true, path);
  }
});

test('a regra não captura arquivos, caminhos aninhados nem barras duplicadas', () => {
  for (const path of ['/', '/ab', '/ofc//', '/ofc/filho', '/assets/foto.png', '/favicon.ico', '/robots.txt', `/${'a'.repeat(61)}`]) {
    assert.equal(matches(path), false, path);
  }
});

test('rotas reservadas continuam fora da página de vendas, inclusive com barra', () => {
  for (const name of ['api', 'assets', 'monitor', 'admin', 'login', 'logout', 'suporte', 'termos', 'privacidade', 'index', 'favicon']) {
    for (const suffix of ['', '/', '/filho']) assert.equal(matches(`/${name}${suffix}`), false);
  }
});

test('cleanUrls usa a raiz como destino, sem redirecionar ou trocar domínio', () => {
  assert.equal(config.cleanUrls, true);
  assert.equal(rule.destination, '/');
  assert.equal(config.redirects, undefined);
  assert.equal(config.trailingSlash, undefined);
});
