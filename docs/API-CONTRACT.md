# Contrato de integração — v0.2

Status: contratos conferidos com FastAPI e777c4f; integração real de envios validada
em SQLite isolado e AUTH_MODE=demo. Autenticação de produção e Neon não validados.
Fonte executável dos DTOs e validações: `src/contracts/models.ts`.
Interface consumida pelas telas: `src/services/gateway.ts`.

Os endpoints retornam diretamente o DTO ou array descrito, sem envelope.
`/docs` permanece disponível à documentação do FastAPI. Não é catálogo de arquivos.

| Método e caminho relativo à API      | Entrada                                       | Saída                                         |
| ------------------------------------ | --------------------------------------------- | --------------------------------------------- |
| GET /identity                        | sessão autenticada                            | Identity                                      |
| GET /documents                       | —                                             | DocumentVersion[]                             |
| GET /analyses/evidence               | —                                             | Fact[]                                        |
| GET /conversations/messages?persona= | contexto de apresentação                      | Answer[]                                      |
| POST /conversations/messages         | query, context (incluindo conversationId)     | Answer                                        |
| GET /simulation-rules                | —                                             | SimulationRules (src/contracts/simulation.ts) |
| GET /deadlines                       | —                                             | Deadline[]                                    |
| GET /audit/findings                  | —                                             | Finding[]                                     |
| GET /access-requests?persona=        | contexto de apresentação; não autorização     | AccessRequest[]                               |
| POST /access-requests                | reason (mínimo 10 caracteres), persona, owner | AccessRequest                                 |
| POST /access-requests/:id/decision   | status, response, persona                     | AccessRequest                                 |
| GET /analyses?persona=               | contexto de apresentação                      | SavedRecord[]                                 |
| POST /analyses                       | SavedRecord                                   | SavedRecord                                   |
| GET /feedback?persona=               | contexto de apresentação                      | Feedback[]                                    |
| POST /feedback                       | Feedback                                      | Feedback                                      |
| POST /document-jobs                  | multipart: files[]                            | UploadItem[]                                  |
| GET /document-jobs/:id               | ID informado pelo serviço                     | UploadItem                                    |

Valores em centavos inteiros e datas ISO (date ou timestamp com timezone).
Referências de fonte aceitam caminhos relativos ao host do frontend (assets sintéticos)
ou URLs HTTP(S). Arquivos do backend devem usar URLs absolutas autorizadas; o backend
não deve retornar URL pública para documento restrito. Citações sem página não
permitem inventar página/realce. Dados devem estar autorizados antes de chegar ao cliente.

O cliente envia cookies via credentials:include. O servidor deve definir a sessão,
CORS por origem e proteção CSRF adequada ao mecanismo de autenticação escolhido.
Não há login implementado neste contrato preliminar; identidade da API não pode ser
substituída pelo seletor de persona da demo. Nenhum token é armazenado em localStorage.

Erros HTTP: 401 exige autenticação, 403 acesso negado, 429/5xx recuperáveis.
Opcional: x-request-id para rastreamento. Corpo de erro do serviço não é executado
nem mostrado integralmente. Timeout do cliente: 15 s, cancelável. Cancelar fetch
interrompe a espera, não garante cancelamento do processamento no backend.

MVP do cliente: até 100 documentos/evidências por resposta, até 10 PDFs de 20 MiB
por lote. Catálogo/evidências ainda exigem alinhamento de paginação antes de superar
esses limites. Histórico de envios usa offset em páginas de 100. Itens pendentes
são consultados a cada 3 s, sem sobreposição e com backoff até 30 s em falhas; ao
sair da tela, o polling é cancelado. Há atualização manual. Estados vêm da API;
o frontend não inventa percentuais de processamento.

Exportação local: texto e impressão. PPTX, envio de e-mail, ingestão de PDFs novos,
OCR/RAG, auditoria durável e permissões ficam no backend e não estão comprovados.
Demo é uma fonte de dados separada e identificada; API com falha nunca vira demo.
Para contratos estáveis, os DTOs de transporte deverão ser gerados do OpenAPI.

Capacidade `curate` controla a apresentação das ações de curadoria no modo API.
A autorização por domínio e a validação da decisão são obrigatórias no backend;
campos persona/owner não conferem acesso. Decisões podem retornar decidedAt/decidedBy.
Concessão real com expiração não está implementada; a demo apenas registra o cenário.

## Evolução de envios — backend e777c4f

Verificado em `hacka-back/fix/persistencia-envios-aprovacao`, SHA
`e777c4fb0deea164ba7cbea226672f24c5acfb38`. Ambiente de integração isolado:
`http://127.0.0.1:8100`, AUTH_MODE=demo, SQLite temporário. Não é produção/Neon.

- GET `/document-jobs?limit=100&offset=N`: envios autorizados paginados.
- GET `/document-jobs/:id/file`: original como Blob; 404 se ausente ou não autorizado.
- POST `/document-jobs/:id/decision`: status aprovado/recusado e response opcional;
  confirmação com responsável/data. 403 sem permissão; 409 decisão concorrente;
  503 falha de banco. Não confundir ready com aprovado.
- DTO acrescenta createdAt, saved, fileAvailable, canApprove, aprovacao, aprovadores,
  decidedBy, decidedAt e response. Campos de decisão aceitam null.
- `/identity` pode incluir modo=demo|token. X-Persona-Id só é propagado no modo demo
  explicitamente retornado pelo serviço; não é autenticação de produção.
- O modo token requer Bearer no backend. Login/obtenção de token não foi entregue
  pelo frontend e permanece pendente de integração com o mecanismo de sessão.

Demo independente permanece explícita e não chama essas rotas; aprovações reais e
original de envio exigem API. O contexto de identidade é reinicializado na recarga.
