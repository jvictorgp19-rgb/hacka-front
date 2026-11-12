# Iteração 3 — Proposta de Solução e Modelo de Negócio

**Desafio 2 — Plataforma de Inteligência Empresarial** · Equipe **Ctrl + Alt + Business**
Nome de trabalho: **Zero Click** (ver nota sobre o nome na seção 11)

> Esta iteração parte da Iteração 1 (IA generativa + preditiva, co‑piloto executivo, monitoramento),
> das ideias da equipe (sigilo, data mesh, medalhão, agentes por e‑mail, controle de acesso hierárquico)
> e da leitura completa do acervo sintético da ACME (14 documentos de Férias, Inovação e Locação).

---

## 1. O que o acervo nos ensinou (e o que a banca provavelmente vai testar)

O acervo não foi feito para ser "pesquisado". Ele foi feito para **pegar soluções ingênuas de RAG**. Pontos-chave:

| # | Característica do acervo | Exemplo concreto | Implicação para a solução |
|---|---|---|---|
| 1 | **Versões substituídas convivem com as vigentes** | NG_111 v2.0.0 exige **30 dias** de antecedência; a v3.0.0 vigente exige **45**. RG_1100 v1 permitia 3 ideias; a v2 permite 2. | Responder **sempre com a versão vigente** e avisar quando a pergunta se baseia em regra antiga ("isso mudou em 03/08/2026"). |
| 2 | **Data de vigência não é suficiente** | NG_111 v2 tem vigência "até 10/06/2027", mas está com **Fase: Versão anterior** desde a v3. | O status vem do campo **Fase** e da relação *substitui*, não só das datas. |
| 3 | **Hierarquia documental** | "Em divergência, prevalece a NG_111" (PX_1111-001, 2.2). O catálogo também diz que o documento oficial prevalece sobre ele. | Ranqueamento e resolução de conflitos por tipo: NG > PX/GU > FM/TB/FL; o catálogo é só auxiliar. |
| 4 | **Documentos citados que não estão no acervo** | NG_010 e NG_012 (alçadas) são citadas, mas não estão disponíveis. | **Abster-se com honestidade**: "a NG_012 não está no acervo; a NT_2026-018 cita estas faixas…". |
| 5 | **Lacunas explícitas** | NT_2026-021 5.4 (empregado afastado → "consultar o NIN"); RG_1100 não define a divisão do prêmio de equipe. | Resposta "**não consta nas fontes**" + botão **"Perguntar ao dono do assunto"** (NIN). |
| 6 | **Regras com cálculo** | D‑45/D‑35/D‑30/D‑3 com antecipação para dia útil; 30% da equipe arredondado para baixo; faltas → dias (TB_1111-001); alçadas R$ 18.000,00 vs R$ 18.000,01; multas do contrato. | **Calculadoras determinísticas** (código, não LLM) para datas, limites e alçadas. LLM erra conta; código não. |
| 7 | **Metadados ricos no cabeçalho** | Tipo, código, versão, **Fase**, vigência, **Elaborado por (dono)**, Aprovado por, **Vinculado a**, classificação **#interna**. | Esses metadados viram **governança** (dono = domínio do data mesh) e o **grafo do acervo**. |
| 8 | **Prazos que geram ação** | Prorrogação do CTR_2026-012 até **30/03/2027**; vistoria até 25/11/2026; alerta de férias a vencer 120/90 dias; NG/PX valem 18 meses; CT no máximo 150 dias. | O "monitoramento preditivo" vira um **Radar de prazos e conformidade**, que é viável, explicável e de alto valor. |
| 9 | **Dados pessoais e classificação** | CTR cláusula 18 (LGPD: eliminação em 90 dias, incidente em 48 h); NT_2026-018 seção 6 "Uso interno". | A classificação é um atributo de primeira classe e a LGPD aparece no desenho. |
| 10 | **Pequenas inconsistências temporais** | NG_1130 (06/07/2026) já cita a NT_2026-021 (14/10/2026); a NT (16/10) cita o RG_1100 v2 (aprovado em 20/10). | Diferencial: **Auditor do acervo**, que aponta referências cruzadas incoerentes para o dono corrigir. |
| 11 | **Os documentos já têm "Jornadas" e "Lista de verificação por perfil"** | Anexos G/L: checklists por empregado, gestor, diretor, GGC, GFI. | Conteúdo pronto para a visão **por perfil** (personas), com legal design nativo. |

