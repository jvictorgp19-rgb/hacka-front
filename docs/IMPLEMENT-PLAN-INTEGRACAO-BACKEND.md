# Plano de integração — backend da Fix com UI/UX da Dev

Data: 13/11/2026. Status: **execução aprovada pelo usuário em 13/11/2026**.
Este documento complementa `IMPLEMENT-PLAN.md`. Evidências em `docs/checkpoints/integracao/`.

## Resultado esperado

Integrar histórico de envios, recuperação após navegação/reload, processamento,
aprovação e download do original ao frontend atual. Preservar a identidade uniDS,
logos BBTS/Zero Click, temas, acessibilidade, rotas e correção de desenvolvimento da
Dev. Ao concluir e validar a integração, manter no frontend somente `Dev`, `Homolog`
e `main`, com os históricos recuperáveis por tags e bundle.

Não basta resolver conflitos textuais: backend e frontend precisam concordar em
identidade, DTOs, estados e persistência. Testes com interceptação HTTP e integração
com FastAPI serão registrados como evidências diferentes.

## 1. Inventário verificado

| Referência                               | SHA observado                                                | Situação                                                               |
| ---------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Front `Dev`                              | `183451b9dedd7413df28835a04fee0e2655d0e57`                   | Design e correção local validados pelo usuário                         |
| Front `fix/historico-envios-aprovacao`   | `cac43fe895039fd96dc73f205c6ef9baf68df0f8`                   | Branch local/remota; PR #4 aberto para Homolog                         |
| Front `Homolog`                          | `315111e982e24eccb1dad9fe2062e6fcdca66e53`                   | Já contém a remoção da demo pelo PR #3                                 |
| Front `main`                             | `d11e1d5ded5e8601ebec4b22ca966e81a2c1e75f`                   | Promoção anterior da Homolog pelo PR #2                                |
| Front `chore/remove-codigo-lana`         | ponta incorporada `332138f813d7685ab6f1582f09bc921fa5848ebe` | PR #3 incorporado; branch já não existe no remoto                      |
| Ancestral comum Dev/Fix                  | `7537fa1ad0a8b9f598c67d9876d4d3e086fbdd17`                   | Base para comparar responsabilidades                                   |
| Back `fix/persistencia-envios-aprovacao` | `e777c4fb0deea164ba7cbea226672f24c5acfb38`                   | Contém a correção correspondente; um commit à frente da main observada |
| Back `main`                              | `6e25e2138070bbd02639136c0f05eb9a4f52c31a`                   | Não presumir que já contém a correção de persistência                  |

Os nomes corretos são `fix/historico-envios-aprovacao` e
`chore/remove-codigo-lana`. Não há uma branch literalmente chamada `Fix`.
O inventário deverá ser atualizado antes da execução: colegas podem publicar novos commits.

A cópia local do backend está em `thiago`, SHA `9a2e863`, com contrato anterior.
Ela **não** foi usada como prova de compatibilidade com a correção remota.
Foram lidos os arquivos da branch remota indicada acima; nenhum backend foi executado.

### Mudanças úteis da Fix

O commit `cac43fe` acrescenta:

- Fila de uploads no contexto do workspace, em vez de estado exclusivo da página.
- Restauração de histórico paginado ao abrir o Acervo e recuperar foco.
- Consulta periódica do estado dos envios em processamento.
- Download do original pela API.
- Aprovação por `canApprove`, com resultado confirmado pelo serviço.
- Campos de persistência e decisão no DTO de upload.
- Identidade retornada por `/identity` propagada nas requisições posteriores.
- Testes de retorno ao Acervo, reload, aprovação, download e falha de persistência.

### Mudanças herdadas que exigem resolução deliberada

A Fix parte da Homolog após os commits `e6df851` e `332138f` da chore. A comparação
com o ancestral comum envolve 87 arquivos, incluindo remoções da demo, dados,
simuladores detalhados e 26 caminhos de PDFs. Essas remoções podem ser aplicadas
automaticamente por Git mesmo quando **não** aparece conflito.

A prévia textual de merge apontou alterações dos dois lados em:
`.github/workflows/ci.yml`, `README.md`, `src/app/globals.css`,
`src/components/layout/WorkspaceShell.tsx` e `src/features/workspace/Conversation.tsx`.
Essa lista não substitui a revisão dos arquivos removidos sem conflito.

## 2. Decisões de integração

