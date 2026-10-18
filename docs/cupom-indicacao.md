# Cupom de indicação

A página de parceiro começa somente com o botão amarelo arredondado “TEM UM CUPOM OU INDICAÇÃO?”, com largura máxima de 535px. Ao clicar, ele é substituído pelo campo arredondado “Digite seu cupom” e o botão “APLICAR”, sem caixa externa nem código promocional exposto antes da aplicação. No celular, os dois controles ficam empilhados. Um `?CUPOM=` válido para a oferta aprovada já abre o formulário e aplica o desconto automaticamente.

Após a validação, o campo e o botão permanecem e aparece o cartão “Cupom presente aplicado”, com ícone de presente, código e explicação do desconto. Os valores promocionais ficam verdes, o Master ganha destaque e o preço normal aparece riscado. A faixa amarela inferior confirma o código aplicado; ela não afirma que existe prazo de expiração, pois o contrato publicado não contém esse prazo. O texto também não afirma renúncia à comissão do afiliado. Remover ou editar o cupom restaura os preços e checkouts normais e retira o cartão e a faixa.

As três opções do bloco de checkout são independentes:

| Bloco | Contrato público | Trial | Master |
| --- | --- | --- | --- |
| 2.0, sem cupom | `offer.mode = standard` | R$247 | R$497 à vista ou 12x de R$49,90 |
| 2.1, cupom de R$100 | `offer.mode = coupon`, `offer.coupon_tier = 100` | R$197 | R$397 à vista, sem parcela configurada |
| 2.2, cupom de R$200 | `offer.mode = coupon`, `offer.coupon_tier = 200` | R$197 | R$297 à vista ou 12x de R$29,82, total R$357,84 |

O contrato público contém somente o código, os preços e os checkouts da oferta selecionada e aprovada; a vitrine não busca outra oferta nem substitui um destino faltante. O modo interno `coupon100` não é um modo público. O tier 100 pronto exige 19700/39700 centavos e `master_installment_cents: null`. O tier 200 e respostas legadas sem tier preservam os valores aprovados e o parcelamento opcional existente, sem reescrever publicações antigas. A vitrine só mostra parcelas recebidas na publicação; nunca divide o valor à vista para inventá-las. O layout destaca a parcela quando disponível, com a alternativa à vista e o preço anterior riscado na linha abaixo, nas cores da Dropealy.

A entrada de cupom aparece exclusivamente quando a oferta pública aprovada está no bloco 2.1 ou 2.2 (`offer.mode = coupon`). Bloco 2.0 (`standard`), resposta legada sem oferta, código salvo isoladamente e parâmetro `?CUPOM=` não mostram botão, campo, cartão ou faixa de cupom. Em 2.0, o parâmetro é ignorado e os preços/checkouts normais permanecem, sem aviso de cupom. Selecionar/salvar uma opção no editor prepara o rascunho; a aprovação continua definindo a versão pública.

Nos blocos com cupom, a digitação permanece disponível durante a revalidação. Após preencher, APLICAR consulta novamente a oferta publicada. O desconto exige modo coupon, permissão ativa, oferta completa e publicada, código correspondente e links válidos do próprio parceiro. O código da outra opção não aplica o desconto. Alterar o texto durante uma consulta impede a aplicação da tentativa antiga. Trocar o tier publicado invalida a aplicação anterior, mesmo sem mudança nos demais campos. Ao voltar à publicação 2.0, todos os controles de cupom desaparecem e os preços e destinos normais são restaurados. A revogação pode manter o tier 100/200 no contrato, mas `standard`, a permissão desabilitada e o desconto não pronto impedem a aplicação. Tier ausente ou nulo mantém compatibilidade; valores de tier diferentes de 100/200 são rejeitados.

No SaaS, cada opção com cupom salva seu próprio código e seus links. São necessários os checkouts de Master e Trimestral correspondentes à opção, código do cupom, permissão administrativa e aprovação da página. Não usar rascunhos na resposta pública nem adivinhar um checkout faltante. Sem cupom válido, os preços e links normais permanecem.

Validação local: testes puros em `tests/*.test.mjs`, React montado em `tests/local-coupon-ui/check-ui.mjs` e build Vite. O script `scripts/check-coupon-entry-browser.mjs` usa dados simulados e bloqueia tráfego externo; requer Playwright com Chromium instalado. Ele não compra, não aprova ofertas reais e não escreve no SaaS.
