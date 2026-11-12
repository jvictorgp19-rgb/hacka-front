import { NextRequest, NextResponse } from "next/server";
import acervo from "@/data/acervo_estruturado_acme_bbts.json";

export interface ChatResponse {
  answer: string;
  bullets: string[];
  citations: { codigo: string; titulo: string; versao: string; status: string }[];
  costBadge: {
    type: "deterministic" | "rag_llm";
    label: string;
    latencyMs: number;
    sigiloNivel: "Pública" | "Interna" | "Restrita" | "Sigilosa";
  };
  revokedAlert?: {
    codigo: string;
    versaoRevogada: string;
    substituidoPor: string;
    pegadinha: string;
  };
  honestAbstention?: {
    lacuna: string;
    donoDominio: string;
    botaoAcao: string;
    detalhesExtras: string[];
  };
  rbacBlock?: {
    dominioResponsavel: string;
    nivelExigido: string;
    mensagem: string;
  };
  suggestedFollowups: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queryRaw: string = body.message || body.query || "";
    const temaAtual: string = body.tema || "ferias";
    const perfilAtual: string = body.perfil || "";

    const q = queryRaw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const bullets: string[] = [];
    const citations: { codigo: string; titulo: string; versao: string; status: string }[] = [];
    let revokedAlert: ChatResponse["revokedAlert"] = undefined;
    let honestAbstention: ChatResponse["honestAbstention"] = undefined;
    let rbacBlock: ChatResponse["rbacBlock"] = undefined;
    let answer = "";
    let isDeterministic = false;
    let sigiloNivel: ChatResponse["costBadge"]["sigiloNivel"] = "Interna";

    const addCitation = (codigo: string) => {
      const doc = acervo.documentos_acervo.find((d) => d.codigo === codigo);
      if (doc && !citations.some((c) => c.codigo === doc.codigo)) {
        citations.push({
          codigo: doc.codigo,
          titulo: doc.titulo,
          versao: `v${doc.versao}`,
          status: doc.fase,
        });
      }
    };

    // --- SPECIAL CASE 1: DEMO STEP 1 (Ana: Férias 05/05/2027) ---
    if (q.includes("05/05/2027") || (q.includes("maio") && q.includes("ferias"))) {
      isDeterministic = true;
      answer =
        "Cálculo Determinístico da Linha do Tempo D-n para Início de Gozo em **05/05/2027 (Quarta-feira)**:";
      bullets.push(
        "**Validação do Dia de Início (NG_111 item 4.2):** `05/05/2027` é quarta-feira (dia útil) e não antecede em 2 dias úteis feriado ou DSR — **Data Válida!**",
        "**D-45 — Solicitação Formal (`21/03/2027`):** Data limite para submeter o `FM_1111-001 v2.0.0` no Portal Raiz (PX_1111-001 Anexo D).",
        "**D-35 — Emissão do Aviso (`31/03/2027`):** GGC confere faltas na `TB_1111-001` e emite o Aviso de Férias.",
        "**D-30 — Assinatura Eletrônica (`05/04/2027`):** Prazo final (e até 5 dias úteis do recebimento) para assinatura eletrônica pela Ana (sem assinatura as férias não iniciam).",
        "**D-20 — Limite de Alteração/Cancelamento (`15/04/2027`):** Último dia para alteração pela empregada com anuência do gestor (a partir de D-19 em `16/04/2027`, somente pelo Diretor por necessidade de serviço).",
        "**D-3 — Antecipação de Pagamento (`30/04/2027 - Sexta-feira`):** O marco D-3 cairia em `02/05/2027` (Domingo). Conforme **NG_111 item 4.5** e **PX_1111-001 Anexo D**, quando D-3 cai em fim de semana ou feriado (01/05 Dia do Trabalhador), a GFI **antecipa o pagamento para o dia útil anterior (`30/04/2027`)**!"
      );
      addCitation("NG_111");
      addCitation("PX_1111-001");
      addCitation("FM_1111-001");
      addCitation("TB_1111-001");
    }