1. **Dev define a apresentação.** Preservar CSS, fontes, chrome azul, logos, temas,
   mobile, menu recolhido, acessibilidade e a configuração de `next dev` da Dev.
2. **Fix contribui com comportamento.** Adaptar seus contratos e fluxos às telas
   atuais, sem substituir o shell ou o CSS por versões antigas.
3. **Preservar o requisito anterior de demo independente.** Manter `demo|api`
   explícitos e separados; API com erro nunca vira demo. A remoção da demo e do
   acervo, herdada da chore, não está implícita neste pedido de integração.
   Alterar essa decisão exige uma instrução específica de produto.
4. **Preservar o acervo e os cálculos da Dev.** Restaurar no resultado do merge
   qualquer remoção herdada desses arquivos; conferir o manifesto original.
   Isso preserva conteúdo já existente na Dev, não reintroduz uma versão antiga
   do webapp nem código de backend neste repositório.
5. **Backend continua externo.** Nenhuma rota Next de negócio, banco, ingestão,
   credencial ou autorização real será implementada no frontend.
6. **Merge com histórico completo.** Fazer merge real da Fix na Dev com revisão
   antes do commit, sem `-s ours`, sem aceitação global de `ours/theirs`, sem
   rebase de histórico compartilhado e sem force push.
7. **Limpeza somente ao final.** A branch Fix fica disponível até a integração
   passar pelos critérios de aceite. Não recriar a chore que já foi apagada.
8. **Escopo das branches: frontend.** Não apagar nem promover branches do backend
   como efeito desta execução. Elas exigem o fluxo próprio daquele repositório.

Ao promover a Dev resultante para Homolog, a preservação da demo significa que
esses arquivos voltarão à árvore da Homolog, onde a chore os removeu. Esse efeito
deve constar expressamente no PR, para revisão consciente da equipe.

## 3. Contrato real a incorporar

Rotas verificadas no backend `e777c4f`:

| Operação   | Contrato                                 | Uso no frontend                                                                        |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| Identidade | `GET /identity`                          | Inicializar sujeito e capacidades antes dos dados restritos                            |
| Envio      | `POST /document-jobs`, multipart `files` | Usar os IDs e estados devolvidos; não inventar confirmação                             |
| Histórico  | `GET /document-jobs?limit=100&offset=N`  | Recuperar somente envios autorizados, em todas as páginas                              |
| Estado     | `GET /document-jobs/{id}`                | Atualizar itens pendentes                                                              |
| Original   | `GET /document-jobs/{id}/file`           | Baixar Blob com o mesmo contexto de identidade                                         |
| Decisão    | `POST /document-jobs/{id}/decision`      | `{status: 'aprovado' ou 'recusado', response?: string}`; receber UploadItem atualizado |

`UploadItem`: os cinco campos atuais mais `createdAt`, `saved`, `fileAvailable`,
`canApprove`, `aprovacao`, `aprovadores`, `decidedBy`, `decidedAt` e `response`.
No backend, `saved` tem default verdadeiro; arquivo disponível e possibilidade de
aprovar são informações distintas. Campos de decisão podem ser nulos. Datas devem
ser verificadas antes de formatar; tamanho não pode aceitar valores inválidos.

O backend também retorna classificação, departamento e outros detalhes. Só ampliar
sua apresentação se necessário para os fluxos deste plano; não iniciar outro dashboard.
O status técnico `ready` não equivale automaticamente a aprovação de negócio.

### Identidade e conexão

- O cliente atual envia cookies, mas o backend verificado documenta `AUTH_MODE=demo`
  e `AUTH_MODE=token`. Cookies, sozinhos, não comprovam autenticação nesse contrato.
- Em `AUTH_MODE=demo`, identidade pode vir de `DEMO_DEFAULT_PERSONA` configurada no
  servidor. `X-Persona-Id` é contexto de simulação, não credencial de produção.
- Em `AUTH_MODE=token`, o backend exige Bearer. Confirmar o mecanismo de obtenção e
  envio do token existente; não embutir token em `NEXT_PUBLIC_*`, repositório ou demo.
- Não preencher identidade API silenciosamente com `ana`; não liberar ações por
  seletor de persona do frontend. Alteração de sujeito deve limpar estado restrito.
- Conferir CORS para a origem/porta efetivamente usadas, credenciais e header adicional.
- Download de envios usa fetch autenticado/contextual e Blob; não é um link direto
  que perde headers. Documentos do catálogo podem exigir a mesma revisão.
