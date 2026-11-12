# Plano de implementação — repaginação do frontend Raiz IQ

Status: em implementação; acompanhar evidências em `docs/checkpoints/`.
Base: `a9459afaa5826756f1396fd43d9f3add99a39c7a`, branch `Dev`.
Data: 12/11/2026.

## 1. Resultado esperado

Entregar um frontend coeso para o Desafio 2: consultar documentos, entender fontes,
comparar perspectivas e versões, simular decisões e produzir sínteses reutilizáveis.
O mesmo produto deve funcionar em demonstração independente e consumir a API externa
sem exigir a reescrita das telas.

Este plano autoriza a organização do trabalho futuro, não declara funcionalidades
concluídas. A implementação deve preservar e evoluir o webapp atual. Não inicializar
outro projeto sobre a raiz, não descartar o acervo e não reescrever o histórico Git.
A retirada da API local ocorre apenas depois de sua substituição demonstrável.

## 2. Decisões de arquitetura e limites

| Elemento | Decisão |
|---|---|
| Aplicação | Manter Next.js App Router, React e TypeScript existentes. |
| Estilos | Tailwind com tokens semânticos e componentes reutilizáveis. |
| Vite | Não introduzir uma segunda aplicação/build. Vitest pode ser usado para testes sem migrar o produto. |
| Backend | Python/FastAPI, ingestão, RAG/LLM, autorização, auditoria persistente e geração oficial de relatórios pertencem ao outro repositório. |
| Banco | NeonDB acessado exclusivamente pelo backend; nenhuma conexão, chave ou credencial de banco no navegador. |
| Demo | Provider executado no navegador, com fixtures sintéticas verificadas e persistência local identificada. Sem servidor de API simulado no Next. |
| API real | Provider HTTP com o mesmo contrato do provider demo. Erros explícitos, sem fallback silencioso. |
| AWS | Preparar artefato e configuração de frontend; publicação e recursos de infraestrutura ficam fora da execução deste plano. |
| Entrega | Manter somente `Dev`, `Homolog` e `main`; desenvolvimento na `Dev`, promoção por PR. |

**Modos de dados:** propor `NEXT_PUBLIC_DATA_MODE=demo|api` e `NEXT_PUBLIC_API_URL`.
São parâmetros públicos, definidos por ambiente/build; nenhuma chave secreta usa
`NEXT_PUBLIC_*`. O modo demo deve ser identificável em todas as telas. No modo API,
indisponibilidade, 401/403 e respostas inválidas nunca viram sucesso de demonstração.
Uma oferta de abrir a demo deve exigir uma ação explícita, limpar o contexto anterior
e informar a troca de ambiente. Não é necessário implementar troca em tempo real no MVP.

**Fronteira de regras:** calculadoras locais existentes continuam como simulações
explicáveis da interface. Extraí-las em funções puras, com entradas, fontes e limites
claros. Elas não concedem acesso nem aprovam operações. O backend será a autoridade
para decisões oficiais; os exemplos do frontend servirão como casos de contrato
para evitar divergência futura entre as duas implementações.

**Next:** não substituir React/Tailwind/Next indiscriminadamente. Primeiro instalar
o ambiente compatível com o lockfile, ler os guias locais em
`node_modules/next/dist/docs/` conforme `AGENTS.md`, validar a configuração e só mudar
o que for necessário. Esse diretório e o executável Node não estão disponíveis no
ambiente da elaboração deste plano.

## 3. Direção de produto e referências

### Navegação e composição

- **Conversas:** área principal inspirada na organização do ChatGPT; nova consulta,
  histórico, campo de pergunta fixo ao fim da área e respostas com ações contextuais.
- **Acervo:** lista pesquisável, envio de documentos, temas, versões e painel de detalhes.
- **Análises:** perspectivas, visualizações e resultados salvos, sem repetir o chat.
- **Prazos:** lista e calendário dos mesmos eventos, vinculados às fontes.
- **Resumos:** seleção de evidências, composição executiva e versões salvas.
- **Administração do acervo:** acesso, curadoria e inconsistências, visível como fluxo
  específico; não ocupar a página inicial com termos de arquitetura.
- **Simuladores:** ferramentas acessíveis a partir de respostas e análises; manter
  também uma entrada direta. O roteiro de apresentação fica no menu de ajuda/demo.

