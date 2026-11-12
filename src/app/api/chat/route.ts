import { NextRequest, NextResponse } from "next/server";
import acervo from "@/data/acervo_estruturado_acme_bbts.json";

interface ChatResponse {
  answer: string;
  bullets: string[];
  citations: { codigo: string; titulo: string; versao: string; status: string }[];
  revokedAlert?: {
    codigo: string;
    versaoRevogada: string;
    substituidoPor: string;
    pegadinha: string;
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
    let answer = "";

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

    // 1. Check for revoked rules / pegadinhas first so we ALWAYS alert when applicable
    const mentions30DaysFerias =
      (q.includes("30 dias") && (q.includes("antecedencia") || q.includes("ferias") || q.includes("pedir") || q.includes("solicitar") || q.includes("prazo"))) ||
      q.includes("v2.0") ||
      q.includes("v1.0") && q.includes("fm_1111") ||
      (q.includes("ferias") && (q.includes("30") || q.includes("antigo") || q.includes("revogad") || q.includes("substituid")));

    const mentions3Ideias =
      q.includes("3 ideias") ||
      q.includes("tres ideias") ||
      q.includes("5.000") ||
      q.includes("5 mil") ||
      (q.includes("inovacao") && (q.includes("antigo") || q.includes("revogad") || q.includes("substituid") || q.includes("v1.0"))) ||
      (q.includes("ideias") && (q.includes("quantas") || q.includes("limite") || q.includes("3") || q.includes("tres") || q.includes("6 meses") || q.includes("tempo de casa")));

    if (mentions30DaysFerias) {
      const subDoc = acervo.documentos_substituidos_bloqueados.find((d) => d.codigo === "NG_111");
      if (subDoc) {
        revokedAlert = {
          codigo: `${subDoc.codigo} v${subDoc.versao} / FM_1111-001 v1.0.0`,
          versaoRevogada: `v${subDoc.versao} (Substituída)`,
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

    // 2. Topic matching based on strict JSON rules
    // A. Taxonomia / NG_010 / Desambiguação
    if (
      q.includes("ng_010") ||
      q.includes("taxonomia") ||
      q.includes("desambiguacao") ||
      q.includes("vinculado_a") ||
      q.includes("1111") ||
      q.includes("serie") ||
      q.includes("vigencia") && q.includes("regra")
    ) {
      answer = `Pela Norma Mestra ${acervo.norma_mestra_taxonomia.codigo} (${acervo.norma_mestra_taxonomia.titulo} - Catálogo v${acervo.norma_mestra_taxonomia.versao_catalogo}), a governança documental exige verificação estrita do vínculo hierárquico:`;
      bullets.push(
        `**Regra de Desambiguação (${acervo.norma_mestra_taxonomia.codigo}):** ${acervo.norma_mestra_taxonomia.regra_desambiguacao}`,
        `**Exemplo prático no acervo:** \`PX_1111-001\` possui \`vinculado_a: "NG_111"\` (Série 1 - Gente e Cultura / Férias), enquanto \`PX_1130-001\` possui \`vinculado_a: "NG_1130"\` (Série 11 - Programas Institucionais / Inovação).`,
        `**Regras Gerais de Vigência:** NG/PX/GU valem por ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.NG_PX_GU}; Contratos (CTR) pelo ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.CTR}; Notas Técnicas (NT) ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.NT}; Regulamentos (RG) ${acervo.norma_mestra_taxonomia.regras_gerais_vigencia.RG}.`,
        `**Regra de Aprovação Geral:** ${acervo.norma_mestra_taxonomia.regra_aprovacao_geral}`
      );
      addCitation("NG_111");
      addCitation("PX_1111-001");
      addCitation("NG_1130");
      addCitation("PX_1130-001");
    }

    // B. Férias: Faltas injustificadas
    if (q.includes("falta") || (q.includes("quantos dias") && q.includes("ferias"))) {
      if (!answer) answer = "De acordo com a tabela oficial de Faltas Injustificadas x Dias de Férias vigente:";
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

    // C. Férias: Antecedência, D-45, Prazos D-n, Fracionamento, Abono, 13º, Cancelamento/Ressarcimento
    if (
      q.includes("ferias") ||
      q.includes("d-45") ||
      q.includes("d-30") ||
      q.includes("d-20") ||
      q.includes("d-19") ||
      q.includes("abono") ||
      q.includes("13") ||
      q.includes("fracion") ||
      q.includes("ressarcimento") ||
      q.includes("30%") ||
      mentions30DaysFerias
    ) {
      const f = acervo.jornadas_por_tema.ferias.regras_simuladores;
      if (!answer) {
        answer = "Seguem as regras vigentes para Férias (Série 1 - Gente e Cultura), regidas pela NG_111 v3.0.0 e documentos vinculados:";
      }
      bullets.push(
        `**Antecedência Obrigatória (D-45):** A solicitação formal no Portal Raiz deve ocorrer em até **${f.antecedencia_minima_dias_corridos} dias corridos** antes do início do gozo (FM_1111-001 v2.0.0 / NG_111 v3.0.0). *Atenção: a regra antiga de 30 dias da NG_111 v2.0.0 foi revogada!*`,
        `**Fracionamento e Dias Vedados:** Até **${f.fracionamento.max_periodos} períodos** (1 principal de no mínimo **${f.fracionamento.min_dias_periodo_principal} dias** e demais de no mínimo **${f.fracionamento.min_dias_demais_periodos} dias**). ${f.dias_vedados_inicio} (NG_111 v3.0.0).`,
        `**Limite de Equipe (Regra de 30%):** ${f.limite_ausencia_simultanea_equipe.regra} Ex.: 1 a 6 empregados = máx. 1; 7 a 9 = máx. 2; 10 a 13 = máx. 3 (TB_1111-001 v1.0.0).`,
        `**Fluxo de Aprovação e Marcos D-n:** Gestor decide em até **7 dias corridos** (se silenciar, sobe ao Diretor da área que decide em **3 dias úteis**). GGC emite aviso até **D-35**; Empregado assina eletronicamente até **D-30** (e em até 5 dias úteis); GFI paga até **D-3** (PX_1111-001 v1.0.0 / FL_1111-001 v1.0.0).`,
        `**Abono Pecuniário e 13º Salário:** Abono de até 1/3 (10 dias) deve ser pedido até **15 dias antes do fim do período aquisitivo**. Adiantamento de 13º deve ser pedido entre **1º e 31 de janeiro** para o 1º período do ano (FM_1111-001 v2.0.0).`,
        `**Alteração, Cancelamento e Ressarcimento:** Pelo empregado até **D-20** (1 vez por período com anuência do gestor). A partir de **D-19**, apenas por necessidade de serviço autorizada pelo **Diretor da área**, com ressarcimento de despesas comprovadas em até **15 dias corridos**, limitado ao teto de **R$ 2.500,00** (NG_111 v3.0.0).`
      );
      addCitation("NG_111");
      addCitation("PX_1111-001");
      addCitation("FM_1111-001");
      addCitation("TB_1111-001");
      addCitation("FL_1111-001");
    }

    // D. Inovação: Ideias em Campo, Elegibilidade, Gamificação, Orçamento, Alçadas, Incentivo Fiscal
    if (
      q.includes("inovacao") ||
      q.includes("ideia") ||
      q.includes("gamificacao") ||
      q.includes("ponto") ||
      q.includes("premio") ||
      q.includes("premiacao") ||
      q.includes("orcamento") ||
      q.includes("96.000") ||
      q.includes("96 mil") ||
      q.includes("incentivo fiscal") ||
      q.includes("31/03") ||
      q.includes("31 de marco") ||
      q.includes("prototip") ||
      q.includes("trl") ||
      q.includes("arena") ||
      q.includes("imersao") ||
      mentions3Ideias
    ) {
      const ino = acervo.jornadas_por_tema.inovacao.regras_simuladores;
      if (!answer) {
        answer = "Seguem as diretrizes vigentes de Gestão da Inovação (Série 11) e do Programa Ideias em Campo - Edição 2027:";
      }
      bullets.push(
        `**Elegibilidade Vigente (RG_1100 v2.0.0):** Exige mínimo de **${ino.elegibilidade_2027.tempo_minimo_casa_meses} meses de casa** na data de referência (01/02/2027) e permite no máximo **${ino.elegibilidade_2027.limite_ideias_por_pessoa} ideias por pessoa** (individual ou em equipe de até ${ino.elegibilidade_2027.tamanho_max_equipe} pessoas). *A regra antiga da v1.0.0 que permitia 3 ideias sem tempo mínimo de casa está revogada!*`,
        `**Gamificação (Até 800 pontos - RG_1100 v2.0.0):** Ideia elegível inscrita (**100 pts**) + Votação interna (**até 50 pts**, sendo 10 pts/voto em até 5 ideias de terceiros) + Imersão completa (**150 pts**) + Protótipo entregue no prazo até 31/05/2027 com TRL mín. 4 (**300 pts**) + Chegada à banca final (**200 pts**).`,
        `**Premiação Cumulativa em Folha (RG_1100 v2.0.0 / NT_2026-021 v1.0.0):** Geral por colocação: **1º lugar R$ 8.000,00** | **2º lugar R$ 5.000,00** | **3º lugar R$ 3.000,00**. Destaques por Arena (Operação de Campo, Tecnologia, Pessoas, Sustentabilidade): **+ R$ 2.000,00 cumulativos** (teto máximo possível de **R$ 10.000,00** para 1º geral + destaque de arena). Pago em folha em até 30 dias.`,
        `**Orçamento 2027 (NT_2026-021 v1.0.0):** Total de **R$ 96.000,00**, distribuído em: Kits de prototipagem (**R$ 36.000 / 37,5%**), Imersão (**R$ 30.000 / 31,3%**), Premiação colocação (**R$ 16.000 / 16,7%**), Premiação arenas (**R$ 8.000 / 8,3%**) e Comunicação (**R$ 6.000 / 6,3%**).`,
        `**Alçadas de Prototipagem (NT_2026-021 / NG_012):** Até **R$ 18.000,00** = **Gerente do NIN**; de **R$ 18.000,01 a R$ 120.000,00** = **Diretor da DIRTEC**; acima de **R$ 120.000,00** = **Comitê de Alçadas**.`,
        `**Trava Crítica de Incentivo Fiscal (PX_1130-001 v1.0.0):** Até **31/01** publicação da Tese de Inovação; até **31 de março (TRAVA CRÍTICA)** consolidação do relatório técnico-financeiro pelo NIN e DIRAF (projetos sem documentação até 31/03 ficam fora do ciclo do ano); até **31/07** declaração pela DIRAF.`,
        `**Dedicação e Propriedade Intelectual (NG_1130 v1.0.0):** Liberação integral na semana de imersão (05 a 09/04/2027) e até **4h semanais** no protótipo (TRL 4 em 60 dias) e MVP (TRL 6 em 120 dias). O empregado mantém a autoria moral e a ACME detém os direitos patrimoniais.`
      );
      addCitation("NG_1130");
      addCitation("PX_1130-001");
      addCitation("RG_1100");
      addCitation("NT_2026-021");
    }

    // E. Locação Coworking: Contrato CTR_2026-012 e NT_2026-018
    if (
      q.includes("locacao") ||
      q.includes("coworking") ||
      q.includes("ctr_2026") ||
      q.includes("nt_2026-018") ||
      q.includes("internet") ||
      q.includes("desconto") ||
      q.includes("121,67") ||
      q.includes("121.67") ||
      q.includes("rescisao") ||
      q.includes("multa") ||
      q.includes("aditivo") ||
      q.includes("cotac") ||
      q.includes("jacaranda") ||
      q.includes("vale azul") ||
      q.includes("atesto") ||
      q.includes("nota fiscal") ||
      q.includes("aluguel") ||
      q.includes("vistoria")
    ) {
      const loc = acervo.jornadas_por_tema.locacao.regras_simuladores;
      if (!answer) {
        answer = "Seguem as regras contratuais e operacionais da Locação de Espaço de Coworking (CTR_2026-012 v1.0.0 e NT_2026-018 v1.0.0):";
      }
      bullets.push(
        `**Objeto e Vigência (CTR_2026-012 v1.0.0):** Locação com a **${loc.locadora}** (${loc.local}) de **8 estações de trabalho + 1 sala de reunião (até 40h/mês) + internet 500 Mbps + acesso 24h**. Vigência de **150 dias corridos** (**30/11/2026 a 29/04/2027**), com vistoria obrigatória pela GOC até **25/11/2026**.`,
        `**Valores e Alçada de Contratação (NT_2026-018 v1.0.0):** Aluguel mensal de **R$ 3.650,00** e valor global de **R$ 18.250,00 (5 meses)**. Por superar R$ 18.000,00, enquadra-se na alçada da **DIRAF** (R$ 18.000,01 a R$ 120.000,00 conforme NG_012).`,
        `**Glosa / Desconto por Queda de Internet (CTR_2026-012 v1.0.0):** Cada dia com interrupção de internet superior a **4 horas** gera desconto automático de **1/30 avos (R$ 121,67 por dia)** no Atesto Técnico do Fiscal GOC.`,
        `**Multa de Rescisão e Aditivos (CTR_2026-012 v1.0.0):** Rescisão antecipada exige aviso com 30 dias. **Até o 90º dia de vigência:** multa de **1 mensalidade (R$ 3.650,00)**; **a partir do 91º dia:** **R$ 0,00 (isento de multa)**. Prorrogação (máx. 24 meses) deve ser pedida até **30/03/2027**; aditivo de valor é limitado a **20% do global (R$ 3.650,00)** com análise da GJU.`,
        `**Rotina Mensal de Pagamento (CTR_2026-012 v1.0.0):** **Até dia 25:** Locadora envia NF à GCO -> **Até 5 dias úteis:** Fiscal GOC confere SLA/internet e assina o **Atesto** (sem atesto não há pagamento e não há multa para ACME) -> **Até dia 8 do mês de uso:** GFI efetua o pagamento.`,
        `**Comparativo das 3 Cotações (NT_2026-018 v1.0.0):** 1º **Hub Jacarandá (Vencedor):** R$ 3.650/mês (R$ 18.250 total); 2º **Espaço Ipanema Verde:** R$ 3.900/mês (R$ 19.500 total, +R$ 1.250); 3º **Centro Empresarial Colmeia:** R$ 4.200/mês (R$ 21.000 total, +R$ 2.750).`
      );
      addCitation("CTR_2026-012");
      addCitation("NT_2026-018");
    }

    // F. Alçadas Financeiras NG_012 general question
    if (q.includes("alcada") || q.includes("ng_012") || q.includes("18.000") || q.includes("120.000") || q.includes("quem aprova")) {
      if (!answer) {
        answer = "Conforme a tabela de Alçadas Financeiras (NG_012) aplicada aos instrumentos e protótipos da ACME/BBTS:";
      }
      bullets.push(
        `**Até R$ 18.000,00:** Aprovação Geral por **Gerente** | Em protótipos de Inovação: **Gerente do NIN** (NG_012 / NT_2026-021 v1.0.0).`,
        `**De R$ 18.000,01 a R$ 120.000,00:** Aprovação Geral por **Diretor (DIRAF / DIRTEC)** — faixa aplicável ao contrato de coworking CTR_2026-012 de R$ 18.250,00 | Em protótipos de Inovação: **Diretor da DIRTEC** (NG_012 / NT_2026-018 / NT_2026-021).`,
        `**Acima de R$ 120.000,00:** Aprovação exclusiva pelo **Comitê de Alçadas** (NG_012).`
      );
      addCitation("NT_2026-021");
      addCitation("NT_2026-018");
    }

    // Fallback if question is generic: tailor to current active theme & profile
    if (bullets.length === 0) {
      if (temaAtual === "ferias") {
        answer = `Resumo executivo para a jornada de **Férias (Série 1)** no perfil atual (${perfilAtual || "Geral"}):`;
        bullets.push(
          `**Antecedência D-45 (NG_111 v3.0.0 / FM_1111-001 v2.0.0):** Solicitação formal no Portal Raiz até 45 dias corridos antes do gozo (a regra antiga de 30 dias da v2.0.0 foi revogada).`,
          `**Prazos Críticos (PX_1111-001 v1.0.0 / TB_1111-001 v1.0.0):** Decisão do gestor em até 7 dias corridos (escalada ao Diretor em 3 dias úteis se sem resposta); emissão do aviso pela GGC até D-35; assinatura eletrônica até D-30; pagamento pela GFI até D-3.`,
          `**Limites e Regras (TB_1111-001 v1.0.0):** Teto de **30% da equipe** ausente simultaneamente; fracionamento em até 3 períodos (1º >= 14 dias, demais >= 5 dias); ressarcimento por cancelamento a serviço a partir de D-19 limitado a **R$ 2.500,00**.`
        );
        addCitation("NG_111");
        addCitation("PX_1111-001");
        addCitation("FM_1111-001");
        addCitation("TB_1111-001");
      } else if (temaAtual === "inovacao") {
        answer = `Resumo executivo para a jornada de **Inovação - Ideias em Campo 2027 (Série 11)**:`;
        bullets.push(
          `**Elegibilidade e Submissão (RG_1100 v2.0.0):** Mínimo de **6 meses de casa** em 01/02/2027 e limite de **2 ideias por pessoa** (a regra antiga de 3 ideias da v1.0.0 foi revogada). Inscrições de 01/02 a 28/02/2027.`,
          `**Gamificação e Prêmios (RG_1100 v2.0.0 / NT_2026-021 v1.0.0):** Até **800 pontos** na jornada completa. Prêmios de **R$ 8k (1º), R$ 5k (2º), R$ 3k (3º)** + **R$ 2k cumulativos por Arena** (teto de R$ 10.000,00 em folha).`,
          `**Orçamento e Trava Fiscal (NT_2026-021 / PX_1130-001 v1.0.0):** Orçamento 2027 de **R$ 96.000,00**. Trava crítica de documentação para incentivo fiscal em **31 de março**.`
        );
        addCitation("NG_1130");
        addCitation("PX_1130-001");
        addCitation("RG_1100");
        addCitation("NT_2026-021");
      } else {
        answer = `Resumo executivo para **Locação de Coworking (CTR_2026-012 / NT_2026-018)**:`;
        bullets.push(
          `**Escopo e Valor (CTR_2026-012 v1.0.0):** Hub Jacarandá (Vale Azul) — 8 estações + 1 sala de reunião + link 500 Mbps por **R$ 3.650,00/mês** (**R$ 18.250,00** por 150 dias, de 30/11/2026 a 29/04/2027).`,
          `**Glosa de SLA e Rescisão (CTR_2026-012 v1.0.0):** Queda de internet > 4h desconta **R$ 121,67/dia** no atesto da GOC. Rescisão até o 90º dia tem multa de **R$ 3.650,00**; a partir do **91º dia é isenta (R$ 0,00)**.`,
          `**Rito de Pagamento e Prorrogação:** NF até dia 25 -> Atesto GOC em 5 dias úteis -> Pagamento GFI até dia 8. Pedido de prorrogação deve ser formalizado até **30/03/2027** (aditivo limitado a 20% = R$ 3.650,00).`
        );
        addCitation("CTR_2026-012");
        addCitation("NT_2026-018");
      }
    }

    const suggestedFollowups = [
      "Posso pedir férias com 30 dias de antecedência?",
      "Posso inscrever 3 ideias no Ideias em Campo 2027?",
      "Qual o desconto se a internet do coworking cair por mais de 4h?",
      "Como funciona a desambiguação do campo vinculado_a na NG_010?",
    ];

    const response: ChatResponse = {
      answer,
      bullets,
      citations,
      revokedAlert,
      suggestedFollowups,
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
