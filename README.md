# Zero Click (Raiz IQ) — Plataforma de Inteligência Normativa Governada

> **Desafio 2: Plataforma de Inteligência Empresarial | Hackathon HUBB/TS (Dites · Gecop · Dipin)**  
> **Organização Sintética:** ACME Tecnologia e Serviços (Representação Institucional BBTS — BB Tecnologia e Serviços)  
> **Repositório Backend complementar:** [`hacka-back` (FastAPI + Arquitetura Medalhão + Roteador FinOps)](https://github.com/jvictorgp19-rgb/hacka-back)

---

## 👥 Equipe Ctrl + Alt + Business

| Integrante | Papel no Projeto |
| :--- | :--- |
| **Thiago Santos Medeiros** | Arquitetura de Solução, Governança Normativa & Estratégia de Produto |
| **José Victor Guerra Pereira** | Engenharia Full-Stack, Integração de Sistemas & Orquestração |
| **Lana Sofia Alcântara da Silva Azevedo** | Engenharia Frontend/Backend, Legal Design, UX Writing & Simuladores Determinísticos |
| **Alberto Ramos de Souza Silva** | Inteligência Artificial, RAG Governado, Avaliação & FinOps |
| **João Sertoriel** | Engenharia de Dados, Pipeline Medalhão & Infraestrutura |

---

## 🎯 Proposta de Valor & Tese Central

> **“Confiabilidade em inteligência normativa corporativa não vem de um LLM maior, e sim da combinação rigorosa de: Metadados (`NG_010`) + Regras + Cálculo Determinístico (`R$ 0,00`) + Citação Verificável + Abstenção Honesta + Governança Data Mesh.”**

Ambientes empresariais de alta conformidade como a **BBTS** não toleram alucinações numéricas, uso acidental de normas revogadas ou vazamento de documentos restritos. O **Zero Click (Raiz IQ)** inverte a lógica dos chatbots tradicionais:

1. **Zero-Click Proativo:** Antes mesmo de o colaborador digitar uma pergunta, a plataforma identifica sua **Persona e nível RBAC/ABAC**, entregando os alertas de prazo (`D-n`), o resumo executivo em linguagem simples (*UX Writing*) e o checklist acionável da sua jornada.
2. **O LLM é o Último Recurso (FinOps):** Prazos de férias, limites de 30% de equipe, alçadas financeiras da `NG_012`, glosas de SLA de internet e multas contratuais são resolvidos por **calculadoras determinísticas (`Custo: R$ 0,00`)**, garantindo **100% de exatidão matemática** e reduzindo em ~70% o custo de inferência.
3. **Trava Histórica Anti-Pegadinha:** Versões substituídas (`NG_111 v2.0.0`, `FM_1111-001 v1.0.0` e `RG_1100 v1.0.0`) ficam isoladas em quarentena na Camada Silver. Mesmo que um PDF antigo exiba uma data final futura impressa no cabeçalho (como a `NG_111 v2.0.0` com data até `10/06/2027`), o Raiz IQ bloqueia seu uso normativo pelo campo `Fase: Versão anterior` e exibe o comparativo (*Diff*) para o usuário.
4. **Abstenção Honesta & Resposta Curada (Data Mesh):** Quando uma regra não consta no acervo (ex.: fórmula de divisão de prêmio em equipe no `RG_1100` ou tratamento de afastados na `NT_2026-021 item 5.4`), o sistema declara explicitamente **`"Não consta nas fontes"`** e oferece o botão **`[Perguntar ao NIN]`**. Se a resposta envolver dado restrito, a dona do domínio (**Curadora da GGC**) aprova via **Resposta Curada** sem precisar abrir o PDF restrito original.

---

## 🎨 Design System & Experiência do Usuário (`bbts.com.br`)

A interface foi projetada seguindo o **minimalismo institucional do portal oficial da BBTS (`https://www.bbts.com.br/`)**, eliminando a sobrecarga cognitiva por meio de **Revelação Progressiva (*Progressive Disclosure*)**:

- **Paleta Institucional Limpa:**
  - **Branco Puro (`#FFFFFF`) & Cinza Gelo (`#F8FAFC`):** Fundos predominantes com respiro generoso e bordas sutis (`#E2E8F0`).
  - **Azul BBTS (`#0038A8` e `#002D72`):** Cabeçalho institucional, títulos, navegação e selos de governança.
  - **Amarelo/Ouro BBTS (`#F8D117` / `#FFCC00` com texto `#002D72`):** Aplicado estrategicamente apenas em CTAs primários, indicadores de aba ativa e filete institucional superior.
- **Legal Design & UX Writing:**
  - Respostas do Co-Piloto exibem **no máximo 3 linhas visíveis inicialmente**, acompanhadas do botão **`Ver fundamentação e fonte`** para expandir os artigos, o selo de versão vigente e o badge de custo/sigilo do roteador.
  - Cards de documentos na aba *Normas & Jornada* mostram apenas **3 informações imediatas** (*Código*, *Título* e *Selo Vigente + Dono*). Metadados completos da `NG_010` e o comparativo de versões (`Diff v2 vs v3`) abrem sob demanda em modais limpos.
  - **Rodapé Fixo de Conformidade Legal Design:** *"Em caso de divergência, prevalece o documento oficial."*
- **Barra de Acessibilidade Nativa:** Controles discretos no topo institucional para ajuste tipográfico (**`A-`**, **`A`**, **`A+`**) e modo de **`Alto Contraste`**.

---

## 📋 Mapeamento dos 8 Requisitos Oficiais da Banca (HUBB/TS) vs. Componentes

| # | Requisito / Critério do Desafio 2 (HUBB/TS) | Solução Implementada no Frontend (`hacka-front`) | Componente / Arquivo Principal |
| :-: | :--- | :--- | :--- |
| **1** | **Organização e Desambiguação Taxonômica (`NG_010`)** | Validação obrigatória do campo `vinculado_a` (desambiguando `PX_1111-001 -> NG_111` da Série 1 vs. `PX_1130-001 -> NG_1130` da Série 11) e regras de vigência (18 meses NG/PX/GU; 150 dias CT). | `src/app/page.tsx` (Aba *Normas & Jornada* + Modal de Detalhes) |
| **2** | **Bloqueio de Documentos Substituídos (Trava Histórica)** | Quarentena visual e algorítmica de `NG_111 v2.0.0` (30 dias), `FM_1111-001 v1.0.0` e `RG_1100 v1.0.0` (3 ideias), com modal comparativo *Diff* destacando a `diferenca_critica_pegadinha`. | `src/app/page.tsx` + `src/components/DemoPitchBar.tsx` (Passo 2) |
| **3** | **Personalização por Papel e Controle de Acesso (RBAC/ABAC)** | Seletor de 6 Personas Nominais no topo + visão por perfil com `resumo_ux` e checklist interativo + propagação de sigilo *High-Water Mark* (`Pública -> Interna -> Restrita -> Sigilosa`). | `src/lib/api.ts` + `src/components/GovernanceDifferentialsPanel.tsx` |
| **4** | **Precisão em Regras Numéricas, Prazos e Alçadas (`NG_012`)** | Calculadoras determinísticas em tempo real para Férias (`D-45` a `D-3`, faltas e teto de 30%), Inovação (Alçadas R$ 18k / R$ 120k, 800 pts e orçamento R$ 96k) e Locação (glosa R$ 121,67/dia e multa 90º dia). | `FeriasSimulators.tsx`, `InovacaoSimulators.tsx`, `LocacaoSimulators.tsx` |
| **5** | **Rastreabilidade, Citação Exata e Zero Alucinação** | Todas as respostas ancoram código e versão (`NG_111 v3.0.0`, `RG_1100 v2.0.0`, `CTR_2026-012 v1.0.0`) e acionam **Abstenção Honesta** (`[Perguntar ao NIN]`) diante de lacunas normativas. | `src/components/CopilotSidebar.tsx` + `src/app/api/chat/route.ts` |
| **6** | **Governança Data Mesh e Fluxo de Resposta Curada** | Simulação completa em 3 estágios: bloqueio RBAC para usuário comum → envio à dona do domínio (`GGC`) → aprovação via **Resposta Curada** sem abrir o PDF restrito → registro na Trilha de Auditoria. | `src/components/GovernanceDifferentialsPanel.tsx` (Sub-aba *b*) |
| **7** | **Auditoria de Qualidade Documental (Arquitetura Medalhão)** | Painel *Bronze → Silver → Gold* que aponta inconsistências temporais reais nos PDFs (ex.: `NG_1130` de jul/2026 citando `NT_2026-021` de out/2026; `NT_2026-021` de 16/10 citando `RG_1100 v2` de 20/10). | `src/components/GovernanceDifferentialsPanel.tsx` (Sub-aba *c*) |
| **8** | **Eficiência Operacional (FinOps), ROI e Saídas Executivas** | Roteador de custo ao vivo (`R$ 0,00` vs `~R$ 0,004`), calculadora de ROI (`R$ 20.000/mês`), gerador de slides executivos (`.pptx`) e rascunho de e-mail semanal (*"O agente sugere e o humano envia"*). | `src/components/GovernanceDifferentialsPanel.tsx` (Sub-aba *d*) |

---

## 👤 As 6 Personas Nominais (RBAC/ABAC) & Roteiro de Demo ao Vivo (8 Passos)

No cabeçalho superior, o avaliador pode alternar entre as **6 Personas Nominais** ou acionar o botão **`🎯 Roteiro Demo (8 Passos)`**, que abre uma gaveta retrátil capaz de conduzir toda a demonstração de 3 minutos sem digitar:

### Tabela de Personas Nominais

| Persona | Papel / Cargo | Unidade | Nível RBAC | Jornada Padrão | Caso de Uso Principal na Demo |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Ana** | Analista / Empregada | Operações / Portal Raiz | `Interna` | Férias (Série 1) | Planeja férias para `05/05/2027`, valida antecipação do pagamento `D-3` na sexta `30/04/2027` e compara `NG_111 v2` (30d) vs `v3` (45d). |
| **Carlos** | Gestor — Equipe de 9 | Gerência Operacional | `Interna` | Férias (Série 1) | Calcula teto simultâneo da equipe de 9 (`30% = 2,7 -> máx. 2 pessoas`) e monitora SLA de **7 dias corridos** antes da escalada ao Diretor. |
| **Marina** | Proponente | Operações de Campo / NIN | `Interna` | Inovação (Série 11) | Simula 800 pontos de gamificação, prêmios cumulativos de até R$ 10k e testa a **Abstenção Honesta** sobre divisão de prêmio em equipe. |
| **Rafael** | Fiscal Técnico | GOC (Operações de Campo) | `Restrita` | Locação (`CTR_2026-012`) | Calcula glosa de `R$ 121,67/dia` por queda de internet > 4h, monitora prorrogação (`30/03/2027`) e isenção de multa no 91º dia (`28/02/2027`). |
| **Diretora da DIRAF** | Executiva de Diretoria | DIRAF / DIRTEC | `Sigilosa` | Inovação / Contratos | Audita fronteira de alçada (`R$ 18.000,00` Gerente NIN vs `R$ 18.000,01` Diretor DIRTEC), trava fiscal de `31/03` e gera apresentação PPTX. |
| **Curadora da GGC** | Dona do Domínio (Data Mesh) | GGC (Gente e Cultura) | `Sigilosa` | Governança & Série 1 | Audita inconsistências da Camada Silver e responde pedidos de acesso RBAC emitindo **Resposta Curada** sem expor o PDF restrito. |

### Os 8 Passos do Roteiro de Pitch (`DemoPitchBar.tsx`)

1. **`[1. Ana: Férias 05/05/2027]`** → Calcula a linha do tempo exata: Solicitar até `21/03/2027` (`D-45`), Aviso GGC até `31/03/2027` (`D-35`), Assinar até `05/04/2027` (`D-30`), Alterar até `15/04/2027` (`D-20`) e **Pagamento antecipado para sexta-feira `30/04/2027`** porque `02/05/2027` (`D-3`) é domingo e `01/05` é feriado (`NG_111 item 4.5` e `PX_1111-001 Anexo D`).
2. **`[2. Ana: Mudança 30 vs 45 dias]`** → Abre o Diff entre `NG_111 v2.0.0` (30 dias, bloqueada pelo status `Fase: Versão anterior` apesar de trazer data impressa até `10/06/2027`) e `NG_111 v3.0.0` (45 dias, vigente desde `03/08/2026`).
3. **`[3. Carlos: Equipe de 9 + Pendências]`** → Demonstra que `30% de 9 = 2,7` arredondado para baixo permite no **máximo 2 pessoas** em férias simultâneas (`NG_111 4.6.3` / `TB_1111-001 Tabela 4`) e exibe o relógio regressivo de 7 dias corridos antes da escalada ao Diretor.
4. **`[4. Diretora: Alçada R$ 18.000,01]`** → Compara `R$ 18.000,00` (aprovado pelo **Gerente do NIN**) vs `R$ 18.000,01` (deslocado para o **Diretor da DIRTEC**, conforme `NT_2026-021 item 4.3` e `NG_012`).
5. **`[5. Rafael: Radar Contrato CTR_2026-012]`** → Destaca o alerta de prorrogação até `30/03/2027` e comprova que a rescisão em março/2027 tem **multa zero (`R$ 0,00`)**, pois o 90º dia encerra em `27/02/2027` e a partir do **91º dia (`28/02/2027`)** há isenção total com aviso de 30 dias.
6. **`[6. Abstenção Honesta: Prêmio Equipe & NG_012]`** → Exibe `"Não consta no RG_1100. Dono: NIN"` com botão **`[Perguntar ao NIN]`**, abordando também o caso de empregado afastado (`NT_2026-021 item 5.4`) e a ausência física dos PDFs da `NG_010` e `NG_012`.
7. **`[7. Governança: Pedido de Acesso & Resposta Curada]`** → Simula o bloqueio RBAC (`"Parte da resposta requer autorização da [GGC]"`), alterna para a **Curadora da GGC** aprovando via **Resposta Curada** e grava o evento na Trilha de Auditoria.
8. **`[8. Executivo: Gerar PPT Ideias em Campo 2027]`** → Renderiza o preview de 3 slides executivos (Orçamento de `R$ 96.000,00`, cronograma das 7 fases e matriz de alçadas) com notas de rodapé auditadas (`NT_2026-021` e `RG_1100 v2.0.0`).

---

## 🧮 Detalhamento das Calculadoras Determinísticas (`Custo: R$ 0,00`)

### 1. Série 1 — Férias (`FeriasSimulators.tsx` + `MermaidFlowchart.tsx`)
- **Calculadora de Faltas Injustificadas (`TB_1111-001 Tabela 1`):** `0–5 faltas = 30d` | `6–14 faltas = 24d` | `15–23 faltas = 18d` | `24–32 faltas = 12d` | `≥ 33 faltas = 0d (perda do direito)` + simulação de Abono Pecuniário (conversão de 1/3 até 10 dias, pedido até 15d antes do fim do aquisitivo) e adiantamento de 13º (pedido em janeiro).
- **Simulador de Limite de 30% da Equipe (`TB_1111-001 Tabela 4`):** Cálculo `floor(equipe * 0.30)` com mínimo de 1 pessoa para equipes de 1 a 3 empregados.
- **Linha do Tempo `D-n` + Fluxograma Interativo (`FL_1111-001`):** Simula os 3 caminhos do nó condicional `E {Gestor decide em até 7 dias?}` (*Aprova*, *Recusa/Nova data* ou *Sem decisão → Escalada ao Diretor em 3 dias úteis*).

### 2. Série 11 — Inovação: Ideias em Campo 2027 (`InovacaoSimulators.tsx`)
- **Simulador de Alçadas de Prototipagem (`NT_2026-021` / `NG_012`):** `Até R$ 18.000,00` (Gerente NIN) | `R$ 18.000,01 a R$ 120.000,00` (Diretor DIRTEC) | `> R$ 120.000,00` (Comitê de Alçadas) + Validador de Elegibilidade 2027 (mínimo de 6 meses de casa em `01/02/2027` e máximo de 2 ideias por pessoa).
- **Simulador de Gamificação (até 800 pts) & Prêmios Cumulativos:** Ideia elegível (`100 pts`) + Votação interna (`10 pts/voto`, máx `50 pts`, proibido votar na própria) + Imersão (`150 pts`) + Protótipo TRL 4 até `31/05/2027` (`300 pts`) + Banca Final (`200 pts`) = **800 pts**. Prêmios em folha: `1º R$ 8k` | `2º R$ 5k` | `3º R$ 3k` + `R$ 2k cumulativo por Arena` (teto de **R$ 10.000,00**).
- **Dashboard do Orçamento (`R$ 96.000,00`) & Trava de Incentivo Fiscal (`31/03`):** Kits de prototipagem (`R$ 36k / 37,5%`), Imersão (`R$ 30k / 31,3%`), Premiação colocação (`R$ 16k / 16,7%`), Premiação arenas (`R$ 8k / 8,3%`) e Comunicação (`R$ 6k / 6,3%`).

### 3. Contratos — Locação de Coworking (`LocacaoSimulators.tsx`)
- **Calculadora de Glosa do Fiscal Técnico GOC (`CTR_2026-012`):** Desconto automático de `1/30 avos = R$ 121,67/dia` sobre o aluguel mensal de `R$ 3.650,00` para cada dia com interrupção de internet (> 4h), além de simulação de retenção por falta de atesto (sem multa para a ACME) vs. atraso por culpa exclusiva da ACME (multa 1% + juros 1% a.m.).
- **Simulador de Rescisão (`90º vs 91º dia`) & Termo Aditivo (`20%`):** Até o 90º dia (`27/02/2027`), multa de 1 mensalidade (`R$ 3.650,00`); a partir do **91º dia (`28/02/2027`)**, **multa de `R$ 0,00`**. Limite de aditivo de valor de `20%` (`R$ 3.650,00`) e prazo de prorrogação até `30/03/2027`.
- **Comparativo das 3 Cotações (`NT_2026-018`) e Rito Mensal:** Hub Jacarandá (`R$ 3.650/mês` — Vencedor) vs. Espaço Ipanema Verde (`R$ 3.900/mês`) vs. Centro Empresarial Colmeia (`R$ 4.200/mês`), e fluxo `Dia 25 (NF)` → `5 dias úteis (Atesto GOC)` → `Dia 8 (Pagamento GFI)`.

---

## 📂 Arquitetura de Pastas

```text
ctrl-alt-business-bbts/
├── docs_acervo/                              # Acervo documental físico (Camada Bronze)
│   ├── vigentes/                             # 11 PDFs vigentes (Série 1, Série 11 e Contratos)
│   └── substituidos/                         # PDFs revogados em quarentena (NG_111 v2, FM_1111 v1)
├── public/docs_acervo/                       # Espelho estático para abertura imediata dos PDFs no navegador
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts                 # Motor local de fallback RAG + Calculadoras Determinísticas
│   │   ├── globals.css                       # Estilos globais e variáveis Tailwind CSS
│   │   ├── layout.tsx                        # Layout raiz com tipografia Geist e metadados BBTS
│   │   └── page.tsx                          # Aplicação principal (4 Abas Limpas + Modais + Acessibilidade)
│   ├── components/
│   │   ├── CopilotSidebar.tsx                # Gaveta retrátil do Co-Piloto com revelação progressiva (3 linhas)
│   │   ├── DemoPitchBar.tsx                  # Gaveta retrátil do Roteiro de Demo (8 Passos) + Prova ao Vivo
│   │   ├── FeriasSimulators.tsx              # Simuladores da Série 1 (Faltas, 30% Equipe e Timeline D-n)
│   │   ├── GovernanceDifferentialsPanel.tsx  # Sub-abas: Radar, Acesso/Resposta Curada, Medalhão e FinOps/PPT
│   │   ├── InovacaoSimulators.tsx            # Simuladores da Série 11 (Alçadas, Gamificação 800pts, Orçamento)
│   │   ├── LocacaoSimulators.tsx             # Simuladores de Locação (Glosa R$ 121,67, Rescisão 91º dia, Cotações)
│   │   └── MermaidFlowchart.tsx              # Renderizador interativo do fluxograma oficial FL_1111-001
│   ├── data/
│   │   └── acervo_estruturado_acme_bbts.json # Fonte única de verdade (Camada Gold)
│   └── lib/
│       └── api.ts                            # Cliente HTTP para o FastAPI (/chat, /docs, /radar, /access, /reports, /ingest) com fallback offline 100% resiliente
└── package.json
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** `>= 18.x` e **npm**
- *(Opcional, mas recomendado)* Servidor Backend **FastAPI** (`hacka-back`) rodando em `http://localhost:8000`. Caso o backend Python não esteja ativo, o cliente `src/lib/api.ts` aciona automaticamente o **fallback determinístico local** sem perda de funcionalidade.

### Passo a Passo

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar a URL da API FastAPI (opcional — já configurado por padrão)
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse **`http://localhost:3000`** no navegador.

### Validação de Build de Produção e TypeScript

```bash
npx tsc --noEmit
npm run build
```

---

<p align="center">
  <strong>Equipe Ctrl + Alt + Business</strong> • Hackathon HUBB/TS — Desafio 2<br/>
  <em>⚖️ Em caso de divergência, prevalece o documento oficial.</em>
</p>