Usar sidebar recolhível com ícone e rótulo; em modo compacto, tooltip e nome acessível.
Conteúdo principal com largura de leitura e painel de fontes à direita no desktop.
Em telas pequenas, navegação e fontes abrem em painéis que não cobrem permanentemente
o compositor. Rotas fixas sugeridas: `/`, `/acervo`, `/analises`, `/prazos`,
`/resumos`, `/simuladores`, `/administracao`. IDs em query string inicialmente,
para evitar dependência desnecessária de rotas dinâmicas na exportação estática.

### Uso das imagens fornecidas

| Referência | Aplicação no produto |
|---|---|
| Imagens 1–4, identidade HACKA/TS | Referência do evento e créditos discretos; não misturar sua identidade inteira com a marca principal do produto. |
| Imagem 5, sidebar escura | Hierarquia, recolhimento e alinhamento dos ícones. Evitar brilho decorativo e efeitos que reduzam a legibilidade. |
| Imagem 6, timeline vertical | Marcos cronológicos com detalhes expansíveis, responsável, estado e fonte. |
| Imagem 7, calendário | Prazos com indicadores semânticos e acesso ao detalhe. Não usar marcas de serviços de assinatura como ícones de processo. |
| Imagem 8, abas | Controles segmentados para perspectivas e visões; estados ativo/foco consistentes. |
| Imagens 9–15, telas do projeto | Preservar cenários e dados úteis; reduzir cabeçalhos grandes, siglas de navegação, duplicação de chats e cartões excessivamente densos. |
| Arquivos sem extensão, manual BBTS | Aplicação de marca, proporção e paleta; não distorcer ou redesenhar logotipos. |
| Arquivos abstratos azuis | Uso opcional e discreto em apresentação/onboarding; não como fundo das áreas de leitura. |

No manual fornecido, as cores são **azul `#465EFF` e amarelo `#FCFC30`**. Usar como
tokens de marca; superfícies e textos precisam de tokens próprios com contraste
verificado. O azul/rosa HACKA/TS é identidade do evento, não uma segunda paleta
principal. Tema claro inicial, tema escuro e preferência persistida fazem parte da
base visual; alto contraste deve ser testado, não apenas receber um botão.

Manter **Lucide** como família única: `MessageSquare`, `Files`, `ChartNoAxesCombined`,
`CalendarDays`, `FileText`, `Calculator`, `ShieldCheck`, `History`, `Search`,
`Upload`, `PanelLeft` e `ExternalLink`, verificando os nomes na versão instalada.
Preferir traço uniforme, 18–20 px na navegação e 16 px nas ações. Sem emojis como
ícones estruturais. Estados sempre combinam texto/ícone/cor.

As capturas do manual são referências, não arquivos finais de logotipo. Usar assets
limpos existentes/fornecidos; até isso, o nome textual do produto é suficiente.

### Bibliotecas

Reutilizar dependências atuais. Candidatas a adicionar por necessidade comprovada:
Vitest + Testing Library para regras/estados, Playwright para jornadas completas e
primitivas acessíveis de UI para dialogs/menus. Escolher uma solução por problema,
verificar compatibilidade com as versões instaladas e registrar a justificativa no
commit. Não instalar dois kits visuais ou dois gerenciadores de estado.
Gráficos simples podem continuar em componentes próprios com tabela acessível;
biblioteca de gráficos só entra quando resolver uma visualização concreta.
MSW é opcional para testes do provider HTTP, não obrigatório para executar a demo.

## 4. Organização alvo

```text
src/
  app/                    # rotas e composição; sem endpoints de negócio
  components/ui/          # botões, campos, dialogs, tabs, estados e fontes visuais
  components/layout/      # sidebar, cabeçalho, compositor e painel contextual
  features/
    conversations/
    documents/
    analyses/
    deadlines/
    reports/
    simulators/
    governance/
  contracts/              # modelos de transporte e validação de respostas
  services/
    gateway.ts            # interface consumida pelas features
    http/                 # cliente da API externa
    demo/                 # provider, fixtures e armazenamento local sintético
  lib/                    # utilitários compartilhados pequenos
tests/                    # contratos, regras críticas e jornadas
docs/                     # decisões, contrato proposto e evidências de checkpoints
public/docs_acervo/       # PDFs sintéticos demonstrativos já existentes
```

Criar pastas quando receberem implementação real. Evitar repositório de pastas vazias.
Não manter duas cópias de uma regra no provider e no componente. O acervo original
continua preservado; qualquer deduplicação futura de PDFs precisa comprovar hashes,
referências e recuperabilidade antes de remover cópias.

