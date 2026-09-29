# Integração de checkouts dos parceiros — etapa inicial

Data: 29/09/2026. Área de trabalho: `integracao/checkouts-parceiros`.

## Implementado nesta etapa

- Cliente de leitura pública em `src/lib/promoCreator.mjs`, conforme o contrato documentado de Promoção Creator.
- Consulta por slug, validação da resposta publicada, três destinos separados (`starter`, `trial`, `master`) e preservação integral dos links.
- Bloqueio de respostas inválidas, destinos fora da lista permitida, erro de rede e timeout. Nunca fornece checkout alternativo.
- Cancelamento de consultas e suporte seguro ao Trial legado nulo.
- Onze testes automatizados com respostas simuladas, executados localmente no Node 22.16.0: todos passaram.

Executar os testes: `node --test tests/promoCreator.test.mjs`.

## Ainda não implementado ou confirmado

O módulo ainda não está conectado aos componentes da landing. Esta etapa NÃO muda os botões, NÃO conclui a integração, NÃO altera a aprovação no painel e NÃO publica a funcionalidade em produção.

Próximos passos: conectar `App.jsx` e os três botões/planos em `Features.jsx`; confirmar o endpoint real e dois parceiros aprovados; tratar carregamento e troca de slug sem reaproveitar links anteriores; configurar e testar rotas na prévia da hospedagem correta.

O endereço documentado é `https://app.dropealy.com/api/public/promo-creator/{slug}`. Sua disponibilidade em produção e os cabeçalhos de acesso/cache ainda precisam ser verificados. Os testes não enviam requisições reais nem realizam pagamentos.

Validar formato e domínio de um checkout não comprova a oferta nem a atribuição do parceiro. A aprovação permanece no servidor da Dropealy e precisa ser conferida antes da liberação.

A identificação do projeto/equipe da Vercel continua pendente. Não alterar DNS, domínios, a aplicação Dropealy ou a Revealy para resolver essa identificação. A versão `master` e todos os arquivos preexistentes ficam preservados.