**Tese:** confiabilidade aqui não vem de "um LLM melhor". Vem de **metadados + regras + cálculo + citação + abstenção**. É isso que vamos demonstrar.

---

## 2. Problema reformulado

> Na ACME, ninguém quer ler a NG_111. As pessoas querem saber **"até quando eu peço?"**, **"quem aprova?"**, **"o que vence este mês?"**
> E querem uma resposta **certa, com fonte, no nível de acesso delas**.

Dores por público:
- **Empregado**: regras longas, versões confusas, medo de perder prazo.
- **Gestor**: decisões com prazo (7 dias), limite de 30%, substituto, sem visão consolidada.
- **Áreas donas (GGC, NIN, GCO)**: respondem a mesma dúvida centenas de vezes; não sabem o que as pessoas não entendem.
- **Executivo (DIRAF/DIRTEC)**: precisa de síntese (orçamento, alçadas, contratos, riscos de prazo) em formato de apresentação.

---

## 3. Personas e jornadas

| Persona | Pergunta típica | Momento "uau" |
|---|---|---|
| **Ana**, analista (empregada) | "Quero férias a partir de 05/05/2027. Até quando peço?" | Uma **linha do tempo** interativa: solicitar até 21/03, aviso até 31/03, assinar até 05/04, pagamento em **30/04** (D‑3 cai num domingo e é antecipado), com cada marco linkado ao item da NG_111. |
| **Carlos**, gestor (equipe de 9) | "Quantos podem sair juntos? Tenho pendências vencendo?" | "Máximo **2** (30% de 9 = 2,7, arredondado para baixo, NG_111 4.6.3)" + fila de pendências com contagem regressiva dos 7 dias. |
| **Marina**, proponente | "Posso inscrever 3 ideias como em 2026?" | "Não. Na edição 2027 são **2**, contando as de equipe (RG_1100 v2 4.1.2). A regra mudou em 20/10/2026." |
| **Rafael**, fiscal da GOC | "O que preciso fazer neste contrato este mês?" | Radar: NF até o dia 25, atesto em 5 dias úteis, **pedido de prorrogação até 30/03/2027**. |
| **Diretora da DIRAF** | "Me dá um resumo do Ideias em Campo 2027 para a reunião." | **PPT gerado** com o gráfico do orçamento de R$ 96 mil, as alçadas e o calendário, com notas de rodapé citando NT_2026-021 e RG_1100. |
| **Curadora da GGC** (dona do domínio) | "O que estão perguntando sobre férias e não encontram?" | Painel de **perguntas sem resposta** + fila de **pedidos de acesso** para aprovar. |

Jornada-padrão (todas as personas): **Perguntar → Resposta curta → Por quê (regra) → Fonte (doc, item, versão) → O que fazer agora (ação/checklist)**.

---

## 4. A solução: 5 módulos

### 4.1 Copiloto conversacional agêntico
- **RAG híbrido** (busca lexical por código/item + busca vetorial), filtrado por **permissão antes da busca**, para que o modelo nunca veja o que o usuário não pode ver.
- **Ferramentas (tools) do agente**, todas determinísticas:
  - `calcular_prazos_ferias(inicio, fracionado?)` → marcos D‑n, dias úteis, feriados, antecipação.
  - `limite_ausencia(tamanho_equipe)`, `dias_por_faltas(n)`.
  - `quem_aprova(valor, contexto)` → alçadas (NT_2026-021 / NT_2026-018).
  - `prazos_contrato(codigo)` → vistoria, prorrogação, multa de rescisão (90º dia = 27/02/2027).
  - `comparar_versoes(codigo)` → o que mudou entre v2 e v3.
  - `gerar_visual(tipo, dados)` → timeline, funil, tabela, gráfico.
