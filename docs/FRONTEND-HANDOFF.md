# Integração, validação e preparação para AWS

## Estado do frontend

Frontend exportável com `output: 'export'` e `trailingSlash: true`. O artefato `out/`
contém HTML, CSS, JavaScript, fontes e PDFs sintéticos. Não depende de Node/Next em
produção para executar regras de servidor. `scripts/serve.mjs` é apenas preview
local de arquivos, não é o backend da solução.

A integração de envios foi comprovada contra FastAPI real e777c4f em SQLite
isolado, AUTH_MODE=demo, incluindo reinício. IB-05 registra as evidências. Os E2E
de CI usam fixtures HTTP e não substituem essa jornada opt-in. Neon, autenticação
de produção e indexação/RAG corporativos continuam fora da comprovação.
`API-CONTRACT.md`, `src/contracts/` e `src/services/gateway.ts` definem a integração.

## Responsabilidades

| Frontend                                                  | Backend externo                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| Interface, contexto, filtros e renderização de evidências | Recuperação autorizada, RAG/LLM e resolução fundamentada de consultas |
| Seleção de PDFs e estados recebidos do serviço            | Validação definitiva, armazenamento, extração e indexação             |
| Simulações explicáveis com regras/calendário recebidos    | Regras oficiais, calendário completo e decisões transacionais         |
| Composição de resumos por seleção e exportação textual    | Geração oficial de apresentações, se implementada                     |
| Apresentação de identidade/capacidades e decisões         | Autenticação, autorização por domínio e auditoria durável             |
| Cliente HTTP, timeout, cancelamento da espera e retry     | Idempotência, cancelamento de tarefas e consistência de gravação      |

## Alinhamento necessário com o outro repositório

1. Confirmar ou mapear os endpoints propostos. O catálogo usa `/documents`, não `/docs`.
2. Definir autenticação; o cliente atual envia cookies com `credentials: include`.
   O serviço deve configurar CORS por origem e CSRF conforme o mecanismo adotado.
3. `/identity` retorna ID, nome e capacidades. `curate` habilita a apresentação de
   curadoria; o servidor continua validando cada decisão e domínio.
4. Entregar citações com código, versão, item, trecho e página quando verificada.
   Documento restrito recebe referência autorizada, sem URL pública alternativa.
5. Fornecer datas ISO e valores em centavos; completar o calendário corporativo.
6. Upload: até 10 PDFs de 20 MiB no frontend; validar novamente no backend.
   `POST /document-jobs` retorna estados e `GET /document-jobs/:id` permite atualização
   explícita e polling de itens pendentes, cancelado ao sair da tela. Histórico usa
   offset, original usa download contextual e decisão depende de canApprove do item.
7. Garantir persistência de conversas por `context.conversationId`, versões de análise,
   feedback por resposta e pedidos. Campo persona é contexto, nunca autorização.
8. Alinhar paginação antes de superar o escopo atual: catálogo/evidências limitados
   a 100 itens na validação. Não há truncamento silencioso ou promessa de busca global.
9. Definir concessão temporária com expiração e idempotência de POST. A UI não concede
   acesso real nem implementa SSO. Não há segredo NeonDB no bundle.

Dados sintéticos e preferências visuais podem ficar no navegador. O modo API não
escreve a base `raiziq.demo.v1`. Tema é uma preferência separada sem conteúdo corporativo.

## Preparação de build

```bash
npm ci
npm run lint
npm run typecheck
npm test
NEXT_PUBLIC_DATA_MODE=demo npm run build
npm start
```

Para API, gerar outro artefato com a URL real aprovada:

```bash
NEXT_PUBLIC_DATA_MODE=api NEXT_PUBLIC_API_URL=https://api.exemplo.invalid npm run build
```

A URL acima é ilustrativa e não é um serviço existente. As variáveis são incorporadas
na compilação; S3 não altera `NEXT_PUBLIC_*` em runtime. Não apresentar um build de
teste com `api.test.invalid` como produção.

## Hospedagem AWS proposta, sem provisionamento

Destino compatível com o artefato: bucket S3 privado como origem REST, CloudFront
com OAC e HTTPS. OAC não se aplica ao endpoint de website S3; essa distinção está na
[documentação de origem S3 do CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

O conteúdo de `out/` deve ficar na raiz da origem. Preservar `_next/`, assets,
`docs_acervo/` sintético e os arquivos auxiliares de navegação gerados pelo Next.
Para `/acervo/`, o objeto exportado é `/acervo/index.html`. Ajustar o URI no evento
viewer request conforme o [exemplo oficial de reescrita de índice](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html):

```js
async function handler(event) {
  const request = event.request;
  if (request.uri.endsWith('/')) request.uri += 'index.html';
  else if (!request.uri.split('/').pop().includes('.')) request.uri += '/index.html';
  return request;
}
```

Configurar resposta de erro para `404.html`, preservando HTTP 404, e testar caminhos
inexistentes. HTML/documentos devem ter política de atualização definida; assets
com hash podem usar cache longo. A API externa tem domínio/configuração próprios.

Nenhum bucket, distribuição, domínio, função, segredo, política ou banco foi criado.
Publicação e política de cache final exigem a configuração da conta AWS responsável.
A orientação de exportação segue o [guia Next instalado e público](https://nextjs.org/docs/app/guides/static-exports).

## Roteiro de homologação

- Férias 05/05/2027: D-45 21/03 e pagamento antecipado 30/04; calendário parcial visível.
- Versões: a pergunta de 30 dias aponta para NG_111 v2 e v3.
- Equipe de nove: limite dois; valores de alçada cruzam R$ 18.000,00/18.000,01.
- Contrato: multa nos dias 90/91 e prazo de prorrogação com fonte.
- Abstenção: rateio do prêmio e pergunta não contemplada não recebem regra inventada.
- Curadoria: Ana solicita, curadora GGC responde e Ana recupera após reload.
- Resumo: seleções diferentes mudam conteúdo, versão salva é recuperada e TXT preserva fontes.
- Reutilização: histórico e sugestões explicam relação por tema/fontes; feedback persiste.
- Modo API: falha não vira demo; resposta inválida, cancelamento e processamento são explícitos.
- Interface: larguras 375/768/1440, texto 200%, temas, teclado e fonte por elemento visual.

Resultados executados, SHAs e limitações estão em `docs/checkpoints/`. Mudanças de
organização não apagam os PDFs: a suíte compara todos com o manifesto CP-00.

## Script remoto de publicação manual

O commit remoto `e2b61ba` adicionou `scripts/deploy.sh` durante esta implementação.
A integração preservou sua finalidade de publicação manual em host Linux com PM2,
com adaptação ao preview estático. Não é usado pelo CI nem pelo fluxo S3/CloudFront.
Usar uma `DEPLOY_DIR` exclusiva e vazia: um checkout existente é recusado.
Cada build tem sua própria release, preservando todas as anteriores; falha de build
não muda o processo nem o marcador atual. O restart pode ter breve interrupção.
Modo API exige URL HTTPS explícita. Mudança de configuração no mesmo SHA exige
`FORCE=1`. O host/proxy reverso e suas permissões continuam responsabilidade da conta.
O script foi verificado com comandos isolados simulados, sem publicar serviço algum.
