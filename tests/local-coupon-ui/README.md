# Validação de interface dos cupons

Este teste monta os componentes reais `CheckoutProvider` e `Features` com React, no DOM do Happy DOM. As respostas da API pública são simuladas; nenhum checkout real é aberto.

```sh
npm ci
npm ci --prefix tests/local-coupon-ui
npm test --prefix tests/local-coupon-ui
node --test tests/*.test.mjs
npm run build
```

As dependências abaixo de `tests/local-coupon-ui` pertencem somente ao teste, sem alterar as dependências da aplicação.