- Validar caminhos absolutos e autorizados das fontes. Assets locais da demo não
  são alternativa para um documento corporativo negado pela API.

No provider demo independente, os novos métodos devem ter comportamento local
claramente identificado ou indisponibilidade explícita, conforme a capacidade
apresentada. Restauração/polling da API só são executados no modo `api`. Não simular
uma confirmação do servidor para satisfazer a interface TypeScript nem quebrar a
compilação da demo ao ampliar `AppGateway`.

Uma validação com backend em `AUTH_MODE=demo` e dados sintéticos prova integração
HTTP/persistência daquele ambiente; não será descrita como autenticação de produção.

## 4. Checkpoints e commits

Cada checkpoint registra SHA, comportamento validado, comandos, resultados e limites
em `docs/checkpoints/integracao/`. Os títulos abaixo são a sequência proposta;
se um checkpoint exigir mais de um commit, manter as responsabilidades separadas.

### IB-00 — Preservação e linha de base

**Entrega:** atualizar refs e inventário; registrar SHA de cada ponta; preservar Dev,
Fix, Homolog/main e ponta histórica da chore por tags de backup e bundle verificado.
Conferir os hashes dos 13 PDFs únicos nos 26 caminhos e capturar a UI atual.

Reservar nomes como `backup/pre-integracao-2026-11-13/...`; se já existirem, usar
sufixo único, sem sobrescrever tags. Não criar novas branches permanentes.

**Commit:** `docs(integracao): registra bases backups e critérios de preservação`.

**Aceite:** árvore limpa antes da execução, bundle verificável, fontes recuperáveis,
backups dos dois lados e capturas claras/escuras/mobile do estado aprovado da Dev.

### IB-01 — Matriz de contrato com o backend alvo

**Entrega:** fixar branch/SHA/URL do FastAPI de teste; confirmar OpenAPI ou respostas
reais, schemas, identidade, CORS, paginação, download e decisão. Atualizar
`API-CONTRACT.md` e fixtures a partir desse contrato. Não misturar dados reais em testes.

**Commit:** `docs(api): alinha contrato de histórico originais e decisão com FastAPI`.

**Aceite:** matriz endpoint/campo/erro conferida e ambiente de teste identificado.
Se o backend alvo não estiver disponível ou ainda usar contrato antigo, registrar a
pendência e não avançar para alegação de integração real nem limpeza de branches.

### IB-02 — Merge controlado mantendo a Dev como referência visual

**Entrega:** trabalhar em checkout isolado, se necessário em worktree temporário
com HEAD destacado. Executar o equivalente a `git merge --no-ff --no-commit <Fix-SHA>`.
Revisar a árvore completa, inclusive deleções aplicadas sem conflito. Combinar os
comportamentos necessários antes de produzir o merge commit utilizável.

Matriz de resolução:

| Grupo                                                                      | Resolução                                                                                      |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `globals.css`, `layout.tsx`, marcas, `BrandMarks`, estilos dos simuladores | Preservar Dev; novos controles seguem seus tokens e classes                                    |
| `WorkspaceShell.tsx`, `Conversation.tsx`                                   | Preservar estrutura visual, logos, temas e funcionalidades atuais da Dev                       |
| `Documents.tsx`, `workspace/context.tsx`                                   | Integrar histórico/estado compartilhado sem remover separação demo/API                         |
| `models.ts`, `gateway.ts`, `http/client.ts`                                | Unir contratos; manter validação, cancelamento, timeout, origem e erros da Dev                 |
| `services/index.ts`, `.env.example`, `deploy.sh`                           | Manter modos explícitos; API configurada por ambiente, sem segredos                            |
| Demo, JSON, PDFs, manifesto e simuladores detalhados                       | Preservar os arquivos existentes na Dev                                                        |
| CI, Playwright e testes                                                    | Unir coberturas; não substituir testes demo pelos testes API nem remover o teste de `next dev` |
| Documentação/checkpoints históricos                                        | Manter fatos originais; acrescentar evolução e pendências, sem reescrever evidências antigas   |

**Commit de merge:** `merge(integracao): incorpora Fix preservando UI e modos da Dev`.

**Aceite:** históricos dos dois lados presentes, ancestralidade da Fix comprovada,
sem conflitos pendentes, acervo íntegro e lint/tipos/build/smokes aprovados. Nenhum
commit intermediário inutilizável é publicado na Dev.