## 5. Contrato mínimo a preparar

Os nomes abaixo são **propostas para alinhamento com o backend**, não endpoints já
existentes ou contratos aprovados. Não considerar os `/docs`, `/access`, `/reports`
e `/ingest` atuais automaticamente corretos; `/docs` pode ser reservado à documentação
do FastAPI, e auditoria não é o mesmo recurso que ingestão.

| Recurso | Capacidades esperadas |
|---|---|
| Conversas/mensagens | Listar, abrir, criar consulta, cancelar espera e receber resultado/abstenção/conflito/necessidade de acesso. |
| Documentos/versões | Listar, filtrar, detalhar e obter referência autorizada para visualização da fonte. |
| Envios/processamentos | Enviar arquivos, consultar estado do lote e distinguir sucesso/erro por arquivo. |
| Análises | Consultar perspectivas, salvar resultado e recuperar resultados semelhantes com justificativa. |
| Prazos | Listar eventos com datas normalizadas, responsável, criticidade e fonte. |
| Resumos | Compor a partir de evidências selecionadas, salvar e solicitar exportação quando disponível. |
| Feedback | Registrar útil/não útil e motivo, associado à mensagem/análise correta. |
| Acesso/curadoria | Solicitar com justificativa, acompanhar e apresentar decisões/respostas curadas. |

Campos fundamentais:

- `Citation`: identidade estável de documento/versão, código, título, versão, item,
  trecho textual verificado, página quando conhecida, vigência e referência de abertura.
  Página desconhecida é ausente; nunca inventada. Link para PDF sem realce precisa
  dizer isso. Fonte indisponível/restrita não recebe URL pública de fallback.
- `Answer`: estado `answered|abstained|conflict|access_required`, texto curto,
  evidências, citações e próximos passos; origem `demo|api` separada da classificação
  de confiança/evidência. Não usar uma porcentagem de confiança fictícia.
- `AnalysisContext`: tema, área, perfil, intervalo e perspectiva; filtros sem
  correspondência produzem estado vazio, não outro resumo arbitrário.
- `DocumentVersion`: fase, vigência, substituições, camada, dono e disponibilidade
  do arquivo; classificação é informação recebida, nunca permissão concedida pelo cliente.
- `ProcessingJob`: lote, arquivos, estado individual, erro recuperável e data;
  o frontend não calcula progresso de processamento real por temporizador.
- `SavedAnalysis`/`Report`: seleção de evidências, filtros, fontes, versão e data.
- `ApiError`: código, mensagem segura, possibilidade de tentar novamente e ID de
  rastreamento quando fornecido. Datas ISO e valores monetários com representação
  definida; formatação pt-BR só na apresentação.

Paginação, limites, validação de arquivos, autenticação, expiração de acesso,
semântica de cancelamento e formatos de exportação devem constar do documento de
contrato. Não adicionar geração de cliente OpenAPI antes de existir uma especificação
estável; quando houver, gerar os tipos de transporte sem duplicá-los manualmente.

## 6. Regras dos checkpoints e commits

Cada checkpoint tem uma entrega demonstrável e deve deixar a `Dev` utilizável.
Pode conter mais de um commit; a sequência abaixo já define os limites de cada um.
Não juntar limpeza estrutural e redesenho total no mesmo commit.

Para cada commit, usar título e corpo com:

```text
<tipo>(<escopo>): <resultado concreto>

Problema: <comportamento anterior e motivo da mudança>
Entrega: <alterações e comportamento resultante>
Preservação: <fluxos/fontes mantidos e eventual migração local>
Validação: <comandos e jornadas realmente executados, com resultado>
Limites: <simulações, dependências e itens ainda pendentes>
Checkpoint: CP-XX | requisitos R1, R2...
```

Não registrar teste não executado como aprovado. Após a implementação de cada
checkpoint, preencher `docs/checkpoints/CP-XX.md` com SHAs, evidências e limitações.
Recuperação por `git revert` dos commits do checkpoint em ordem inversa, preservando
histórico; para merges, identificar corretamente o pai principal. Nenhum force push.
Persistência demo deve ter versão de schema e reset explícito para sobreviver a
mudanças ou permitir retorno sem corromper dados locais.

### CP-00 — Preservação e linha de base

Dependência: nenhuma. Requisitos: todos, como proteção contra regressão.

