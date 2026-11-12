# Contrato de integração proposto — v0.1

Status: proposta do frontend; precisa ser alinhada com o repositório FastAPI.
Fonte executável dos DTOs e validações: `src/contracts/models.ts`.
Interface consumida pelas telas: `src/services/gateway.ts`.

Os endpoints retornam diretamente o DTO ou array descrito, sem envelope.
`/docs` permanece disponível à documentação do FastAPI. Não é catálogo de arquivos.

| Método e caminho relativo à API | Entrada | Saída |
|---|---|---|
| GET /identity | sessão autenticada | Identity |
| GET /documents | — | DocumentVersion[] |
| GET /analyses/evidence | — | Fact[] |
| GET /conversations/messages?persona= | contexto de apresentação | Answer[] |
| POST /conversations/messages | query, context (incluindo conversationId) | Answer |
| GET /deadlines | — | Deadline[] |
| GET /audit/findings | — | Finding[] |
| GET /access-requests?persona= | contexto de apresentação; não autorização | AccessRequest[] |
| POST /access-requests | reason, persona | AccessRequest |
| POST /access-requests/:id/decision | status, response, persona | AccessRequest |
| GET /analyses?persona= | contexto de apresentação | SavedRecord[] |
| POST /analyses | SavedRecord | SavedRecord |
| GET /feedback?persona= | contexto de apresentação | Feedback[] |
| POST /feedback | Feedback | Feedback |
| POST /document-jobs | multipart: files[] | UploadItem[] |

Valores em centavos inteiros e datas ISO (date ou timestamp com timezone).
Referências de fonte aceitam caminhos relativos ao host ou URLs HTTP(S); o backend
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
por lote. Paginação por cursor e polling GET /document-jobs/:id devem ser alinhados
antes de aumentar o acervo ou utilizar processamento assíncrono real. O contrato
atual de upload retorna estados; o frontend não inventa percentuais de processamento.

Exportação local: texto e impressão. PPTX, envio de e-mail, ingestão de PDFs novos,
OCR/RAG, auditoria durável e permissões ficam no backend e não estão comprovados.
Demo é uma fonte de dados separada e identificada; API com falha nunca vira demo.
Para contratos estáveis, os DTOs de transporte deverão ser gerados do OpenAPI.