### IB-03 — Histórico de envios e consistência do workspace

**Entrega:** consolidar uploads num estado de sessão com identidade/mode como chave.
Restaurar histórico ao abrir Acervo, navegar, recarregar e recuperar foco; preservar
IDs locais/remotos sem duplicar itens ou perder uploads recém-criados.

- Paginar até a última página; detectar repetição de páginas/offset ignorado para
  evitar loop infinito. Não mostrar histórico parcial como completo sem aviso.
- Cancelar consultas antigas no unmount/troca de identidade. Não vazar a fila de um
  sujeito para outro nem misturar itens demo e API.
- Respostas antigas de histórico não podem apagar um envio novo nem desfazer uma decisão.
- Polling limitado aos pendentes, sem chamadas sobrepostas; tratar falha por item,
  429/backoff e cancelamento. Nada de marcar `ready` por temporizador local no modo API.
- Arquivos brutos permanecem em memória somente enquanto necessários; após reload,
  retry que depende do original deve pedir nova seleção, sem inventar o arquivo.

**Commit:** `fix(envios): recupera histórico paginado e mantém fila consistente na navegação`.

**Aceite:** lote persiste após navegação/reload; paginação >100 itens funciona;
identidade isolada; falha de banco não gera “salvo”; respostas fora de ordem não
regridem estado; fila/polling não continuam indevidamente após sair da tela.

### IB-04 — Aprovação e original no design atual

**Entrega:** integrar ações e estados ao Acervo da Dev, usando componentes/tokens
existentes e rótulos coerentes. Mostrar pendência, quem aprova, confirmação, data,
recusa e aprovação dispensada, de acordo com o retorno do serviço.

- Aprovação disponível somente para `canApprove` daquele envio; `curate` global
  não substitui a permissão específica. Backend refaz a autorização.
- Evitar duplo clique/reenvio simultâneo. Confirmar sucesso somente após resposta
  válida. Tratar 403, 404, 409 e 503, atualizando o item quando necessário.
- Não criar fluxo de aprovação em massa ou um painel novo. Expor recusa com motivo
  apenas no mesmo fluxo e conforme o contrato alinhado; nunca decisão fictícia.
- “Salvo no sistema”, “original disponível”, “processamento concluído” e “aprovado”
  são estados diferentes. Exibir ausência de original sem fabricar download.
- Baixar Blob, preservar nome seguro e liberar object URL. Falha não baixa JSON de
  erro como se fosse arquivo. Não persistir conteúdo corporativo na demo/localStorage.

**Commit:** `feat(acervo): integra aprovação e download preservando identidade visual`.

**Aceite:** autorizados aprovam; não autorizados não ganham ação; decisão permanece
no reload; corrida retorna conflito legível; original baixa com identidade correta;
arquivo ausente/negado mostra erro coerente sem fallback público.

### IB-05 — Homologação visual, de contrato e com FastAPI real

**Entrega:** executar as três camadas e guardar evidências separadas:

1. **Local/contrato:** lint, tipos, formatação, unitários, builds demo/API e E2E.
   Importar/adaptar `mock-api.ts` e os casos úteis da Fix sem apagar as suítes da Dev.
2. **Visual:** `next dev` e artefato estático; claro/escuro, desktop, 768/375 px,
   menu recolhido, teclado, contraste e texto ampliado. Comparar com a referência
   da Dev; novos botões cabem no mobile e não ocultam as logos nem o compositor.
3. **Integração real:** frontend API contra FastAPI no SHA/ambiente combinados,
   com dados sintéticos autorizados: enviar PDFs válidos, navegar, recarregar,
   consultar processamento, aprovar com sujeito permitido e baixar original.
   Conferir a persistência no servidor após restart permitido do ambiente de teste.

Cobrir também paginação com página cheia e vazia; decisão concorrente; falha/retorno
tardio; API desligada/401/403/404/409/429/503; ausência de arquivo; refresh durante
upload; saída da página; nenhuma chamada real ao backend no modo demo; nenhum
fallback demo no modo API. Não obter contagem de testes removendo cenários existentes.

**Commit:** `test(integracao): cobre envios persistentes e regressão visual nos dois modos`.

**Aceite:** pipeline verde e evidências de integração real. Se só fixtures passarem,
registrar “contrato validado; integração real pendente” e manter a Fix preservada.
Não iniciar nem parar serviço compartilhado ou alterar banco de terceiros para testar.

### IB-06 — Publicação, rastreabilidade e limpeza final