**Entrega:** inventariar rotas, componentes, cálculos, dados, PDFs e oito cenários de
apresentação. Registrar hashes do acervo e ponto Git anterior à repaginação. Manter
tags/bundle já existentes; confirmar recuperabilidade. Corrigir a contagem: 13 PDFs
físicos únicos e 14 registros de versões no JSON; `RG_1100 v1.0.0` não tem arquivo.
Não fabricar esse PDF nem apagar seus metadados históricos.

**Commits planejados:**

1. `docs(baseline): registra inventário e preservação antes da repaginação`
   — corpo: mapa das jornadas, referências do acervo, hashes, fontes ausentes e
   procedimentos de retorno; diferenciar arquivos físicos de versões cadastradas.

**Aceite:** inventário reproduzível; oito cenários localizados; todos os documentos
atuais recuperáveis; divergências documentadas antes de qualquer remoção de código.

### CP-01 — Ambiente e validação mínima

Dependência: CP-00. Requisitos: sustentação técnica.

**Entrega:** disponibilizar Node/npm compatíveis com o projeto e CI, instalar pelo
lockfile e ler os guias Next locais. Resolver os erros de hooks em
`CopilotSidebar.tsx` e `GovernanceDifferentialsPanel.tsx` sem desativar a regra.
Remover imports mortos e verificar `next.config.ts` contra os guias instalados.
Adicionar checagem de tipos explícita e base dos testes necessários à migração.

**Commits planejados:**

1. `fix(frontend): corrige sincronização de estado e restabelece lint e build`
   — corpo: causas das duas falhas de lint, refatoração aplicada, avisos removidos
   e validação efetivamente executada; mudanças de configuração justificadas.
2. `test(frontend): adiciona verificações de tipos e jornadas críticas da base`
   — corpo: ferramentas escolhidas e casos de regressão sobre cálculos e navegação,
   sem testes que apenas repitam o JSX; atualizar CI e instruções do ambiente.

**Aceite:** `npm ci`, lint, tipos e build aprovados; fluxo atual aberto no navegador;
eventuais novas falhas tratadas antes de avançar. Isso ainda não comprova exportação
estática, que será verificada após retirar a API local.

### CP-02 — Contratos e camada de serviços

Dependência: CP-01. Requisitos: integração transversal.

**Entrega:** definir `AppGateway`, DTOs e erros com base na seção 5. Criar provider
HTTP com timeout, cancelamento, validação e configuração explícita. Preparar provider
demo com o mesmo contrato. As telas não importam `fetch`, fixtures ou tipos de rotas
do Next diretamente. Nesta transição, a implementação antiga pode continuar isolada
até o CP-03; não retirar a rota antes de validar o substituto.

**Commits planejados:**

1. `refactor(services): define gateway e modelos para desacoplar telas dos dados`
   — corpo: capacidades, citações, estados, contratos ainda propostos e plano de migração.
2. `feat(api-client): prepara consumo explícito da API externa com erros tipados`
   — corpo: ambientes demo/API, timeout/cancelamento, validação e comportamento de erro;
   atualizar `.env.example` sem incluir segredos.

**Aceite:** uma feature consome o gateway; provider falso de teste cobre resposta
válida/inválida, timeout e acesso negado. Modo API nunca muda para demo por conta própria.

### CP-03 — Demo independente e retirada do backend local

Dependência: CP-02. Requisitos: preservação das jornadas e separação front/back.

**Entrega:** mover os cenários programados da rota para fixtures e ações do provider
demo no navegador. Reutilizar funções puras de simulação; perguntas fora do conjunto
suportado recebem limitação/abstenção explícita. Persistir somente dados sintéticos
da demo, com versão, contexto de persona e reset. Migrar **todos** os consumidores
de `src/lib/api.ts` antes de remover a implementação misturada.

Retirar valores fictícios de custo, latência e placar 30/30, ou marcá-los como exemplos
quando houver motivo para mantê-los. Remover mensagens de envio real em ações locais.
Não manter motor de RAG, extração, autorização ou banco no frontend.

**Commits planejados:**

1. `feat(demo): preserva jornadas em provider local com origem e limites visíveis`
   — corpo: cenários transferidos, ausência de LLM, armazenamento/reset e abstenção
   para consultas não suportadas; comprovar equivalência das jornadas existentes.
