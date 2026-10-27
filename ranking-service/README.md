# Ranking global sem banco de dados

O ranking global está **ativo**. Serviço: `https://ultima-flecha-ranking.wendel-dak.workers.dev`. Publicado somente na conta pessoal `967593ac0c05e0887ce9b8dc51f6aa1d`; a conta corporativa Hapvida não deve ser usada. O GitHub Pages serve arquivos estáticos e não recebe gravações. O intermediário `worker.mjs` recebe os tempos e atualiza `ranking.json` usando a API do GitHub. Nenhum token deve estar no HTML, JavaScript público ou histórico do repositório.

## Configuração e renovação

1. Use uma conta Cloudflare com Workers. Crie um Worker a partir de `worker.mjs`, usando as variáveis de `wrangler.toml` (ou publique essa pasta com o Wrangler oficial).
2. O proprietário deve criar um token fine-grained do GitHub limitado **somente** ao repositório `sswendel/ultima-flecha`, com Contents: Read and write. Esse passo concede acesso de escrita e requer autorização do proprietário. A permissão atual foi autorizada e limitada somente ao repositório do jogo. Guarde-o no Worker como segredo `GITHUB_TOKEN`, nunca em variável pública ou neste repositório.
3. Configure outro segredo no Worker, `SESSION_SECRET`, com pelo menos 32 bytes aleatórios. Ele assina os comprovantes de início de partida. Mantenha os dois segredos privados.
4. Confirme as variáveis: `ALLOWED_ORIGIN=https://sswendel.github.io`, `GITHUB_REPO=sswendel/ultima-flecha`, `GITHUB_BRANCH=main`, `GITHUB_PATH=ranking.json`.
5. Depois de publicar o Worker, coloque apenas sua URL HTTPS em `window.RANKING_API` no arquivo `ranking-config.js` e publique a alteração no GitHub.
6. Verifique `/ranking` a partir da origem do jogo e conclua uma partida normal para conferir a gravação. Sem a conexão, o botão de ranking fica oculto e o jogo continua funcionando.

## Regras

- Os 10 menores tempos de conclusão das cinco fases, com precisão de milissegundos. Empates preservam quem registrou primeiro.
- Cronômetro usa tempo real, inclui espera após quedas e exclui pausas. Trocar de aplicativo pausa a partida. Modo treino não participa.
- PC e toque participam da mesma tabela; cada entrada guarda o tipo de controle. No toque há mira assistida.
- Só quem pode entrar no top 10 recebe o campo de nome. Se alguém registrar uma marca melhor durante o preenchimento, o servidor recalcula a colocação ao salvar.
- Nome/apelido de até 24 caracteres; nomes e tempos ficam públicos no arquivo e no histórico do GitHub. Não peça nome completo.
- O arquivo é atualizado com controle de versão SHA e até quatro tentativas quando há conflito, evitando perder o resultado de outra pessoa.
- O servidor mantém até 2.000 IDs de partidas registradas para evitar repetição recente. O comprovante de início expira em 24 horas.

## Limitações e operação

É um ranking recreativo para o projeto escolar. O cliente executa a física e informa o tempo: assinatura de início, validações e CORS **não comprovam que a pessoa venceu honestamente**. Alguém com conhecimento técnico pode manipular o jogo ou abusar do endpoint. Para competições, adicione validação de replay no servidor, controle de abuso e moderação; não ofereça prêmios com esta implementação.

Cada novo recorde gera um commit, podendo acionar uma publicação do Pages. Existem limites de requisições do GitHub e do provedor do Worker; esta solução se destina a pouco tráfego. Revogue o token e desative o Worker se houver abuso. Não é necessário criar tabelas ou banco de dados.

Para testar localmente as regras sem rede: `node tests/ranking.mjs`. O teste simula a API do GitHub, incluindo duas gravações simultâneas; ele não verifica credenciais nem uma publicação real.

## Implantação confirmada em 27/10/2026

- Worker publicado na conta pessoal e dois segredos configurados no cofre: `GITHUB_TOKEN` e `SESSION_SECRET`. Nenhum valor de segredo está no repositório.
- Permissão GitHub `Ultima Flecha Ranking`: somente `sswendel/ultima-flecha`, Contents: Read and write e Metadata: Read-only. Expira em **25/01/2027**. Antes dessa data, renove-a e atualize o segredo `GITHUB_TOKEN` na Cloudflare pessoal para manter a gravação funcionando.
- Leitura e início de partida verificados no serviço publicado. Teste real de gravação com 12.001 ms, reenvio da mesma sessão e origem inválida; registro técnico removido automaticamente e ausência confirmada no arquivo.
- O cofre é acessível pelo painel da **conta pessoal** ou pelo login OAuth pessoal do Wrangler. As variáveis de ambiente globais desta máquina apontam para a conta corporativa: não use `CLOUDFLARE_API_TOKEN` global para este projeto. Em um processo dedicado, remova essa variável e defina `CLOUDFLARE_ACCOUNT_ID=967593ac0c05e0887ce9b8dc51f6aa1d`, usando o login pessoal já salvo.