    // --- SPECIAL CASE 2: DEMO STEP 6 (Abstenção Honesta: Divisão de prêmio em equipe, afastado e NG_012 física) ---
    if (
      q.includes("dividido") ||
      q.includes("divisao") ||
      q.includes("afastado") ||
      q.includes("abstencao") ||
      (q.includes("equipe") && q.includes("premio")) ||
      q.includes("pdf da ng_012") ||
      q.includes("pdf da ng_010")
    ) {
      isDeterministic = false;
      answer =
        "🛡️ **Abstenção Honesta Ativada (Zero Alucinação):** Identifiquei lacunas normativas explícitas no acervo em que o sistema se recusa a inventar regras:";
      bullets.push(
        "**1. Rateio/Divisão do Prêmio em Equipe (Até 4 pessoas):** **Não consta no `RG_1100 v2.0.0`**. O regulamento fixa os valores (R$ 8k/5k/3k + R$ 2k por arena) e o pagamento em folha em até 30 dias, mas não define se o valor é dividido igualmente ou rateado por percentual entre os até 4 membros. **Dono do documento: NIN (Núcleo de Inovação).**",
        "**2. Empregado Afastado na Edição 2027 (`NT_2026-021 item 5.4`):** A Nota Técnica registra como ponto de atenção a situação de empregado afastado durante as etapas presenciais/banca, remetendo a deliberação casuística ao **NIN / CIN**.",
        "**3. Ausência Física dos PDFs `NG_010` e `NG_012`:** Ambos os normativos são citados no cabeçalho de todos os documentos, mas seus PDFs integrais não fazem parte do pacote físico do acervo — o Raiz IQ responde estritamente com as tabelas de taxonomia e alçadas extraídas na camada Gold."
      );
      honestAbstention = {
        lacuna: "Regra de rateio individual do prêmio em folha para ideias inscritas em equipe (2 a 4 integrantes) e tratamento de afastamento superveniente.",
        donoDominio: "NIN (Núcleo de Inovação) / Aprovador: DIRTEC & DIRAF",
        botaoAcao: "[Perguntar ao NIN]",
        detalhesExtras: [
          "RG_1100 v2.0.0 fixa equipe de até 4 pessoas e teto de R$ 10.000,00 cumulativos, mas silencia sobre a fórmula de divisão em folha.",
          "NT_2026-021 item 5.4 aponta necessidade de diretriz complementar para casos de afastamento.",
          "NG_010 e NG_012 constam apenas como referências cruzadas de governança.",
        ],
      };
      addCitation("RG_1100");
      addCitation("NT_2026-021");
      addCitation("NG_1130");
    }

    // --- SPECIAL CASE 3: DEMO STEP 7 (RBAC Block & Resposta Curada GGC) ---
    if (
      q.includes("dossie restrito") ||
      q.includes("auditoria da folha") ||
      q.includes("resposta curada") ||
      q.includes("rbac") ||
      q.includes("restrit")
    ) {
      sigiloNivel = "Restrita";
      answer =
        "🔒 **Controle de Acesso RBAC & Contaminação de Sigilo (High-Water Mark):**";
      bullets.push(
        "**Parte Pública/Interna Liberada (`NG_111 v3.0.0`):** Em caso de cancelamento de férias a partir de **D-19** por necessidade de serviço autorizada pelo **Diretor da área**, o empregado tem direito a ressarcimento de despesas comprovadas em até **15 dias corridos**, limitado ao teto de **R$ 2.500,00**.",
        "**Parte Restrita Bloqueada:** Os parâmetros internos de auditoria da folha de pagamento e o histórico nominal de exceções da unidade possuem classificação **RESTRITA (Domínio: GGC / GFI)**.",
        "**Fluxo Data Mesh / Resposta Curada:** Você pode clicar em **Solicitar Autorização à GGC** para que a Curadora da GGC envie uma **RESPOSTA CURADA** (orientação oficial auditada sem precisar abrir o documento restrito original)."
      );
      rbacBlock = {
        dominioResponsavel: "GGC (Gerência de Gente e Cultura)",
        nivelExigido: "Restrita (High-Water Mark)",
        mensagem: "Parte da resposta requer autorização da [GGC]. Solicite uma Resposta Curada.",
      };
      addCitation("NG_111");
      addCitation("PX_1111-001");
    }

    // --- Check for revoked rules / pegadinhas ---
    const mentions30DaysFerias =
      (q.includes("30 dias") &&
        (q.includes("antecedencia") ||
          q.includes("ferias") ||
          q.includes("pedir") ||
          q.includes("solicitar") ||
          q.includes("prazo") ||
          q.includes("45"))) ||
      q.includes("v2.0") ||
      (q.includes("v1.0") && q.includes("fm_1111")) ||
      (q.includes("ferias") &&
        (q.includes("30") || q.includes("antigo") || q.includes("revogad") || q.includes("substituid")));