2. `refactor(frontend): remove API de chat local após migrar seus consumidores`
   — corpo: remoção de `src/app/api/chat/route.ts`, substituição de `fetchWithFallback`
   e do módulo misto `src/lib/api.ts`; mapa antigo→novo e dependências retiradas.

**Aceite:** aplicação demonstra oito jornadas sem FastAPI e sem POST para `/api/chat`;
nenhuma rota de negócio/Server Action equivalente recriada; modo API indisponível
mostra erro; demo não depende de um backend de mocks. Build e ensaio de exportação
estática verificam possíveis incompatibilidades de configuração antes de escolher AWS.
Executar teste de rede com serviço HTTP externo desligado e testar reset da demo.

### CP-04 — Sistema visual e estrutura de navegação

Dependência: CP-03. Requisitos: coesão de todas as telas.

**Entrega:** tokens, temas, tipografia, espaçamentos, foco, botões, inputs, tabs,
dialogs, badges e estados de carregamento/erro/vazio. Sidebar recolhível, conversa
central e painel contextual de fontes. Quebrar `page.tsx` por feature, mantendo
acessíveis as jornadas existentes durante a migração para as rotas propostas.
Substituir nomenclatura técnica da página inicial por tarefas compreensíveis.

**Commits planejados:**

1. `feat(ui): unifica tokens de marca temas componentes e iconografia`
   — corpo: relação com referências BBTS/HACKA/TS, contraste, tema persistido e família de ícones.
2. `refactor(workspace): organiza rotas sidebar e painel contextual das jornadas`
   — corpo: decomposição de `page.tsx`, destino de cada tela antiga e navegação por teclado/mobile.

**Aceite:** leitura e navegação verificadas a 375, 768 e 1440 px, zoom de 200%,
teclado, foco de dialogs, redução de movimento e ambos os temas. Sidebar compacta
continua compreensível; não há dois chats independentes disputando a mesma consulta.

### CP-05 — Acervo e envio de documentos

Dependência: CP-04. Requisito R1; base para R2 e R7.

**Entrega:** catálogo com busca e filtros de tema/área/fase, detalhes e versões.
Upload individual/em lote com validação de formato/tamanho, itens duplicados e
estado por arquivo. No modo demo, simular explicitamente o ciclo de processamento;
um PDF novo não entra automaticamente como fonte compreendida. Até existir ingestão
real, dizer que seu conteúdo ainda não foi extraído e não gerar respostas sobre ele.
Usar fixture conhecida para demonstrar processamento completo sem fazer OCR/RAG local.

**Commits planejados:**

1. `feat(acervo): organiza catálogo versões e disponibilidade das fontes`
   — corpo: inventário real, pesquisa/filtros, metadados e documento sem arquivo.
2. `feat(upload): implementa fila de arquivos e estados de processamento por modo`
   — corpo: validações, lote parcial, retry, ciclo simulado e integração HTTP proposta.

**Aceite:** um arquivo inválido não bloqueia os válidos; lote mostra falha parcial;
documento novo não é marcado falsamente como indexado; original e metadados preservados.
Modo API utiliza o resultado do serviço, não temporizadores como prova de processamento.

### CP-06 — Conversas, citações e abstenção

Dependência: CP-05. Requisito R2 e parte de R7.

**Entrega:** conversa única, perguntas e contexto preservados, respostas curtas com
expansão e ações. Cada afirmação sustentada aponta para citação com código, versão,
item, trecho e página quando verificada. Painel abre a fonte correspondente; PDF
ausente e passagem sem realce têm estados honestos. Renderizar conteúdo da API
como dados, sem executar HTML arbitrário. Diferenciar ausência de evidência, conflito,
acesso necessário e falha de rede. Cancelar espera e reenviar sem duplicar mensagens.

**Commits planejados:**

1. `feat(conversas): unifica compositor mensagens contexto e estados de consulta`
   — corpo: fluxo atual migrado, cancelamento, retry e origem visível.
2. `feat(fontes): vincula respostas a trechos verificáveis e explicita abstenções`
   — corpo: esquema de citação, painel de fontes, arquivos ausentes e consultas fora da demo.

**Aceite:** perguntas do roteiro têm fontes verificadas; pergunta não suportada não
recebe resumo genérico como resposta; clique abre documento/versão corretos;
casos sem arquivo não inventam URL ou página. Testar múltiplas mensagens e retry.

### CP-07 — Perspectivas, visualizações e conflitos

Dependência: CP-06. Requisitos R3, R4, R5 e R7.

