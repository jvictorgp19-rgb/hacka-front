# TASKS — Adaptação visual ao Design System uniDS (Banco do Brasil / BBTS)

Escopo: **somente identidade visual** (cores, fontes, ícones, botões, layouts e estilos).
Fora de escopo: lógica, funções, estados, hooks, rotas, APIs, regras de negócio, textos e
estrutura de componentes. Nenhuma funcionalidade pode ser removida e a responsividade deve
ser preservada (teste `tests/e2e/visual.spec.ts` verifica ausência de rolagem horizontal em
375px e 1440px).

Ordem: estilos globais → componentes reutilizáveis → páginas e dashboards → verificação.

## Fonte de referência

Arquivo fornecido pela banca: `uniDS - Design Kit 2026 (1).fig.zip` (Figma, decodificado para
leitura dos estilos, variáveis e componentes). Modo de cor utilizado: **BBTS Light**.

| Grupo       | Tokens extraídos                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marca       | `brand-blue` 500 `#465eff` (primário), 600 `#3640f5` (texto/borda/ícone primário), 700 `#2a30d8` (hover), 900 `#262e89` (pressed), 100 `#dde9ff` (tint/selecionado); `brand-yellow` 300 `#fcfc30` (secundário), 400 `#f9f016`, 100 `#fafec3`                                                                                                                                                                                                                   |
| Neutros     | 50 `#fafafa` (container base), 100 `#f4f4f5` (raised), 200 `#e4e4e7` (hover), 300 `#d4d4d8` (borda suave), 400 `#9f9fa9` (borda), 500 `#71717b` (placeholder), 700 `#3f3f46` (texto suave), 950 `#09090b` (texto); fundo `#ffffff`                                                                                                                                                                                                                             |
| Status      | success `#14670d`/tint `#d2ffc8`; warning `#dd6b02` (texto `#b74a06`)/tint `#fff1c6`; critical `#c80d19`/tint `#ffdfe1`; info `#1758b6` (container `#194b8f`)/tint `#d9f1ff`; accent `#0b6c93`/tint `#cef7ff`; decorative `#654eb0`/tint `#e8e5fd`                                                                                                                                                                                                             |
| Tipografia  | `BancoDoBrasil Titulos` (títulos/botões) e `BancoDoBrasil Textos` (corpo). Escala: Title 38/34/30/26/22/20, Paragraph 22/18/16/14/12, Label/Caption 18/16/14/12, Button 18/16/14 (Medium, +0.15 letter-spacing)                                                                                                                                                                                                                                                |
| Raios       | sm 4, md 8, lg 16, xl 24, pill 999                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Espaçamento | 4, 8, 12, 16, 24, 32, 40, 48… (base 8)                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Sombras     | Level 1 `0 4px 4px #0000001a`; Level 2 `0 8px 24px #0000004d`; Hover `0 0 8px #00000033`; Focus `0 0 0 2px #fafafa, 0 0 0 4px #54dcfc`                                                                                                                                                                                                                                                                                                                         |
| Componentes | Button pílula (32/40/56 px; primário `#465eff`, secundário contorno `#3640f5`, terciário só texto); Text Field 40 px, raio 8, fundo `#f4f4f5`, borda `#d4d4d8` → foco `#3640f5`; Card raio 24, padding 24, borda `#d4d4d8`; Tag raio 4; Badge pílula; Alert raio 4 com tint de status; Modal raio 24; Tooltip `#3f3f46`; Sidebar item selecionado `#dde9ff` + borda/texto `#3640f5`; Tab ativa com barra `#465eff`/`#fcfc30`; Table row 56 px, hover `#e4e4e7` |
| Ícones      | Kit usa Material Symbols (contorno, 24 px). Cores: default `#18181b`, muted `#52525c`, primary `#3640f5`                                                                                                                                                                                                                                                                                                                                                       |

Decisões:

- **Fontes**: as famílias `BancoDoBrasil Textos/Titulos` são proprietárias e não vêm no kit.
  São declaradas primeiro na pilha (usadas quando instaladas na máquina) com fallback web
  `Source Sans 3` (a família “Source Sans Pro” também aparece no kit) e `Calibri` (fonte
  anterior dos estilos do kit).
- **Ícones**: manter `lucide-react` (mesmo estilo de contorno do Material Symbols) e alinhar
  tamanho, espessura e cores por CSS. Trocar a biblioteca exigiria editar todos os imports e
  JSX das telas, o que foge de “evitar refatorações desnecessárias”.
- **Nomes de variáveis CSS existentes** (`--brand`, `--ink`, `--surface`…) são mantidos e
  passam a apontar para os tokens uniDS (`--ds-*`), evitando refatorar seletores.
- **Simuladores legados (Tailwind)**: a paleta do Tailwind é remapeada via `@theme` para as
  escalas uniDS e os hex antigos (`#002D72`, `#003c96`, `#FFCC00`) são trocados por tokens
  de tema — apenas strings de `className`.

## Checklist

### Prioridade 1 — Estilos globais

- [x] **T1. Tokens de design globais**
  - Objetivo: declarar os tokens uniDS (cores primitivas e semânticas, raios, sombras,
    espaçamento, foco) em `:root` e reapontar as variáveis existentes; adaptar tema escuro e
    alto contraste a partir das primitivas uniDS.
  - Arquivos: `src/app/globals.css`.
  - Critérios: nenhuma cor fixa fora dos tokens no bloco de variáveis; tema claro, escuro e
    alto contraste continuam alternando; lint/typecheck/testes unitários passam.
