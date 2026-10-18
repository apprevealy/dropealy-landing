# Ofertas publicadas por parceiro

O painel permite preparar dois grupos de checkouts promocionais e publicar um deles por vez. A landing consulta somente o snapshot aprovado em `GET https://app.dropealy.com/api/public/promo-creator/{slug}`. Salvar outro grupo no painel não altera a página publicada antes da aprovação.

| Seleção no painel | `offer.mode` público | `offer.coupon_tier` | Trimestral com cupom | Vitalício com cupom |
| --- | --- | --- | --- | --- |
| Bloco 2.0 | `standard` | `null` | Sem desconto | Sem desconto |
| Bloco 2.1 | `coupon` | `100` | R$ 197 | R$ 397 à vista |
| Bloco 2.2 | `coupon` | `200` | R$ 197 | R$ 297 à vista |

Sem cupom válido aplicado, a landing mantém R$ 247 no trimestral e R$ 497 à vista no vitalício, com os checkouts normais do próprio parceiro. O parcelamento normal continua 12x de R$ 49,90. Nenhuma parcela é calculada a partir do valor à vista. O bloco 2.1 é somente à vista até existir uma condição de parcelamento explicitamente aprovada; o bloco 2.2 preserva o parcelamento opcional informado pelo snapshot (inclusive ofertas legadas).

`coupon_tier` é um metadado opcional compatível com respostas antigas; `100` exige os valores exatos 19700/39700 centavos e parcela ausente/nula. `200` mantém os limites e a validação das ofertas antigas, sem reescrever valores publicados. Outros identificadores e valores incompatíveis são rejeitados. O contrato público continua `standard|coupon`, permitindo que clientes antigos usem os valores e destinos aprovados.

Somente o servidor escolhe e publica `coupon`, `offer.discount` e seus checkouts. `?CUPOM=<código>` pode aplicar o cupom aprovado para a página atual; parâmetros de preço ou de bloco nunca escolhem outra oferta. Permissão do admin, modo, prontidão, código e links aprovados continuam obrigatórios. URLs de checkout são preservadas com seus parâmetros de atribuição.

A consulta é `no-store`, sem credenciais. A landing reconfere ao receber foco, a cada 30 segundos enquanto visível, ao aplicar o cupom e antes de abrir o checkout. Troca de bloco, preço, link, cupom ou permissão invalida a aplicação anterior. Se a oferta mudar durante a compra, o checkout é bloqueado para a pessoa conferir os novos valores. Erros nunca reutilizam checkouts antigos nem usam links da página inicial como alternativa.

Validação local: `node --test tests/*.test.mjs`, `node --test tests/local-coupon-ui/check-ui.mjs`, `node scripts/check-checkout-render.mjs` e `npm run build`. A suíte montada requer `npm ci` também em `tests/local-coupon-ui`. As respostas usadas nos testes são simuladas; não aprovam páginas, alteram checkouts na Perfect Pay ou efetuam pagamentos.
