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
