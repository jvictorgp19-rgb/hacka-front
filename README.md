# 🏛️ Zero Click (Raiz IQ) — Frontend & Legal Design Experience

> **Desafio 2: Plataforma de Inteligência Empresarial (HUBB/TS — Dites | Gecop | Dipin)**  
> *Transformando normas extensas, contratos e documentos fragmentados em inteligência empresarial governada, visual e acionável em tempo real.*

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Legal Design](https://img.shields.io/badge/UX-Legal_Design_%26_UX_Writing-0038A8)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen)

---

## 👥 Equipe: Ctrl + Alt + Business
- **Lana Sofia Alcântara da Silva Azevedo** — *UX/UI, Legal Design, UX Writing, Simuladores & Dashboards (`branch: lana`)*
- **José Victor Guerra Pereira** — *API FastAPI, Modelo de Dados, RBAC/ABAC & Auditoria (`branch: victor`)*
- **Thiago Santos Medeiros** — *Agente IA, RAG Híbrido, Calculadoras, Gerador de PPT & Benchmark (`branch: thiago`)*
- **João Arthur Duarte de Faria / João Sertoriel** — *Arquitetura de Solução, Ingestão Medalhão, Integração & Deploy*

---

## 🎯 O Problema e a Nossa Tese

Na rotina corporativa da **BBTS (representada pelo acervo sintético da ACME Tecnologia e Serviços)**, ninguém quer ler dezenas de páginas da `NG_111` ou do contrato `CTR_2026-012` para descobrir *"até quando peço férias?"*, *"quem aprova R$ 18.000,01?"* ou *"qual a multa se rescindirmos o coworking em março?"*.

Soluções ingênuas de RAG falham neste cenário porque:
1. **Confundem versões revogadas com vigentes** (ex.: `NG_111 v2.0.0` tem data de vigência até `10/06/2027`, mas está revogada pelo campo `Fase: Versão anterior` desde a emissão da `v3.0.0` em `03/08/2026`).
2. **Alucinam em cálculos de prazos e alçadas** (ex.: contar `D-3` caindo no domingo `02/05/2027` sem antecipar para o dia útil `30/04/2027`, ou errar o arredondamento para baixo de 30% da equipe).
3. **Inventam respostas onde há lacunas explícitas** (ex.: divisão de prêmio de equipe no `RG_1100` ou documentos citados que não estão no acervo, como `NG_010` e `NG_012`).

> **Nossa Tese:** Confiabilidade corporativa não vem de "um LLM maior". Vem de **Metadados + Hierarquia Normativa (`NG > PX > FM/TB/FL`) + Calculadoras Determinísticas + Citação Exata + Abstenção Honesta + Governança Data Mesh**.

---

## 🎨 Identidade Visual BBTS, Legal Design & UX Writing

A interface foi desenhada seguindo o **minimalismo institucional do portal oficial da BBTS (`bbts.com.br`)** e os princípios de **Revelação Progressiva (*Progressive Disclosure*)**:
- **Paleta Institucional Limpa:** Predominância de branco (`#FFFFFF`) e cinza suave (`#F8FAFC`), Azul BBTS (`#0038A8` e `#002D72`) para hierarquia visual e Amarelo BBTS (`#F8D117`) restrito a CTAs e indicadores ativos.
- **Acessibilidade Nativa:** Barra superior com controles de fonte (`A-`, `A`, `A+`) e modo de **Alto Contraste**.
- **UX Writing (Pirâmide Invertida):** Respostas diretas em até **3 linhas** em linguagem simples, seguidas de expansão sob demanda para fundamentação normativa, árvore de camadas e custo de processamento.
- **Rodapé Jurídico Fixo:** *"Em caso de divergência, prevalece o documento oficial."*

---

## ✅ Cobertura dos 8 Critérios Oficiais da Banca (HUBB/TS)

| # | Funcionalidade Esperada (HUBB/TS) | Implementação no Frontend (`hacka-front`) |
|---|---|---|
| **1** | **Base e processamento de documentos** | Visualização da pipeline Medalhão (**Bronze → Silver → Gold**) com os **14 PDFs sintéticos** organizados nos 3 temas (*Férias, Inovação e Locação*). |
| **2** | **Perguntas e respostas com fonte** | Badges obrigatórias em todas as respostas e cards com a tríade: `[Fonte: CÓDIGO | Versão: vX.0.0 | Trecho: Item/Cláusula]`, além de botão de **Abstenção Honesta** (`Não consta nas fontes → Perguntar ao Dono`). |
| **3** | **Síntese e destaques** | Lentes rápidas de perspectiva para filtrar **⚠️ Riscos**, **⏱️ Prazos**, **📋 Obrigações** e **💰 Valores** sem ler o documento inteiro. |
| **4** | **Recursos visuais e interativos** | Linha do tempo `D-n` interativa, Fluxograma Mermaid renderizado (`FL_1111-001`), Funil de Inovação de 5 etapas (`PX_1130-001`) e quadros comparativos em que cada nó remete à fonte. |
| **5** | **Perspectivas de análise** | Alternância instantânea da mesma base documental por **6 Personas RBAC/ABAC**, por **Unidade/Domínio** (`GGC`, `GFI`, `NIN`, `CIN`, `GCO`, `GOC`, `DIRAF`, `DIRTEC`) e por **Tema**. |
| **6** | **Resumo executivo** | Preview interativo de **Slides Executivos (PPT)** do *Ideias em Campo 2027* com gráficos e notas de rodapé normativas + preview do **Agente de E-mail Semanal**. |
| **7** | **Vigência, camadas e conflito** | Visualizador de camadas da `NG_010` (`NG > PX/RG > FM/TB/FL/NT/CTR`), modal de **Diff Lado a Lado** (`v2.0.0` vs `v3.0.0`) e **Auditor do Acervo** que sinaliza conflitos temporais entre normas. |
| **8** | **Reaproveitamento e retorno** | Sugestões de **Análises Anteriores Semelhantes** em 1 clique + avaliação de utilidade (`👍 Útil` / `👎 Sinalizar revisão`) e envio de **Resposta Curada** que alimenta o cache semântico. |

---

## 🎭 As 6 Personas (RBAC/ABAC) e o Roteiro de Demo (8 Passos)

A gaveta retrátil **`🎯 Roteiro Demo (8 Passos)`** (`src/components/DemoPitchBar.tsx`) permite executar ao vivo todos os cenários de avaliação em menos de 3 minutos:

1. **Ana (Analista / Empregada — Nível Interno):** *"Quero férias a partir de 05/05/2027"* → Gera a timeline determinística (`D-45` em `21/03`, `D-35` em `31/03`, `D-30` em `05/04`, `D-20` em `15/04` e pagamento `D-3` antecipado de domingo `02/05` para sexta `30/04/2027` conforme `NG_111 4.5.5` e `PX_1111-001 Anexo D`).
2. **Ana (Conflito de Versões):** *"Mas não eram 30 dias?"* → Exibe o alerta de substituição em `03/08/2026` e abre o Diff entre a `NG_111 v2.0.0` (30 dias, `Fase: Versão anterior`) e a `NG_111 v3.0.0` (45 dias, `Fase: Vigente`).
3. **Carlos (Gestor — Equipe de 9):** *"Quantos podem sair juntos?"* → Calcula o limite exato de **2 empregados** (`30% de 9 = 2,7`, arredondado para baixo conforme `TB_1111-001 Tabela 4`) e exibe a fila de pendências com SLA regressivo de **7 dias corridos** antes de escalar ao Diretor.
4. **Diretora da DIRAF (Alçadas Financeiras):** *"Gasto de R$ 18.000,01 em protótipo, quem aprova?"* → Compara o limite de `R$ 18.000,00` (Gerente do NIN) com `R$ 18.000,01` (Diretor da DIRTEC — `NT_2026-021 item 4.3` e `NG_012`).
5. **Rafael (Fiscal Técnico GOC — Contrato):** Abre o Radar do `CTR_2026-012` → Alerta de prorrogação até `30/03/2027`, desconto de `R$ 121,67/dia` por queda de internet > 4h e comprova **multa zero (`R$ 0,00`)** para rescisão em março (90º dia encerra em `27/02/2027`).
6. **Abstenção Honesta (Lacunas do Acervo):** *"Como o prêmio de equipe é dividido?"* → Sinaliza **"Não consta no RG_1100. Dono: NIN"** com botão `[Perguntar ao NIN]`, tratando também empregados afastados (`NT_2026-021 5.4`) e a ausência física da `NG_010`/`NG_012`.
7. **Curadora da GGC (Data Mesh & Resposta Curada):** Simula bloqueio RBAC para documento restrito → Solicitação de acesso com justificativa → Aprovação pela Curadora enviando **Resposta Curada** (sem expor o PDF original) → Registro na **Trilha de Auditoria**.
8. **Executivo (Gerador de PPT):** *"Gere um PPT do Ideias em Campo 2027"* → Renderiza os slides executivos com o orçamento de `R$ 96.000,00`, fases e alçadas, com citações nas notas de rodapé.

---

## 📂 Estrutura do Projeto

```text
ctrl-alt-business-bbts/
├── docs_acervo/
│   ├── vigentes/                              # 11 PDFs vigentes (NG_111 v3, NG_1130, CTR_2026-012, etc.)
│   └── substituidos/                          # PDFs históricos revogados (NG_111 v2, FM_1111-001 v1)
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts                  # Rota local de Q&A com Roteador FinOps e Abstenção Honesta
│   │   ├── layout.tsx                         # Layout institucional BBTS
│   │   └── page.tsx                           # Portal principal dividido em 4 abas minimalistas
│   ├── components/
│   │   ├── CopilotSidebar.tsx                 # Co-Piloto retrátil com citação e avaliação de resposta
│   │   ├── DemoPitchBar.tsx                   # Gaveta retrátil com os 8 passos do roteiro de pitch
│   │   ├── FeriasSimulators.tsx               # Calculadoras D-n, faltas (TB_1111-001), 30% equipe e Mermaid
│   │   ├── GovernanceDifferentialsPanel.tsx   # Radar, RBAC/Resposta Curada, Auditor Medalhão, FinOps e PPT
│   │   ├── InovacaoSimulators.tsx             # Calculadoras de alçada (18k/120k), gamificação (800 pts) e orçamento
│   │   └── LocacaoSimulators.tsx              # Calculadora do Fiscal GOC (internet, rescisão 90º dia, cotações)
│   ├── data/
│   │   └── acervo_estruturado_acme_bbts.json  # Camada Gold completa extraída dos 14 documentos do acervo
│   └── lib/
│       └── api.ts                             # Cliente HTTP para o FastAPI (hacka-back) com fallback offline 100%
└── package.json
