import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const start = html.indexOf('<script data-promo-bootstrap>');
assert.ok(start > html.indexOf('<head>') && start < html.indexOf('</head>'), 'Bootstrap público permanece no head compilado.');
assert.equal((html.match(/data-promo-bootstrap/g) || []).length, 1);
for (const resource of ['fonts.googleapis.com', 'fonts.gstatic.com', 'rel="icon"', 'type="module"']) {
  assert.ok(start < html.indexOf(resource), `Bootstrap inicia antes de ${resource}.`);
}
assert.ok(html.includes('https://app.dropealy.com/api/public/promo-creator/'));
assert.match(html, /type="module"[^>]*src="\/assets\/index-[^"]+\.js"/);
console.log('Bootstrap público confirmado no HTML de produção antes das fontes e do bundle.');
