# Raiz IQ — frontend de inteligência empresarial

Interface do Desafio 2, equipe **Ctrl + Alt + Business**. Next.js App Router,
React, TypeScript, Tailwind e Lucide. O backend FastAPI e o banco NeonDB pertencem
a outro repositório; este projeto não contém endpoints de negócio.

## Executar

Node **22** (também indicado em `.nvmrc`).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. O modo padrão é `demo`: acervo sintético,
cenários delimitados e ações persistidas somente neste navegador.

Para apresentar o artefato exportado, sem Next em execução ou FastAPI:

```bash
npm run build
npm start
```

`npm start` serve os arquivos de `out/`. O script de preview é somente leitura,
sem API. Para outra porta, use `PREVIEW_PORT=3100 npm start`.

## Modos de dados

| Modo                         | Comportamento                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_DATA_MODE=demo` | Provider no navegador, consultas por cenários, dados sintéticos, histórico e reset local.                 |
| `NEXT_PUBLIC_DATA_MODE=api`  | Cliente HTTP externo com DTOs validados, timeout/cancelamento e erros explícitos. Sem fallback para demo. |

No modo API, definir `NEXT_PUBLIC_API_URL` antes do build. Variáveis `NEXT_PUBLIC_*`
são públicas e incorporadas ao artefato; não coloque segredos nelas. Alterar URL/modo
em hospedagem estática exige um novo build.

O contrato é **proposto**, ainda sem comprovação com o backend real. A suíte API
usa respostas controladas para validar a interface, não um backend implementado aqui.

## Funcionalidades do frontend

- Conversas com fontes navegáveis, abstenção, comparação de versão e contexto persistido.
- Acervo por tema/área/fase, versões e seleção individual/em lote de PDFs.
- Perspectivas de riscos, prazos, obrigações e valores; tabela, barras e timeline com fonte.
- Simuladores com premissas explícitas, alçadas, faltas, limites e calendário de prévia.
- Prazos em lista/calendário, usando os mesmos eventos e a referência informada.
- Resumo executivo por evidências selecionadas, versões salvas, TXT e impressão/PDF.
- Histórico, sugestões por tema/fontes e feedback por resposta.
- Pedido de orientação e resposta curada, com identificação clara do modo demo/API.
- Navegação responsiva, tema claro/escuro, teclado, contraste e texto ajustável.

O acervo possui **13 PDFs únicos**, preservados em `docs_acervo/` e nas cópias públicas
de demonstração. O JSON descreve **14 versões**; `RG_1100 v1.0.0` não tem PDF disponível.

## Limites da demonstração

PDF novo é selecionado/validado, mas **não é interpretado ou indexado** pelo navegador.
O exemplo de processamento usa uma fonte já cadastrada. O chat não executa RAG/LLM;
perguntas fora dos cenários retornam abstenção.

O calendário demo é **parcial**: fins de semana e 1º de maio, intervalo 2026–2028.
Datas são prévias e exigem validação da unidade. O seletor de persona não autentica
ninguém; concessões, curadoria e registros locais não representam segurança ou
uma trilha de auditoria imutável.

Não há envio de e-mail, PPTX, OCR, conexão ao banco, ingestão real ou infraestrutura AWS
provisionada. Fontes corporativas protegidas nunca devem ser copiadas para `public/`.

## Verificar

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
```

Após o build, para testar somente os arquivos estáticos:

```bash
TEST_STATIC=1 npm run test:e2e
```

Modo API de contrato (host interceptado pelos testes):

```bash
NEXT_PUBLIC_DATA_MODE=api NEXT_PUBLIC_API_URL=https://api.test.invalid npm run build
TEST_STATIC=1 TEST_DATA_MODE=api npm run test:e2e
```

Em seguida, execute um build `demo` ou com a URL real desejada antes de apresentar/publicar.
O CI verifica ambos os modos e disponibiliza um artefato estático de demonstração.

## Estrutura e documentação

`src/features/` contém as telas; `components/` contém layout e UI; `contracts/`
valida DTOs; `services/http/` consome o backend e `services/demo/` fornece a demo.
Calculadoras puras ficam em `features/simulators/calculations.ts`.

- [Plano e checkpoints](docs/IMPLEMENT-PLAN.md)
- [Contrato proposto da API](docs/API-CONTRACT.md)
- [Integração e pacote AWS](docs/FRONTEND-HANDOFF.md)
- [Workflow Dev → Homolog → main](docs/WORKFLOW.md)
- [Registro de preservação](docs/REORGANIZACAO.md)
- [Proposta original](docs/PROPOSTA.md) — documento de concepção histórico; nomes de branches e previsões de implementação nela não substituem o estado atual.

### Estilos durante o desenvolvimento

`npm run dev` compila o código atual; `npm start` serve o último `out/` gerado.
O cache persistente do Turbopack está desativado no desenvolvimento para evitar
reaproveitar artefatos CSS de versões anteriores. Se uma aba ficou aberta durante
uma atualização, recarregue-a completamente (`Ctrl+Shift+R`). O CI verifica marcas,
cabeçalho e temas tanto no artefato estático quanto em `next dev`.