- **Toda resposta tem**: selo **Vigente/Substituída**, **citação** (doc + item + versão, com o trecho), **nível de confiança** e, quando aplicável, **"não consta nas fontes"**.
- **UX writing / legal design**: linguagem simples, resposta em até 3 linhas, depois expansão. Rodapé fixo: *"Em caso de divergência, prevalece o documento oficial."*

### 4.2 Painéis por perspectiva (o "dashboard")
1. **Executivo**: contratos ativos e marcos, orçamentos (ex.: R$ 96 mil do Ideias em Campo), normas vencendo (18 meses), pedidos de acesso pendentes, temas mais perguntados.
2. **Por processo**: Férias (timeline D‑n + fluxograma renderizado do FL_1111-001, que já está em Mermaid), Funil de Inovação (5 etapas + TRL), Ciclo do contrato.
3. **Por perfil**: "Minhas obrigações" de empregado, gestor, diretor, GGC ou GFI, gerado dos Anexos "Lista de verificação por perfil".
4. **Mapa do acervo**: grafo NG → PX/FM/TB/FL, *substitui*, *vinculado a*, *referencia*, com dono e status.

### 4.3 Radar proativo (o "preditivo", de forma honesta)
Em vez de ML preditivo sem dados históricos, há **detecção antecipada baseada em regras e calendário**:
- Prazos de contrato (prorrogação, vistoria, NF e atesto), vigência de NG/PX/GU (18 meses), CT acima de 150 dias.
- Calendários anuais: intenção de férias (outubro), Tese de Inovação (31/01), CIN trimestral, incentivo fiscal (31/01, 31/03, 31/07).
- **Auditor do acervo**: referências a documentos inexistentes (NG_012), citações temporalmente incoerentes, versões vigentes duplicadas.
- *Roadmap:* com dados reais de uso, entra a **previsão** de gargalos (ex.: probabilidade de uma solicitação escalar ao diretor).

### 4.4 Agentes de produtividade (e-mail institucional)
- **Resumo diário/semanal** por e-mail: "seus prazos desta semana", "mudou a NG_111", "3 pendências da equipe".
- **Gerador de PPT/relatório executivo** (python-pptx) com gráficos e **citações nas notas do slide**.
- **Roteiro de trabalho** diário/semanal sugerido a partir das obrigações do perfil.
- Princípio: **o agente sugere e o humano envia/decide** (nenhuma ação irreversível automática).

### 4.5 Governança e controle de acesso (núcleo do modelo de negócio)
Ver seção 5.

---

## 5. Governança e segurança da informação

### 5.1 Data Mesh: cada área é dona dos seus dados
- **Domínio = unidade "Elaborado por"** no cabeçalho: GGC (Férias), NIN (Inovação), GCO (Contratos).
- Cada domínio publica um **produto de dados** (seu acervo curado + fatos extraídos) e define quem acessa.
- O dono **aprova a publicação** (nada entra na camada Gold sem validação), recebe as **perguntas sem resposta** e responde aos **pedidos de acesso**.
- A plataforma central fornece infraestrutura e padrões (classificação, metadados, auditoria): **governança federada**.

### 5.2 Arquitetura Medalhão
| Camada | Conteúdo | Quem acessa |
|---|---|---|
| **Bronze** | PDFs originais, imutáveis, com hash, data de ingestão e origem | Apenas pipelines e dono do domínio |
| **Silver** | Texto extraído, **metadados do cabeçalho normalizados** (código, tipo, versão, fase, vigência, dono, aprovador, vinculado_a, classificação), **chunks por item numerado** (ex.: 4.5.1) | Pipelines |
| **Gold** | (a) Índice de busca com embeddings, (b) **grafo do acervo**, (c) **fatos estruturados** (prazos, valores, alçadas, papéis), (d) resumos aprovados | Usuários, **filtrado por permissão** |

### 5.3 Classificação e regra do "documento contaminado"
- Níveis: **Pública → Interna → Restrita → Sigilosa**.
- **Regra da equipe (high-water mark):** se qualquer parte do documento for sigilosa, **o documento inteiro é sigiloso**, inclusive todos os chunks, resumos, fatos derivados e respostas em cache.
- A classificação **propaga** para tudo o que é derivado: um PPT gerado com um trecho restrito herda "Restrita".

