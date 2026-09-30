// Migração única e idempotente: altera apenas a ligação funcional dos cinco botões.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const path = 'src/components/Features.jsx';
const original = readFileSync(path, 'utf8');
if (original.includes("import { useCheckout, CheckoutStatus } from './CheckoutProvider'")) {
  console.log('Botões já integrados; nenhuma alteração automática.');
  process.exit(0);
}
const bytes = Buffer.from(original);
const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
if (hash !== '835c2e12ee7bb71270797e69cc23d96d0d9e804e') {
  throw new Error('Features.jsx mudou. Revisar o arquivo; não sobrescrever o trabalho do programador.');
}
let modified = original;
function once(before, after) {
  if (modified.split(before).length !== 2) throw new Error(`Trecho não é único: ${before.slice(0, 80)}`);
  modified = modified.replace(before, after);
}
once("import { useState, useEffect, useRef } from 'react'", "import { useState, useEffect, useRef } from 'react'\nimport { useCheckout, CheckoutStatus } from './CheckoutProvider'");
once('export default function Features() {', 'export default function Features() {\n  const getCheckoutProps = useCheckout()');
once("  const getCheckoutLink = (planName) => {\n    return planName === 'Mensal'\n      ? 'https://checkout.perfectpay.com.br/pay/PPU38CQDJIE'\n      : 'https://checkout.perfectpay.com.br/pay/PPU38CQDIQM'\n  }\n", '');
for (const [plan, code] of [['starter', 'PPU38CQGGMG'], ['master', 'PPU38CQGGNH'], ['trial', 'PPU38CQGI6H']]) {
  const url = `https://checkout.perfectpay.com.br/pay/${code}?`;
  once(`href="${url}"`, `{...getCheckoutProps('${plan}', '${url}')}`);
}
once("href={getCheckoutLink('Mensal')}", "{...getCheckoutProps('starter', 'https://checkout.perfectpay.com.br/pay/PPU38CQDJIE')}");
once("href={getCheckoutLink('Vitalicio')}", "{...getCheckoutProps('master', 'https://checkout.perfectpay.com.br/pay/PPU38CQDIQM')}");
once('            <div id="planos" className="pricing-grid">', '            <CheckoutStatus />\n            <div id="planos" className="pricing-grid">');
if (modified.includes('getCheckoutLink(')) throw new Error('Restou botão fora da integração.');
writeFileSync(path, modified);
console.log('Cinco botões integrados. Textos, estilos, imagens, preços e estrutura dos cartões preservados.');