    const mentions3Ideias =
      q.includes("3 ideias") ||
      q.includes("tres ideias") ||
      q.includes("5.000") ||
      q.includes("5 mil") ||
      (q.includes("inovacao") &&
        (q.includes("antigo") || q.includes("revogad") || q.includes("substituid") || q.includes("v1.0"))) ||
      (q.includes("ideias") &&
        (q.includes("quantas") ||
          q.includes("limite") ||
          q.includes("3") ||
          q.includes("tres") ||
          q.includes("6 meses") ||
          q.includes("tempo de casa")));

    if (mentions30DaysFerias) {
      const subDoc = acervo.documentos_substituidos_bloqueados.find((d) => d.codigo === "NG_111");
      if (subDoc) {
        revokedAlert = {
          codigo: `${subDoc.codigo} v${subDoc.versao} / FM_1111-001 v1.0.0`,
          versaoRevogada: `v${subDoc.versao} (Fase: Versão anterior — mesmo com data impressa até 10/06/2027)`,
          substituidoPor: subDoc.substituido_por,
          pegadinha: subDoc.diferenca_critica_pegadinha,
        };
      }
    } else if (mentions3Ideias) {
      const subDoc = acervo.documentos_substituidos_bloqueados.find((d) => d.codigo === "RG_1100");
      if (subDoc) {
        revokedAlert = {
          codigo: `${subDoc.codigo} v${subDoc.versao}`,
          versaoRevogada: `v${subDoc.versao} (Substituída em 20/10/2026)`,
          substituidoPor: subDoc.substituido_por,
          pegadinha: subDoc.diferenca_critica_pegadinha,
        };
      }
    }