### 5.4 Controle de acesso (RBAC + ABAC)
- Papel (empregado, gestor, diretor, curador) + atributos (unidade, nível hierárquico, classificação do doc).
- **Filtragem na recuperação, não no prompt.** O LLM só recebe trechos autorizados, porque "pedir ao modelo para não contar" não é controle de segurança.
- Superior hierárquico pode **delegar ou restringir** acesso de sua equipe dentro do próprio domínio.

### 5.5 Fluxo de pedido de acesso (ideia da equipe, formalizada)
```
Usuário pergunta ──► resposta depende de conteúdo acima do seu nível
        │
        ▼
"Parte da resposta requer autorização da [GGC]." [Solicitar]   ← não revela o conteúdo, só o dono
        │  (justificativa obrigatória)
        ▼
Dono/superior recebe na fila ──► 1) Concede acesso temporário (expira em X dias)
                               ──► 2) Envia RESPOSTA CURADA (validada/redigida), sem abrir o documento
                               ──► 3) Nega com justificativa
        │
        ▼
Tudo registrado em trilha de auditoria (quem, o quê, quando, por quê)
```
A opção 2 é o grande diferencial: o especialista **valida a informação passada**, como a equipe idealizou, e a resposta curada vira conhecimento reutilizável para o mesmo nível de acesso.

> Cuidado de produto: em níveis "Sigilosos", nem a **existência** do documento deve ser revelada. Mostramos apenas "consulte a área X".

### 5.6 Segurança da IA e LGPD
- **Modelo**: opção on‑premises/open source ou API corporativa **sem retenção e sem treino** com dados do cliente; dados sigilosos **nunca** saem do ambiente.
- **Minimização e mascaramento** de dados pessoais (nome, matrícula) antes do LLM; logs sem conteúdo sensível.
- **Defesa contra prompt injection** vinda de documentos (conteúdo de documento é dado, nunca instrução).
- **Cache segregado por nível de acesso** (um cache compartilhado vazaria resposta sigilosa).
- **Trilha de auditoria** de perguntas, fontes usadas, acessos concedidos e PPTs gerados.

---

## 6. Eficiência com custo baixo (e como provar no pitch)

### 6.1 Roteador de custo: "o LLM é o último recurso"
```
Pergunta
  ├─1─► Cache semântico (mesma pergunta, mesmo nível de acesso)            custo ≈ 0
  ├─2─► Fatos estruturados / calculadoras (prazos, alçadas, limites)        custo ≈ 0, 100% exato
  ├─3─► RAG + modelo pequeno (resposta com citação)                         custo baixo
  └─4─► Modelo grande só para síntese longa (relatório, PPT, comparação)    custo maior, raro
```
- **Extração feita uma vez, na ingestão** (por versão de documento), não a cada pergunta.
- **Embeddings open source multilíngues** rodando localmente; **Postgres + pgvector** em vez de banco vetorial pago.
- **Reprocessa só o que mudou** (hash do PDF).
- Respostas curadas pelos donos alimentam o cache, então o custo cai com o uso.

### 6.2 Como evidenciar na apresentação
1. **Contador ao vivo na demo**: "esta resposta custou R$ 0,00, porque veio da calculadora" vs "esta custou ~R$ 0,0X, porque usou o LLM".
2. **Métrica de exatidão**: banco de **~30 perguntas de teste** tiradas dos próprios anexos (FAQ e exemplos dos documentos têm gabarito!). Mostrar % de acerto, % com citação correta e % de abstenção correta.
3. **ROI simples (fórmula, preencher com premissas declaradas):**
   `Economia/mês = consultas/mês × minutos economizados por consulta × custo-hora` − custo da plataforma.
   Ex. ilustrativo: 2.000 consultas × 10 min × R$ 60/h ≈ **R$ 20 mil/mês**, contra custo de infraestrutura de poucas centenas de reais. *(Valores hipotéticos: apresentar como premissas.)*
4. **Redução de demanda para especialistas**: % de perguntas resolvidas sem acionar GGC/NIN/GCO.

---

## 7. Análise de mercado (para o pitch; validar números antes)