- [x] **T2. Tipografia**
  - Objetivo: aplicar a pilha `BancoDoBrasil Textos/Titulos` + fallback `Source Sans 3`;
    títulos com a família de títulos e escala uniDS; tamanho mínimo de texto 12 px.
  - Arquivos: `src/app/layout.tsx` (somente carregamento da fonte), `src/app/globals.css`.
  - Critérios: fonte carregada via `next/font`; h1/h2/h3 seguem a escala; sem regressão de
    rolagem horizontal; build estático conclui.
- [x] **T3. Elementos base (foco, formulários, links, tabelas)**
  - Objetivo: anel de foco uniDS; inputs/selects/textareas no padrão Text Field (40 px,
    raio 8, fundo raised, borda suave, foco primário); checkbox/range com `accent-color`
    primário; tabelas no padrão Table Row.
  - Arquivos: `src/app/globals.css`.
  - Critérios: estados hover/foco/disabled visíveis; formulários continuam operáveis.

### Prioridade 2 — Componentes reutilizáveis

- [x] **T4. Botões**
  - Objetivo: `.primary-button`, `.secondary-button`, `.icon-button`, `.source-link`,
    `.segmented`, `.new-conversation` e botões de ação no padrão Button uniDS (pílula, 40 px,
    Titulos Medium, hover/pressed/disabled).
  - Arquivos: `src/app/globals.css`.
  - Critérios: todos os botões mantêm rótulos acessíveis e área de clique ≥ 32 px.
- [x] **T5. Tags, badges, avisos e estados vazios**
  - Objetivo: `.tag`, `.mode-badge`, `.notice`, `.empty-state`, `.error-panel`, `.live-dot`,
    `.avatar` no padrão Tag/Badge/Alert.
  - Arquivos: `src/app/globals.css`.
  - Critérios: contraste AA; avisos continuam visíveis e legíveis nos dois temas.
- [x] **T6. Cards, painéis e diálogos**
  - Objetivo: `.evidence-card`, `.document-list`, `.upload-queue`, `.result-box`,
    `.detail-dialog`, `.source-panel`, `.accessibility-options` no padrão Card Container/Modal
    (raio 24/16, borda suave, sombras uniDS).
  - Arquivos: `src/app/globals.css`, `src/components/ui/primitives.tsx` e
    `src/components/ui/Dialog.tsx` (sem alteração necessária se as classes bastarem).
  - Critérios: diálogos abrem/fecham; backdrop no padrão overlay.
- [x] **T7. Ícones**
  - Objetivo: padronizar cor/espessura dos ícones lucide conforme tokens `icon/*`.
  - Arquivos: `src/app/globals.css`.
  - Critérios: ícones herdando cores semânticas; nenhuma alteração de JSX.
- [x] **T8. Shell da aplicação (sidebar, topbar, rodapé, marca)**
  - Objetivo: Sidebar Menu (item selecionado tint + borda primária), Header uniDS (64 px,
    fundo base, barra de destaque amarela da marca), símbolo da marca amarelo/azul, rodapé.
  - Arquivos: `src/app/globals.css`.
  - Critérios: menu recolhível e menu mobile funcionam; navegação por teclado preservada.
- [x] **T9. Simuladores legados e fluxograma (Tailwind)**
  - Objetivo: remapear paleta Tailwind (slate→neutral, blue→brand-blue, emerald→green,
    rose→red, amber→amber uniDS) e substituir hex antigos por tokens de tema.
  - Arquivos: `src/app/globals.css`, `src/components/FeriasSimulators.tsx`,
    `src/components/InovacaoSimulators.tsx`, `src/components/LocacaoSimulators.tsx`,
    `src/components/MermaidFlowchart.tsx` (somente valores de `className`).
  - Critérios: diff dos TSX restrito a cores em `className`; testes de simuladores passam.

### Prioridade 3 — Páginas e dashboards

- [x] **T10. Conversas (home)**
  - Objetivo: intro, sugestões, composer e mensagens no padrão uniDS.
  - Arquivos: `src/app/globals.css`.
  - Critérios: título “O que vamos esclarecer hoje?” visível; composer fixo funcionando.
- [x] **T11. Acervo, Análises, Prazos, Resumos, Histórico, Curadoria, Simuladores**
  - Objetivo: listas de documentos, barras de valor, linha do tempo, calendário, prévia de
    relatório, formulários de curadoria e guia de demonstração com tokens uniDS e tamanhos
    mínimos de texto.
  - Arquivos: `src/app/globals.css`.
  - Critérios: todas as rotas sem rolagem horizontal em 375/1440 px; impressão preservada.

### Prioridade 4 — Verificação

- [x] **T12. Verificação final e revisão**
  - Objetivo: rodar lint, typecheck, testes unitários, build estático e e2e disponíveis;
    revisar diff para garantir que só estilos mudaram.
  - Arquivos: — (somente leitura) e este `TASKS.md`.
  - Critérios: verificações verdes (ou falhas documentadas com causa); resumo dos arquivos
    modificados.

## Registro da verificação (T12)

| Verificação                           | Resultado                                                    |
| ------------------------------------- | ------------------------------------------------------------ |
| `npm run lint`                        | sem erros/avisos                                             |
| `npm run typecheck`                   | ok                                                           |
| `npm test` (Vitest)                   | 9 arquivos, 41 testes aprovados                              |
| `npm run build` (export estático)     | 9 rotas geradas                                              |
| `npx playwright test` (build servido) | 13 testes aprovados, incluindo 375/1440 px e texto a 200%    |
| Prettier nos arquivos alterados       | ok (`--end-of-line auto`; o repositório usa CRLF no Windows) |

Observação: os e2e foram executados com `TEST_BASE_URL` apontando para o build servido em
outra porta, pois a porta 3000 estava ocupada por outra aplicação local.