    // Standard topic matching if not already populated by special cases
    if (bullets.length === 0) {
      if (
        q.includes("ng_010") ||
        q.includes("taxonomia") ||
        q.includes("desambiguacao") ||
        q.includes("vinculado_a") ||
        q.includes("1111")
      ) {
        isDeterministic = true;
        answer = `Pela Norma Mestra ${acervo.norma_mestra_taxonomia.codigo} (${acervo.norma_mestra_taxonomia.titulo} - Catálogo v${acervo.norma_mestra_taxonomia.versao_catalogo}), a governança documental exige verificação estrita do vínculo hierárquico:`;
        bullets.push(
          `**Regra de Desambiguação (${acervo.norma_mestra_taxonomia.codigo}):** ${acervo.norma_mestra_taxonomia.regra_desambiguacao}`,
          `**Exemplo prático no acervo:** \`PX_1111-001\` possui \`vinculado_a: "NG_111"\` (Série 1 - Gente e Cultura / Férias), enquanto \`PX_1130-001\` possui \`vinculado_a: "NG_1130"\` (Série 11 - Programas Institucionais / Inovação).`,
          `**Regras Gerais de Vigência:** NG/PX/GU valem por ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.NG_PX_GU}; Contratos (CTR) pelo ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.CTR}; Notas Técnicas (NT) ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.NT}; Regulamentos (RG) ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.RG}.`
        );
        addCitation("NG_111");
        addCitation("PX_1111-001");
        addCitation("NG_1130");
        addCitation("PX_1130-001");
      }

      if (q.includes("falta") || (q.includes("quantos dias") && q.includes("ferias"))) {
        isDeterministic = true;
        if (!answer)
          answer = "De acordo com a Calculadora Determinística da Tabela 1 (`TB_1111-001 v1.0.0`):";
        bullets.push(
          `**0 a 5 faltas injustificadas:** Direito a **30 dias** corridos de férias (TB_1111-001 v1.0.0 / NG_111 v3.0.0).`,
          `**6 a 14 faltas injustificadas:** Redução para **24 dias** de férias (TB_1111-001 v1.0.0).`,
          `**15 a 23 faltas injustificadas:** Redução para **18 dias** de férias (TB_1111-001 v1.0.0).`,
          `**24 a 32 faltas injustificadas:** Redução para **12 dias** de férias (TB_1111-001 v1.0.0).`,
          `**Acima de 32 faltas (33 ou mais):** **0 dias** — perda do direito às férias no período aquisitivo (TB_1111-001 v1.0.0).`
        );
        addCitation("TB_1111-001");
        addCitation("NG_111");
      }

      if (
        q.includes("ferias") ||
        q.includes("d-45") ||
        q.includes("d-30") ||
        q.includes("equipe de 9") ||
        q.includes("30%") ||
        mentions30DaysFerias
      ) {
        isDeterministic = q.includes("equipe") || q.includes("30%") || q.includes("45");
        const f = acervo.jornadas_por_tema.ferias.regras_simuladores;
        if (!answer) {
          answer =
            "Diretrizes vigentes para Férias (Série 1 - Gente e Cultura), regidas pela `NG_111 v3.0.0` (vigente desde 03/08/2026):";
        }
        bullets.push(
          `**Antecedência Obrigatória (D-45):** A solicitação formal no Portal Raiz deve ocorrer com **${f.antecedencia_minima_dias_corridos} dias corridos** de antecedência (` +
            "`FM_1111-001 v2.0.0` / `NG_111 v3.0.0`). *A NG_111 v2.0.0 (30 dias) está bloqueada como 'Versão anterior' mesmo tendo data final original até 10/06/2027!*",
          `**Cálculo para Equipe de 9 Pessoas (NG_111 item 4.6.3 / TB_1111-001 Tabela 4):** 30% de 9 = 2,7 -> arredondado para baixo = **máximo de 2 empregados em férias simultaneamente**.`,
          `**Fila de Pendências & Escalada:** O gestor Carlos tem até **7 dias corridos** para decidir no Portal Raiz. O silêncio não aprova: no 8º dia sobe automaticamente ao **Diretor da área** (que decide em **3 dias úteis**).`,
          `**Marcos D-n:** Emissão de aviso pela GGC até **D-35**; assinatura eletrônica até **D-30** (e 5 dias úteis); pagamento pela GFI até **D-3** (antecipado para dia útil anterior se cair em fim de semana/feriado — ` +
            "`NG_111 item 4.5`)."
        );
        addCitation("NG_111");
        addCitation("PX_1111-001");
        addCitation("FM_1111-001");
        addCitation("TB_1111-001");
        addCitation("FL_1111-001");
      }

      if (
        q.includes("inovacao") ||
        q.includes("ideia") ||
        q.includes("gamificacao") ||
        q.includes("18.000,01") ||
        q.includes("18000") ||
        q.includes("alcada") ||
        mentions3Ideias
      ) {
        if (q.includes("18.000") || q.includes("alcada")) isDeterministic = true;
        const ino = acervo.jornadas_por_tema.inovacao.regras_simuladores;
        if (!answer) {
          answer =
            "Diretrizes vigentes de Gestão da Inovação (Série 11) e do Programa Ideias em Campo 2027 (`RG_1100 v2.0.0` e `NT_2026-021 v1.0.0`):";
        }
        bullets.push(
          `**Comparativo de Alçada R$ 18.000,00 vs R$ 18.000,01 (\`NT_2026-021 item 4.3\` / \`NG_012\`):** Até **R$ 18.000,00** aprova o **Gerente do NIN**; a partir de **R$ 18.000,01 até R$ 120.000,00** exige aprovação do **Diretor da DIRTEC**; acima de **R$ 120.000,00** sobe ao **Comitê de Alçadas**.`,
          `**Elegibilidade 2027 (\`RG_1100 v2.0.0\`):** Exige mínimo de **${ino.elegibilidade_2027.tempo_minimo_casa_meses} meses de casa** em 01/02/2027 e limite de **${ino.elegibilidade_2027.limite_ideias_por_pessoa} ideias por pessoa** (individual ou equipe de até 4).`,
          `**Gamificação (Até 800 pts) e Prêmios Cumulativos:** Ideia elegível (100) + 5 votos (50) + Imersão (150) + Protótipo TRL 4 até 31/05 (300) + Banca Final (200) = **800 pts**. Prêmios de **R$ 8k / R$ 5k / R$ 3k** + **R$ 2k por Arena** (teto de **R$ 10.000,00** em folha).`,
          `**Orçamento 2027 (\`NT_2026-021\`) & Trava Fiscal (\`PX_1130-001\`):** Orçamento total de **R$ 96.000,00**. Trava crítica de documentação para incentivo fiscal em **31 de março**.`
        );
        addCitation("NG_1130");
        addCitation("PX_1130-001");
        addCitation("RG_1100");
        addCitation("NT_2026-021");
      }

      if (
        q.includes("locacao") ||
        q.includes("coworking") ||
        q.includes("ctr_2026") ||
        q.includes("nt_2026-018") ||
        q.includes("internet") ||
        q.includes("121,67") ||
        q.includes("rescisao") ||
        q.includes("marco") ||
        q.includes("prorrogacao") ||
        q.includes("30/03/2027")
      ) {
        isDeterministic = true;
        sigiloNivel = "Restrita";
        const loc = acervo.jornadas_por_tema.locacao.regras_simuladores;
        if (!answer) {
          answer =
            "Análise Determinística do Contrato de Locação de Coworking (`CTR_2026-012 v1.0.0` e `NT_2026-018 v1.0.0`):";
        }
        bullets.push(
          `**Radar de Prorrogação (\`30/03/2027\`):** Vigência de 150 dias corridos (` +
            "`30/11/2026` a `29/04/2027`). O pedido formal de prorrogação deve ocorrer com 30 dias de antecedência, até **30/03/2027**.",
          `**Rescisão em Março/2027 = Multa Zero (\`R$ 0,00\`):** O **90º dia** de vigência encerra-se em **27/02/2027** (até essa data a multa é de 1 aluguel = R$ 3.650,00). A partir do **91º dia (` +
            "`28/02/2027`)**, incluindo todo o mês de **março/2027**, a rescisão é **100% isenta de multa (R$ 0,00)**, bastando aviso escrito com 30 dias de antecedência.",
          `**Glosa de Internet > 4h (Fiscal GOC Rafael):** Cada dia com queda superior a 4h gera desconto de **1/30 avos = R$ ${loc.valores.desconto_diario_internet_fora_4h.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/dia** no atesto da NF.`,
          `**Cotações (\`NT_2026-018\`) e Rito Mensal:** Hub Jacarandá venceu por **R$ 3.650/mês (R$ 18.250 global)** — aprovado pela DIRAF (faixa > R$ 18k). NF até **dia 25** -> Atesto GOC em **5 dias úteis** -> Pagamento GFI até **dia 8**.`
        );
        addCitation("CTR_2026-012");
        addCitation("NT_2026-018");
      }
    }