**Entrega:** seleção explícita de riscos, prazos, obrigações e valores sobre o mesmo
conjunto de evidências, combinada com tema, área e intervalo. Guardar filtros na URL
quando apropriado para permitir retorno. Visualizações com fontes em cada elemento,
alternativa textual/tabela e estados vazios. Comparação de versões e conflitos em
contexto, indicando divergência e regra aplicada sem apagar a outra evidência.

**Commits planejados:**

1. `feat(analises): conecta perspectivas e filtros ao mesmo conjunto de evidências`
   — corpo: modelo de filtros, transformação dos dados e resultados vazios.
2. `feat(visuais): conecta gráficos fluxos e comparativos às respectivas fontes`
   — corpo: rastreabilidade por elemento, acessibilidade e exposição de conflitos.

**Aceite:** trocar perspectiva muda o destaque mantendo a seleção documental;
área/tema/período combinam corretamente; cada nó/barra/marco tem citação acessível;
fonte ausente permanece identificada. Não anunciar renderização Mermaid automática:
o componente atual é um fluxo React; só mudar sua tecnologia se houver necessidade.

### CP-08 — Simuladores e radar de prazos

Dependência: CP-07. Requisitos R3, R4 e R5; preservação dos cálculos.

**Entrega:** conectar simuladores a respostas/análises e eliminar entradas padrão
escondidas. Corrigir aproximações de datas e validar entradas. Definir calendário
e intervalo coberto; não declarar precisão universal com apenas 1º de maio.
Se faltar calendário adequado, mostrar a limitação e exigir validação para a decisão.
Prazos em lista/calendário compartilham dados, filtros, responsáveis e fontes.
Referência temporal da demo explícita e resetável, sem chamar datas fixas de “esta semana”.

**Commits planejados:**

1. `refactor(simuladores): isola cálculos e explicita premissas calendário e fontes`
   — corpo: fórmulas preservadas, correções de dias úteis e limites de validade.
2. `feat(prazos): integra radar calendário e ações às análises e fontes`
   — corpo: modelo de eventos, filtros e distinção de prazos vencidos/futuros.

**Aceite:** verificar 9 pessoas→2; limites de faltas; R$ 18.000,00/18.000,01 e
R$ 120.000,00/120.000,01; rescisão nos dias 90/91; datas D-n conhecidas;
feriado/fim de semana e entrada inválida. Regras têm gabarito do acervo, não apenas
expectativa copiada da implementação. Calendário e lista mostram os mesmos eventos.

### CP-09 — Resumo executivo a partir da seleção

Dependência: CP-08. Requisito R6.

**Entrega:** selecionar evidências de chat/análise, montar resumo com decisões,
riscos, prazos e fontes, editar título e salvar versão. Na demo, composição local
determinística a partir do que foi selecionado; não apresentar geração por IA.
Substituir os slides fixos de `GovernanceDifferentialsPanel` por esse fluxo.
Exportação mínima: visualização de impressão e download de arquivo textual com fontes.
Isso atende a resumo sem depender de geração de `.pptx`.

**Commits planejados:**

1. `feat(resumos): compõe síntese executiva a partir de evidências selecionadas`
   — corpo: seleção explícita, ordenação, versões e citações herdadas.
2. `feat(exportacao): oferece resumo portátil e prepara geração externa de apresentação`
   — corpo: formatos realmente disponíveis, download/print e estado de exportação
   externa indisponível; retirar `apiGenerateReport` antigo sem consumidor.

**Aceite:** duas seleções diferentes produzem dois resumos diferentes; retirar uma
evidência retira seu conteúdo/citação; documento ausente não ganha trecho inventado;
exportação mantém fontes. `.pptx` real permanece capacidade futura do backend.

### CP-10 — Histórico, reaproveitamento e avaliação

Dependência: CP-09. Requisito R8.

**Entrega:** histórico pesquisável, análises salvas e reabertura com contexto e fontes.
Semelhantes por tema/fontes/termos na demo, com critério explicado; não chamar de
busca semântica quando não houver embeddings. Avaliação útil/não útil com motivo,
estado de envio e possibilidade de corrigir escolha. Persistência local da demo
separada de dados do modo API e segregada pelo contexto demonstrado.

**Commits planejados:**

1. `feat(historico): salva análises e sugere resultados anteriores relacionados`
   — corpo: armazenamento versionado, recuperação de filtros e critério de similaridade.
