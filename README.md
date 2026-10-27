# A Última Flecha

Jogo educativo em HTML5 e JavaScript. O jogador enfrenta o Colosso de Pedra em cinco fases, desviando dos ataques e acertando o núcleo quando fica vulnerável.

## Jogar

**Acesse:** https://sswendel.github.io/ultima-flecha/

O jogo também pode ser aberto localmente: baixe este repositório e abra `index.html` em um navegador moderno.

## Controles

- **WASD ou setas:** mover
- **Mouse:** mirar
- **Clique:** disparar a flecha
- **Espaço ou botão direito:** chamar a flecha de volta
- **Shift:** dash
- **P:** pausar
- **M:** ativar ou silenciar o som
- **F:** tela cheia

No celular, use o joystick e os botões na tela.

## Conteúdo matemático

O tema de sequências numéricas é aplicado à lógica do jogo. A progressão não aparece como um questionário: os termos calculados pelas fórmulas alteram os desafios das fases.

### Progressão aritmética (PA)

A quantidade de projéteis de cada anel aumenta em uma PA:

`a_n = 6 + (n - 1) · 2`

| Fase | Termo da PA | Projéteis por anel |
|---:|---:|---:|
| 1 | 6 | 6 |
| 2 | 8 | 8 |
| 3 | 10 | 10 |
| 4 | 12 | 12 |
| 5 | 14 | 14 |

### Progressão geométrica (PG)

Outros parâmetros crescem ou diminuem em PG a cada fase:

| Mecânica | Termo geral | Comportamento |
|---|---|---|
| Velocidade dos projéteis | `130 · 1,15^(n−1)` px/s | aumenta |
| Tempo de núcleo vulnerável | `3,2 · 0,85^(n−1)` s | diminui |
| Velocidade de perseguição do Colosso | `40 · 1,25^(n−1)` px/s | aumenta |
| Velocidade de rotação do núcleo | `0,9 · 1,3^(n−1)` rad/s | aumenta |
| Velocidade da investida | `320 · 1,1^(n−1)` px/s | aumenta |

Assim, cada nova fase apresenta termos seguintes das sequências e exige que o jogador ajuste movimentação, mira e tempo de ataque.

## Tecnologias

HTML5 Canvas, CSS e JavaScript. Não requer instalação de dependências para jogar.

## Celular (versão 2)

Controles de toque em tamanho fixo fora da arena, em retrato e paisagem. Arraste o joystick para mover, use DASH para desviar, ATIRAR para mirar no núcleo automaticamente ou arraste e solte na arena para mirar manualmente. Segure PUXAR para recuperar a flecha. Os controles aceitam dedos simultâneos e cancelam comandos ao perder foco. Para aproveitar melhor a arena, jogue com o celular deitado.

O jogo pausa ao trocar de aplicativo ou girar a tela. O cronômetro usa tempo real em vez da duração limitada dos quadros, zerando ao morrer e contando somente a nova tentativa, sem somar a espera para recomeçar. Recordes locais antigos são separados dos atuais por essa mudança de medição.

## Ranking global

O top 10 global está ativo e grava em `ranking.json` no GitHub, sem banco de dados. O serviço de gravação é `https://ultima-flecha-ranking.wendel-dak.workers.dev`, publicado exclusivamente na conta Cloudflare pessoal. Quem termina as cinco fases entre os dez menores tempos pode informar um apelido. Tempos são ordenados em milissegundos. Consulte [ranking-service/README.md](ranking-service/README.md) para manutenção.

## Verificação

`node tests/mobile.mjs` verifica lógica de controles, pausa e cronômetro com elementos simulados. `node tests/ranking.mjs` verifica regras do ranking e conflitos de gravação com uma API simulada. Esses testes não substituem a avaliação dos controles em um aparelho físico.