**Entrega:** integrar na Dev sem sobrescrever trabalho novo de colegas; push normal;
abrir/atualizar PR `Dev → Homolog` com matriz de resolução, SHA do backend, evidências,
limites e efeito sobre a demo na Homolog. Não promover main automaticamente.

O PR #4 atualmente aponta Fix → Homolog. Evitar aplicar uma segunda integração por
esse caminho: verificar seu estado e alinhar seu encerramento/incorporação ao novo
fluxo pela Dev, mantendo commits e referência ao PR original.

Somente depois do aceite funcional, visual e de preservação:

1. Atualizar refs novamente e confirmar que a ponta remota da Fix não recebeu
   novos commits. Se recebeu, integrar/validar o novo trabalho antes de excluir.
2. Comprovar `git merge-base --is-ancestor <Fix-SHA-final> Dev` e preservar o SHA
   em tag/bundle verificados. Confirmar que não há trabalho local exclusivo.
3. Resolver a situação do PR #4 antes de remover sua referência de trabalho;
   não usar fechamento de PR como substituto para integrar o código.
4. Apagar a branch remota `fix/historico-envios-aprovacao` e sua cópia local já
   incorporada, a partir da Dev. Preferir exclusão local protegida por ancestralidade.
5. `chore/remove-codigo-lana` já está ausente no remoto: não recriar; se reaparecer
   ou houver cópia local, conferir ponta/ancestralidade/backup antes de remover.
6. Confirmar no remoto que restam exatamente `Dev`, `Homolog` e `main`.

**Commit documental final:** `docs(integracao): registra aceite referências e recuperação das branches`.
A remoção de referências Git é uma operação separada, não um commit de código.

**Aceite:** Dev publicada, histórico preservado, CI verde, PRs rastreáveis, três
branches remotas e nenhum processo temporário de teste abandonado. Homolog/main
seguem seu processo de revisão; não há deploy AWS implícito.

## 5. Recuperação e limites

- Antes de publicar: abortar merge em conflito e retornar à Dev preservada.
- Depois de publicar: corrigir por novos commits ou reverter o merge identificando
  corretamente o pai da Dev; nunca reset remoto ou force push. Avaliar a reversão
  de contratos separadamente para não perder registros salvos no backend.
- Branch removida pode ser recriada a partir da tag/SHA preservados. Bundle é o
  backup adicional; não depender só do reflog de uma máquina.
- Nenhum dado persistido no backend será excluído como parte da limpeza Git.
- Sem implantação de SSO, migração de banco, reestruturação do backend, novos
  recursos de produto, hospedagem AWS ou mudanças de identidade visual neste escopo.
- A disponibilidade da URL e da versão correta do FastAPI é pré-condição para
  concluir IB-05/IB-06. Não prometer integração funcional só por um merge sem conflitos.

## 6. Acompanhamento

- [ ] IB-00 — Bases, backups e referência visual
- [ ] IB-01 — Contrato com o backend alvo
- [ ] IB-02 — Merge controlado preservando Dev
- [ ] IB-03 — Histórico e consistência dos envios
- [ ] IB-04 — Aprovação e download na UI atual
- [ ] IB-05 — Testes e integração real
- [ ] IB-06 — Push, PRs e limpeza das branches

Cada commit deve descrever problema, entrega, preservação, validação executada,
limites e checkpoint. Nenhum teste planejado deve ser registrado como aprovado.

## 7. Referências da inspeção

- Front: [PR #3 — remoção da demo](https://github.com/jvictorgp19-rgb/hacka-front/pull/3),
  [PR #4 — histórico e aprovação](https://github.com/jvictorgp19-rgb/hacka-front/pull/4).
- [Fix do frontend inspecionada](https://github.com/jvictorgp19-rgb/hacka-front/commit/cac43fe895039fd96dc73f205c6ef9baf68df0f8).
- [Fix correspondente do backend](https://github.com/jvictorgp19-rgb/hacka-back/commit/e777c4fb0deea164ba7cbea226672f24c5acfb38).
- Backend, arquivos lidos por SHA: `app/api/routes/envios.py`, `front.py`,
  `identidade.py`, `app/schemas/api.py`, `app/core/auth.py` e `app/main.py`.
- Front: `git log`, `diff`, ancestral comum e prévia de merge sem modificar o
  working tree; documentos `WORKFLOW.md`, `API-CONTRACT.md` e plano original.