2. `feat(feedback): registra avaliação por resposta com estado e motivo`
   — corpo: vínculo ao ID correto, persistência local ou confirmação da API e retry.

**Aceite:** recarregar restaura análise demo; abrir semelhante restaura o contexto;
feedback não altera outra resposta; API com erro não mostra “enviado”; reset limpa
somente o ambiente demonstrativo. Não persistir tokens ou dados reais sensíveis na demo.

### CP-11 — Curadoria e pedidos de acesso coerentes

Dependência: CP-10. Requisito R7 e diferencial da proposta.

**Entrega:** justificativa obrigatória, pedido rastreável, pendência, resposta curada,
negativa justificada e estado de concessão quando suportado. Na demo, “registro local
de demonstração”; no modo API, somente mostrar sucesso depois de confirmação externa.
Remover “auditoria imutável” de estado React. Seletor de persona é ferramenta de
apresentação, não autenticação. No modo API, identidade/capacidades vêm do backend.

**Commits planejados:**

1. `feat(curadoria): estrutura solicitação decisão e resposta curada por modo`
   — corpo: estados, justificativas, IDs e ausência de segurança simulada em produção.
2. `refactor(governanca): separa pendências úteis de explicações técnicas do pitch`
   — corpo: dados de auditoria recebidos versus fixtures, destino de Medalhão/FinOps,
   remoção de alegações sem medição e de botões de envio fictício de e-mail.

**Aceite:** reload mantém o fluxo demo; acesso negado não expõe o PDF nem o trecho
restrito; troca de persona API não concede permissão; nada é classificado como
imutável sem respaldo do serviço. PDFs em `public` são exclusivamente sintéticos
de demonstração: documentos corporativos protegidos chegam por referência autorizada.

### CP-12 — Homologação, integração preparada e pacote AWS

Dependência: CP-11. Requisitos R1–R8.

**Entrega:** consolidar contratos e exemplos para o outro repositório, revisar README,
documentar modos/limites e validar as oito jornadas. Consumir serviço de teste aderente
ao contrato para provar o provider HTTP, sem criar um backend de produto aqui.
Se o backend real ainda não existir, registrar integração real como pendente.

Alvo inicial de hospedagem: frontend exportável, se compatível com os guias instalados
e com a configuração após CP-03. Validar exportação e acesso direto às rotas antes
de indicar S3/CloudFront. Se houver necessidade demonstrada de runtime Next, documentar
a decisão de hospedagem AWS correspondente sem recolocar endpoints de negócio.
Build de demo e build API têm configuração explícita; autenticação/CORS/CSRF e
URLs autorizadas exigem contrato com o backend. Nenhuma infraestrutura é criada aqui.

**Commits planejados:**

1. `test(homologacao): valida oito requisitos nos modos demo e contrato HTTP`
   — corpo: jornadas cobertas, falhas de rede/acesso, navegadores, telas e resultados reais.
2. `docs(integracao): entrega contratos e limites para conexão com o backend externo`
   — corpo: DTOs, erros, identidade, uploads, fontes, exemplos e pendências de alinhamento.
3. `build(aws): prepara artefato de frontend e documenta configuração por ambiente`
   — corpo: formato de saída comprovado, rotas/paths de assets, variáveis de build,
   smoke test do artefato e procedimento de publicação futura, sem deploy implícito.

**Aceite:** pipeline verde; oito requisitos demonstráveis; teclado/contraste/mobile
verificados; modo demo sem dependência da API; modo API sem dados de demo como fallback;
nenhum segredo/banco/endpoint de negócio no bundle/repositório; acervo preservado;
aplicação servida a partir do artefato final e rotas recarregáveis.

## 7. Matriz de conclusão e ordem

| Requisito | Checkpoints responsáveis | Evidência para considerar frontend concluído |
|---|---|---|
| R1 — Base/processamento | 05, 12 | Seleção individual/lote, fila/erros e consulta por tema; processamento demo identificado e integração preparada. |
| R2 — Perguntas/fontes | 06, 12 | Mensagem→trecho→documento/versão; abstenção e fonte indisponível corretas. |
| R3 — Síntese/destaques | 07, 08 | Mesmas evidências com visões de risco, prazo, obrigação e valor. |
| R4 — Visuais | 07, 08 | Elementos interativos com fontes e alternativa textual. |
| R5 — Perspectivas | 07, 08 | Área/tema/período combináveis e estados vazios coerentes. |
| R6 — Resumo executivo | 09 | Síntese muda conforme seleção e mantém referências na exportação. |
| R7 — Vigência/conflito | 05–07, 11 | Versões, camadas e divergências explícitas; curadoria sem alegar segurança local. |
| R8 — Reaproveitamento | 10 | Análises anteriores relacionadas e avaliação persistida por resposta. |

