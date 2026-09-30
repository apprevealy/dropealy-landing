# Checkouts por parceiro — estado verificado em 29/09/2026

## Implementado na branch de teste

Branch: `integracao/checkouts-parceiros`. Solicitação de alteração: `https://github.com/apprevealy/dropealy-landing/pull/1`.

- `App.jsx` fornece a configuração da página por meio de `CheckoutProvider`.
- `Features.jsx` conecta os três botões visíveis (Starter, Master/Vitalício e Trial) e duas ocorrências antigas ocultas à configuração do parceiro. São cinco destinos tratados explicitamente.
- Na página inicial `/`, os links originais permanecem iguais. Em `/{slug}`, somente a resposta publicada do próprio parceiro habilita os botões. Não existe fallback para os links da página inicial.
- Consultas sem credenciais ou cache, com timeout e cancelamento. Uma troca de rota reinicia o estado e não reaproveita dados do parceiro anterior.
- Durante carregamento, erro, página não aprovada ou resposta inválida, os botões ficam sem destino de compra. Há mensagem funcional de indisponibilidade; quando os planos estão carregados, não é acrescentado conteúdo visual.
- Trial legado nulo fica desabilitado, sem trocar por outro plano. O cupom não é acrescentado aos links.
- `vercel.json` inclui uma regra de rota de um segmento para parceiros. Não captura `/api`, `/assets`, `/monitor` e demais nomes reservados. Ainda requer teste na prévia da Vercel.

Não houve edição de CSS, imagens, preços, textos comerciais, Hero ou Navbar. Nenhum domínio, DNS, hospedagem ou dado do painel foi alterado. A branch `master` continua no commit `4e1b010ed720904d04fdeaabfffb55ebf59b2ce5` nesta verificação.

## Evidências de testes

Execução GitHub Actions: `https://github.com/apprevealy/dropealy-landing/actions/runs/36634384678`.

- 19 testes unitários passaram.
- A comparação da renderização HTML passou: início com o mesmo HTML e destinos; dois parceiros simulados com alteração somente dos cinco destinos e metadados funcionais dos links; falhas sem checkout alternativo.
- `npm run build` concluiu com sucesso (Vite 5.4.21).
- O arquivo testado foi gravado na branch de teste no commit `6203beed7ede593c9e7e5bd77638310374283eb4`.
- Após essa migração única, o fluxo de CI ficou somente de leitura: não envia commits, não mescla a PR e não publica na Vercel.

Os testes usam configurações simuladas. Comparação de HTML não substitui a verificação no navegador, em celular e na hospedagem real. Não foram realizados pagamentos ou aprovações.

## API pública: resultado real

Às 21:36:38 UTC de 29/09/2026, a consulta de leitura a `https://app.dropealy.com/api/public/promo-creator/presente` retornou:

- HTTP 404, conteúdo `application/json`;
- `Access-Control-Allow-Origin: *`;
- `Cache-Control: no-store`.

O endpoint respondeu, mas não entregou uma página publicada para `presente`. Isso não comprova que o backend inteiro esteja pronto, nem permite atribuir uma causa específica ao 404. A tela fornecida pelo usuário mostrava essa página como “não enviado”. Ainda é necessário testar dois slugs realmente aprovados e verificar o isolamento entre parceiros.

## Hospedagem: bloqueio identificado

Projeto informado pelo usuário: `https://vercel.com/apprevealy/lpdropealy`.
Equipe identificada na resposta da Vercel: `apprevealy` (`team_8Un3PFMh89s29EIFpAhoQ29U`).

A conexão desta conversa recebeu HTTP 403: sem autorização para acessar essa equipe. É necessário reconectar a Vercel com acesso ao escopo correto. Não criar outro projeto, transferir domínios ou mudar DNS para contornar esse bloqueio.

O print mostra publicação via `vercel deploy` e o botão `Connect Git`; a ligação automática desse projeto ao GitHub ainda deve ser conferida. Não foi configurada nem comprovada publicação automática na hospedagem.

## Critérios pendentes antes de liberar produção

1. Acessar o projeto existente da Vercel, confirmar seu vínculo com `apprevealy/dropealy-landing`, a branch de produção e a configuração atual, sem alterar seus domínios.
2. Gerar uma prévia da branch de teste. Verificar acesso direto e atualização de `/{slug}`, rotas reservadas, comportamento no navegador, celular e visual aprovado.
3. Usar dois parceiros realmente aprovados: conferir três destinos, atribuição, alterações em rascunho, aprovação e atualização sem novo deploy.
4. Conferir no backend as permissões de edição/aprovação, validação dos três checkouts e publicação atômica da versão revisada. O código do backend não foi alterado nesta etapa.
5. Só então mesclar e publicar usando a hospedagem existente, com a publicação anterior disponível para reversão. Não acionar exclusão de projeto ou mudanças em DNS.

O npm informou seis alertas de segurança nas dependências existentes (dois moderados e quatro altos). O impacto específico ainda precisa ser analisado; não foi executado `npm audit fix --force` nem atualização de dependências fora do escopo.