| Categoria | Exemplos | O que fazem bem | Lacuna que exploramos |
|---|---|---|---|
| Copilotos de suíte | Microsoft 365 Copilot, Google Gemini/Agentspace | Integração com e‑mail/documentos | Genéricos: não entendem **vigência, hierarquia normativa, prazos D‑n e alçadas**; custo por usuário alto |
| Busca corporativa com IA | Glean, Atlassian Rovo, Guru | Conectores e busca unificada | Pouco foco em **normas com versão** e **cálculo determinístico**; sem fluxo de "resposta curada pelo dono" |
| Cadernos de pesquisa | NotebookLM, ChatGPT Projects | Q&A sobre arquivos | Sem governança, sem RBAC corporativo, sem auditoria |
| Open source | Onyx (ex‑Danswer), RAGFlow | Barato e customizável | Exige montar governança, calculadoras e UX do zero |

**Posicionamento:** *"Inteligência normativa governada"*. Não é mais um chat sobre PDFs: é a camada que **entende como a empresa se regula**, responde com a regra vigente, faz a conta, cita a fonte e respeita o dono do dado.

**Modelo de negócio (proposta):**
- Interno (BBTS/clientes do grupo): **centro de custo compartilhado**, cobrado por domínio ativo; ROI em horas economizadas e em redução de risco (prazo perdido = multa).
- Externo (produto): SaaS/on‑premises com **licença por domínio + consumo**, e não por usuário (democratiza o acesso e reduz barreira de adoção).
- Mercados-alvo: estatais e empresas reguladas com acervos normativos extensos (bancos, energia, saneamento, governo).

---

## 8. Roteiro de demo (3–4 min, tudo baseado no acervo)

1. **Ana**: "Quero férias a partir de 05/05/2027" → timeline (21/03, 31/03, 05/04, 15/04, pagamento 30/04 porque 02/05 é domingo) com as fontes NG_111 4.5 e PX Anexo D. *(Bate com o exemplo oficial.)*
2. **Ana**: "Mas não eram 30 dias?" → "Era na v2.0.0, substituída em 03/08/2026; hoje são 45." Mostra o diff das versões.
3. **Carlos**: "Equipe de 9, quantos podem sair?" → **2** (TB_1111-001, Tabela 4).
4. **Diretora**: "Gasto de R$ 18.000,01 em protótipo, quem aprova?" → **diretor da DIRTEC** (NT_2026-021 4.3) · "R$ 18.000,00?" → gerente do NIN.
5. **Rafael**: Radar → "Prorrogação do CTR_2026-012: pedir até 30/03/2027". "Se rescindir em março, tem multa?" → **não**, a partir do 91º dia (28/02/2027) não há multa; aviso de 30 dias.
6. **Abstenção honesta**: "Como o prêmio de equipe é dividido?" → "Não consta no RG_1100. Dono: NIN." [Perguntar ao NIN]
7. **Governança**: usuário sem acesso pergunta sobre documento restrito → pedido de acesso → curadora aprova com **resposta curada** → trilha de auditoria.
8. **Executivo**: "Gere um PPT do Ideias em Campo 2027" → slides com o gráfico do orçamento (R$ 96 mil), calendário e alçadas, com citações nas notas.

---

## 9. Arquitetura técnica (MVP)