    // Fallback default
    if (bullets.length === 0) {
      answer = `Síntese normativa do Raiz IQ para o tema **${temaAtual.toUpperCase()}** (${perfilAtual}):`;
      bullets.push(
        `**Férias (Série 1):** Antecedência de **45 dias (D-45)** na \`NG_111 v3.0.0\`, limite de **30% da equipe** (\`TB_1111-001\`) e pagamento em **D-3** antecipado se cair em fim de semana/feriado.`,
        `**Inovação (Série 11):** Até **2 ideias por pessoa** e **6 meses de casa** no \`RG_1100 v2.0.0\`, orçamento de **R$ 96.000,00** (\`NT_2026-021\`) e alçada da DIRTEC a partir de **R$ 18.000,01**.`,
        `**Locação (\`CTR_2026-012\`):** Aluguel de **R$ 3.650,00/mês**, glosa de **R$ 121,67/dia** sem internet > 4h, pedido de prorrogação até **30/03/2027** e isenção de multa a partir do **91º dia (28/02/2027)**.`
      );
      addCitation("NG_111");
      addCitation("RG_1100");
      addCitation("CTR_2026-012");
    }

    const response: ChatResponse = {
      answer,
      bullets,
      citations,
      costBadge: isDeterministic
        ? {
            type: "deterministic",
            label: "⚡ Custo: R$ 0,00 (Calculadora Determinística / Cache)",
            latencyMs: 12,
            sigiloNivel,
          }
        : {
            type: "rag_llm",
            label: "🧠 Custo: ~R$ 0,004 (RAG + LLM Curado)",
            latencyMs: 340,
            sigiloNivel,
          },
      revokedAlert,
      honestAbstention,
      rbacBlock,
      suggestedFollowups: [
        "Quero sair de férias em 05/05/2027. Qual o meu cronograma D-n?",
        "Como o prêmio é dividido em equipe no Ideias em Campo e se alguém for afastado?",
        "Se rescindirmos o contrato CTR_2026-012 em março de 2027, pagamos multa?",
        "Qual o dossiê restrito de auditoria da folha para ressarcimento D-15?",
      ],
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Erro na API de Chat:", err);
    return NextResponse.json(
      { error: "Falha ao processar consulta no acervo normativo." },
      { status: 500 }
    );
  }
}