Ordem obrigatória: **00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12**.
Um checkpoint começa quando o anterior tem evidência de aceite. Preparação de
contratos pode antecipar conversas com o outro repositório sem bloquear a demo.

## 8. Controle de escopo e promoção

**Incluído:** repaginação e limpeza, demo local transparente, interfaces de integração,
oito requisitos de frontend, simuladores existentes e curadoria demonstrável.

**Fora desta execução:** ingestão/OCR/RAG real, treinamento/embeddings, NeonDB,
backend FastAPI, SSO completo, envio real de e-mail, previsão por ML, conectores
corporativos, geração oficial de PPT e criação/publicação de infraestrutura AWS.
Esses itens devem aparecer como indisponíveis/planejados quando relevantes, sem
virar botões de sucesso fictício. Dados sintéticos continuam suficientes para a demo.

Promover checkpoints na `Dev` em commits rastreáveis; abrir `Dev → Homolog` para
marcos demonstráveis (sugestão: CP-03, CP-07, CP-10 e CP-12) com CI e evidências.
Promover `Homolog → main` quando os critérios da entrega correspondente estiverem
aprovados. Preservar commits de implementação; não criar branches permanentes extras.
Cada checkpoint é um ponto verificável de continuidade, sem necessidade de pedir
nova permissão para tarefas rotineiras já autorizadas dentro do escopo.

## 9. Acompanhamento

- [x] CP-00 — Preservação e linha de base
- [x] CP-01 — Ambiente e validação mínima
- [x] CP-02 — Contratos e camada de serviços
- [x] CP-03 — Demo independente e retirada do backend local
- [x] CP-04 — Sistema visual e estrutura de navegação
- [x] CP-05 — Acervo e envio de documentos
- [x] CP-06 — Conversas, citações e abstenção
- [x] CP-07 — Perspectivas, visualizações e conflitos
- [x] CP-08 — Simuladores e radar
- [x] CP-09 — Resumo executivo por seleção
- [ ] CP-10 — Histórico, reaproveitamento e avaliação
- [ ] CP-11 — Curadoria e pedidos de acesso
- [ ] CP-12 — Homologação e pacote de frontend para AWS

## 10. Fontes de planejamento

- [Proposta do projeto](PROPOSTA.md), [workflow](WORKFLOW.md) e [preservação anterior](REORGANIZACAO.md).
- Imagem dos oito requisitos do Desafio 2 e referências visuais enviadas nesta conversa.
- Arquivos de referência inspecionados em `/home/sertoriel/Downloads/Refs/`:
  `0d4539c4f24ef374d6f92b5cfe01ec5ac1eda414`, `4d1623db72436124d04d1c6e42f465e1d1e0a29c`,
  `19ceb256122e2ea8ac404dbb1d66c310496cc205`, `43bcbd536d4653aa5c5b54462d94542a9a1177b7`,
  `50c5607aa4b2cd5c3b1a5ecaf24f01f8877bfff3`, `68280195840b3945840e2bf51207082ce4742392`,
  `ab5768b2c0bd41dffce3285af8658f4bd57f2b42`, `b6b1390ce4bfcca79096f4b98b5faaa7dd49f795`,
  `d633dee1803734a46608a1f26a63fbad868957c3`, `eea4f0640ee49e6ea8ec35d66a1d7ae0c8652fb2`.
  São referências locais, não dependências do build. Registrar assets efetivamente
  adotados e sua procedência ao implementar CP-04.
- [Next: aplicações SPA e exportação opcional](https://nextjs.org/docs/app/guides/single-page-applications).
- [Next: fronteira BFF e limitações do modo export](https://nextjs.org/docs/app/guides/backend-for-frontend).
- [Next: ferramentas de testes](https://nextjs.org/docs/app/guides/testing).
- [MSW: integração no navegador](https://mswjs.io/guides/integrations/browser), apenas se necessário aos testes.

Os guias públicos apoiam o planejamento; os guias da versão instalada e o build
devem decidir a implementação conforme `AGENTS.md`.