```
 Next.js (App Router)                        FastAPI (Python)
 ┌──────────────────────┐   REST/SSE    ┌──────────────────────────────────────────┐
 │ Chat (streaming)     │ ────────────► │ /chat     → Roteador → Tools / RAG / LLM  │
 │ Dashboards (Recharts)│               │ /docs     → catálogo, versões, grafo      │
 │ Timeline / Mermaid   │               │ /radar    → prazos e alertas              │
 │ Pedidos de acesso    │               │ /access   → pedidos, aprovação, auditoria │
 │ Login mock por perfil│               │ /reports  → PPT (python-pptx)             │
 └──────────────────────┘               │ /ingest   → Bronze→Silver→Gold            │
                                        └──────────────┬───────────────────────────┘
                                                       │
                              Postgres + pgvector (docs, chunks, fatos, ACL, auditoria)
```
- **Ingestão:** `pdfplumber`/`docling` → parser de cabeçalho (regex sobre "Sigla e Número", "Versão", "Fase", "Vinculado a"…) → chunk por item numerado → embeddings.
- **Fatos estruturados (Gold):** tabelas `prazos`, `alcadas`, `limites`, `papeis`, `marcos_contrato`, extraídos com LLM **uma vez** e **revisados pelo dono** (no MVP: semeados manualmente a partir das tabelas TB/Anexos).
- **Agente:** loop simples de tool-calling (sem framework pesado) com prompt de sistema que exige citação e abstenção.
- **Autenticação no MVP:** seletor de persona (Ana/Carlos/Diretora/Curadora) para demonstrar RBAC. SSO fica no roadmap.
- **Avaliação:** `tests/eval/` com perguntas e gabaritos tirados dos FAQs e exemplos dos documentos.

### Modelo de dados mínimo
`documento(id, codigo, tipo, versao, fase, vigencia_ini, vigencia_fim, dono, aprovador, classificacao, vinculado_a, substitui_id, hash)`
`chunk(id, documento_id, item, texto, embedding, classificacao)`
`fato(id, documento_id, item, tipo, chave, valor)` · `usuario(id, papel, unidade, nivel)`
`pedido_acesso(id, usuario_id, documento_id, justificativa, status, resposta_curada, decidido_por, expira_em)` · `auditoria(...)`

---

## 10. Escopo do hackathon × roadmap

| MVP (hackathon) | Roadmap |
|---|---|
| Ingestão dos 14 PDFs com metadados e versões | Conectores (SharePoint, e‑mail, ERP, Portal Raiz) |
| Chat com citação, selo de vigência e abstenção | SSO corporativo e herança de ACL das fontes |
| 4–5 calculadoras (férias, ausência, faltas, alçada, contrato) | Extração automática de fatos com revisão do dono |
| Painel executivo + timeline de férias + funil de inovação | Previsão de gargalos com dados de uso |
| Radar de prazos | Agente de e‑mail em produção |
| Pedido de acesso + resposta curada + auditoria | Avaliação contínua e monitoramento de alucinação |
| Gerador de PPT | Multi-idioma e acessibilidade (WCAG) |

### Divisão sugerida (branches)
- **João (`joao-sertoriel`)**: integração front↔back, ingestão (Bronze/Silver/Gold), deploy, `homolog-*`.
- **Lana (`lana`)**: UX/UI, UX writing e legal design, telas de chat, timeline e dashboards.
- **Victor (`victor`)**: API FastAPI, modelo de dados, RBAC/ABAC, pedidos de acesso e auditoria.
- **Thiago (`thiago`)**: agente, RAG, calculadoras, gerador de PPT, banco de avaliação.

---

## 11. Riscos e decisões em aberto

- **Nome "BB Zero Click"**: usar a marca "BB" exige autorização do dono da marca. Sugestões neutras: **Zero Click**, **Raiz IQ** (dialoga com o "Portal Raiz" do acervo), **Norma Clara**, **Bússola**.
- **LLM e dados**: definir provedor (API com zero retenção vs modelo local). Para a demo, documentar a escolha e o porquê.
- **Alucinação**: mitigada por calculadoras, citação obrigatória e abstenção; medida pelo banco de avaliação.
- **Excesso de escopo**: priorizar a demo da seção 8. O resto é slide.
- **Segunda iteração (OneDrive)**: o arquivo exige login e não pôde ser lido. Incorporar os pontos dela quando disponível.

---

## 12. Estrutura sugerida do pitch (5 min)
1. **Dor** (30 s): "Até quando eu peço férias?" exige ler 5 documentos e 2 versões.
2. **Solução** (30 s): inteligência normativa governada: resposta certa, com fonte, no seu nível de acesso.
3. **Demo** (2 min 30 s): roteiro da seção 8.
4. **Governança e custo** (45 s): data mesh, medalhão, contaminação de sigilo, roteador de custo, % de acerto.
5. **Mercado e próximo passo** (45 s): diferencial frente a Copilot/Glean, modelo por domínio, roadmap.
