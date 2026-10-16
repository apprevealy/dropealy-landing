# Cupom de indicação

A página de parceiro mostra o botão amarelo “TEM UM CUPOM OU INDICAÇÃO?” acima dos planos. Ele abre e fecha o formulário, preservando o código digitado. Um `?CUPOM=` válido para a oferta aprovada abre o formulário e aplica o desconto automaticamente.

O campo aparece quando existe uma oferta promocional ativa ou um identificador de cupom já publicado. Um identificador antigo pode mostrar a entrada com aviso de indisponibilidade, mas não libera preços ou checkouts promocionais. Aplicar continua exigindo modo coupon, permissão ativa, oferta completa e publicada, código correspondente e links válidos do próprio parceiro. Revalidação, remoção e troca de página mantêm os mesmos controles.

No SaaS, selecionar o bloco 2.1 e salvar seus links prepara a configuração. São necessários os checkouts de Master R$297 e Trimestral R$197, código do cupom, permissão administrativa e aprovação da página. Não usar rascunhos na resposta pública nem adivinhar um checkout faltante. Sem cupom válido, os preços e links normais permanecem.

Validação local: testes puros em `tests/*.test.mjs`, React montado em `tests/local-coupon-ui/check-ui.mjs` e build Vite. O script `scripts/check-coupon-entry-browser.mjs` usa dados simulados e bloqueia tráfego externo; requer Playwright com Chromium instalado. Ele não compra, não aprova ofertas reais e não escreve no SaaS.
