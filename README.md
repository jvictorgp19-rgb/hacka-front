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

O frontend só funciona com a API do repositório `hacka-back` no ar. Configure a URL dela
em `NEXT_PUBLIC_API_URL` (padrão do exemplo: `http://localhost:8000`) e abra
`http://localhost:3000`, a origem liberada em `CORS_ORIGINS` no backend.

Para servir o artefato exportado:

```bash
npm run build
npm start
```

`npm start` serve os arquivos de `out/`. Para outra porta, use `PREVIEW_PORT=3100 npm start`.

## Dados

Cliente HTTP com DTOs validados, timeout/cancelamento e erros explícitos. Nenhum dado local
substitui a API. Variáveis `NEXT_PUBLIC_*` são públicas e incorporadas ao artefato; não
coloque segredos nelas. Trocar a URL em hospedagem estática exige um novo build.

A identidade vem de `GET /identity`: o frontend não escolhe persona nem concede permissão.

## Funcionalidades do frontend

- Conversas com fontes navegáveis, abstenção, comparação de versão e contexto persistido.
- Acervo por tema/área/fase, versões e seleção individual/em lote de PDFs.
- Perspectivas de riscos, prazos, obrigações e valores; tabela, barras e timeline com fonte.
- Simuladores com premissas explícitas, alçadas, faltas, limites e calendário de prévia.
- Prazos em lista/calendário, usando os mesmos eventos e a referência informada.
- Resumo executivo por evidências selecionadas, versões salvas, TXT e impressão/PDF.
- Histórico, sugestões por tema/fontes e feedback por resposta.
- Pedido de orientação e resposta curada pela área responsável.
- Navegação responsiva, tema claro/escuro, teclado, contraste e texto ajustável.

## Limites

O calendário dos simuladores é o que a API envia em `/simulation-rules`. Datas são prévias e
exigem validação da unidade. Não há envio de e-mail, PPTX ou OCR no navegador. Fontes
corporativas protegidas nunca devem ser copiadas para `public/`.

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

Os testes de navegador usam uma API de contrato interceptada (`tests/e2e/mock-api.ts`), por
isso o build de teste aponta para um host inválido:

```bash
NEXT_PUBLIC_API_URL=https://api.test.invalid npm run build
TEST_STATIC=1 npm run test:e2e
```

Antes de apresentar ou publicar, gere o build com a URL real da API.

## Estrutura e documentação

`src/features/` contém as telas; `components/` contém layout e UI; `contracts/`
valida DTOs; `services/http/` consome o backend.
Calculadoras puras ficam em `features/simulators/calculations.ts`.

- [Plano e checkpoints](docs/IMPLEMENT-PLAN.md)
- [Contrato proposto da API](docs/API-CONTRACT.md)
- [Integração e pacote AWS](docs/FRONTEND-HANDOFF.md)
- [Workflow Dev → Homolog → main](docs/WORKFLOW.md)
- [Registro de preservação](docs/REORGANIZACAO.md)
- [Proposta original](docs/PROPOSTA.md) — documento de concepção histórico; nomes de branches e previsões de implementação nela não substituem o estado atual.
