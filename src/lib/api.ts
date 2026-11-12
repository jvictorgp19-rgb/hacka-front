import { createHttpGateway } from "@/services/http/client";
import acervo from "@/data/acervo_estruturado_acme_bbts.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type RbacLevel = "Pública" | "Interna" | "Restrita" | "Sigilosa";

export interface PersonaNominal {
  id: string;
  nome: string;
  papel: string;
  unidade: string;
  rbac: RbacLevel;
  temaPadrao: "ferias" | "inovacao" | "locacao";
  perfilChave: string;
  avatarSigla: string;
  descricaoZeroClick: string;
  alertasProativos: string[];
}

export const PERSONAS_NOMINAIS: PersonaNominal[] = [
  {
    id: "ana",
    nome: "Ana",
    papel: "Analista / Empregada",
    unidade: "Operações / Portal Raiz",
    rbac: "Interna",
    temaPadrao: "ferias",
    perfilChave: "empregado",
    avatarSigla: "AN",
    descricaoZeroClick:
      "Planeja férias para 05/05/2027 e precisa validar a mudança da NG_111 v2.0.0 (30 dias) para a v3.0.0 (45 dias) e antecipação do pagamento em feriado/domingo.",
    alertasProativos: [
      "Férias pretendidas em 05/05/2027: solicitar até 21/03/2027 (D-45) no Portal Raiz.",
      "Pagamento D-3 cairia em 02/05/2027 (domingo) -> antecipa para sexta-feira 30/04/2027 (NG_111 4.5).",
    ],
  },
  {
    id: "carlos",
    nome: "Carlos",
    papel: "Gestor - Equipe de 9",
    unidade: "Gerência Operacional",
    rbac: "Interna",
    temaPadrao: "ferias",
    perfilChave: "gestor",
    avatarSigla: "CA",
    descricaoZeroClick:
      "Lidera equipe de 9 pessoas (teto simultâneo de 2 em férias = 30% arredondado para baixo) e monitora a fila de pendências com SLA de 7 dias corridos antes de escalar ao Diretor.",
    alertasProativos: [
      "Teto da equipe (9 pessoas): máx. 2 ausentes simultâneos (30% = 2,7 -> 2 | TB_1111-001 Tabela 4).",
      "SLA de Pendências: 2 pedidos aguardando decisão (escalada automática ao Diretor em 7 dias corridos).",
    ],
  },
  {
    id: "marina",
    nome: "Marina",
    papel: "Proponente - Ideias em Campo",
    unidade: "Operações de Campo / NIN",
    rbac: "Interna",
    temaPadrao: "inovacao",
    perfilChave: "empregado",
    avatarSigla: "MA",
    descricaoZeroClick:
      "Submete projeto em equipe no Ideias em Campo 2027 (limite de 2 ideias, mín. 6 meses de casa), acumula até 800 pts na gamificação e consulta regras não previstas (Abstenção Honesta).",
    alertasProativos: [
      "Inscrições Edição 2027: 01/02/2027 a 28/02/2027 (máx. 2 ideias por CPF, individual ou equipe).",
      "Dúvida sobre divisão de prêmio em equipe ou afastamento? Acione a Abstenção Honesta -> NIN.",
    ],
  },
  {
    id: "rafael",
    nome: "Rafael",
    papel: "Fiscal Técnico - GOC",
    unidade: "GOC (Gerência de Operações de Campo)",
    rbac: "Restrita",
    temaPadrao: "locacao",
    perfilChave: "fiscal_tecnico_goc",
    avatarSigla: "RF",
    descricaoZeroClick:
      "Fiscaliza o coworking em Vale Azul (CTR_2026-012), aplica glosa de R$ 121,67/dia se internet cair > 4h e monitora o Radar de Prorrogação (30/03/2027) e isenção de multa após o 90º dia (28/02/2027).",
    alertasProativos: [
      "Radar CTR_2026-012: Pedido de prorrogação deve ser formalizado até 30/03/2027.",
      "Marco de Isenção de Multa: 90º dia = 27/02/2027; a partir do 91º dia (28/02/2027) rescisão é R$ 0,00.",
    ],
  },
  {
    id: "diretora_diraf",
    nome: "Diretora da DIRAF",
    papel: "Executiva - Alçada Diretoria",
    unidade: "DIRAF / DIRTEC (Alta Administração)",
    rbac: "Sigilosa",
    temaPadrao: "inovacao",
    perfilChave: "nin_cin_diretoria",
    avatarSigla: "DF",
    descricaoZeroClick:
      "Decide alçadas entre R$ 18.000,01 e R$ 120.000,00 (como o contrato CTR_2026-012 de R$ 18.250,00 e protótipos acima de R$ 18k), fecha a trava fiscal de 31/03 e gera PPT executivo em 1 clique.",
    alertasProativos: [
      "Alçada de R$ 18.000,01 atingida: exige aprovação de Diretor (NT_2026-021 item 4.3 / NG_012).",
      "Trava Crítica de Incentivo Fiscal em 31/03: consolidar dossiê técnico-financeiro com o NIN.",
    ],
  },
  {
    id: "curadora_ggc",
    nome: "Curadora da GGC",
    papel: "Dona do Domínio / Data Mesh",
    unidade: "GGC (Gerência de Gente e Cultura)",
    rbac: "Sigilosa",
    temaPadrao: "ferias",
    perfilChave: "ggc_gfi",
    avatarSigla: "CG",
    descricaoZeroClick:
      "Governa o domínio de Gente e Cultura (Série 1), audita a Arquitetura Medalhão (Bronze -> Silver -> Gold), trata pedidos de acesso RBAC emitindo Resposta Curada sem expor documentos restritos.",
    alertasProativos: [
      "1 Solicitação de Acesso RBAC pendente de Ana -> responder via 'RESPOSTA CURADA' sem abrir o PDF.",
      "Auditor Medalhão detectou 2 alertas temporais cruzados nos PDFs da Série 11 (Inovação).",
    ],
  },
];

export interface AccessRequestItem {
  id: string;
  solicitante: string;
  papelSolicitante: string;
  dominioDono: string;
  documentoAlvo: string;
  perguntaOriginal: string;
  nivelExigido: RbacLevel;
  status: "Pendente" | "Aprovado via Resposta Curada" | "Acesso Total Concedido";
  respostaCurada?: string;
  timestampSolicitacao: string;
  timestampDecisao?: string;
  aprovadoPor?: string;
}

export interface RadarEvent {
  id: string;
  dataLimite: string;
  titulo: string;
  documento: string;
  responsavel: string;
  criticidade: "Crítica" | "Alta" | "Normal";
  detalhe: string;
}

export interface IngestAuditFinding {
  id: string;
  camada: "Bronze (Raw PDF)" | "Silver (Validated Chunk)" | "Gold (Curated Graph)";
  severidade: "Inconsistência Temporal" | "Documento Referenciado Ausente" | "Conflito de Vigência";
  documentosEnvolvidos: string[];
  descricao: string;
  acaoRecomendada: string;
}

// Helper for resilient fetch to FastAPI with immediate local fallback
async function fetchWithFallback<T>(
  endpoint: string,
  options: RequestInit | undefined,
  fallbackFn: () => T | Promise<T>
): Promise<{ data: T; source: "fastapi" | "local_fallback" }> {
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = (await res.json()) as T;
        return { data: json, source: "fastapi" };
      }
    } catch {
      // Fallback silently to local deterministic engine
    }
  }
  const fallbackData = await fallbackFn();
  return { data: fallbackData, source: "local_fallback" };
}

// 1. /chat client
export async function apiChat(payload: {
  message: string;
  tema: string;
  perfil: string;
  personaId?: string;
}) {
  return fetchWithFallback(
    "/chat",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async () => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    }
  );
}

// 2. /docs client
export async function apiDocs(tema?: string) {
  return fetchWithFallback("/docs", { method: "GET" }, () => ({
    vigentes: acervo.documentos_acervo,
    substituidos: acervo.documentos_substituidos_bloqueados,
    taxonomia: acervo.norma_mestra_taxonomia,
    temaFiltro: tema || "todos",
  }));
}

// 3. /radar client
export async function apiRadar(): Promise<{ data: RadarEvent[]; source: "fastapi" | "local_fallback" }> {
  if (process.env.NEXT_PUBLIC_DATA_MODE === "api") {
    const events = await createHttpGateway(process.env.NEXT_PUBLIC_API_URL || "").deadlines();
    return { source: "fastapi", data: events.map(event => ({
      id: event.id, dataLimite: event.date, titulo: event.title, documento: event.fact.citation.codigo,
      responsavel: event.owner, criticidade: event.priority, detalhe: event.detail,
    })) };
  }
  return fetchWithFallback("/radar", { method: "GET" }, () => [
    {
      id: "rad-1",
      dataLimite: "25/11/2026",
      titulo: "Vistoria Obrigatória do Coworking (D-5 do contrato)",
      documento: "CTR_2026-012 v1.0.0",
      responsavel: "Rafael (Fiscal Técnico GOC)",
      criticidade: "Alta",
      detalhe:
        "Assinar Termo de Vistoria verificando 8 estações com chave, sala de 10 lugares com projetor, link 500 Mbps e crachás 24h.",
    },
    {
      id: "rad-2",
      dataLimite: "27/02/2027 vs 28/02/2027",
      titulo: "Virada de Isenção de Multa Rescisória (90º -> 91º dia)",
      documento: "CTR_2026-012 v1.0.0 (Cláusula de Rescisão)",
      responsavel: "GCO / Rafael (GOC)",
      criticidade: "Alta",
      detalhe:
        "90º dia de vigência = 27/02/2027 (multa R$ 3.650,00). A partir do 91º dia em 28/02/2027 (ex: rescisão em março/2027) a multa cai para R$ 0,00 com aviso prévio de 30 dias.",
    },
    {
      id: "rad-3",
      dataLimite: "30/03/2027",
      titulo: "Data-Limite para Pedido de Prorrogação Contratual (D-30 do fim)",
      documento: "CTR_2026-012 v1.0.0",
      responsavel: "Gestor GCO / Fiscal GOC",
      criticidade: "Crítica",
      detalhe:
        "Último dia para formalizar prorrogação (30 dias antes do término em 29/04/2027), respeitando teto de 24 meses e aditivo máx. de 20% (R$ 3.650,00).",
    },
    {
      id: "rad-4",
      dataLimite: "31/03/2027",
      titulo: "TRAVA CRÍTICA — Consolidação de Incentivo Fiscal",
      documento: "PX_1130-001 v1.0.0 / NG_1130 v1.0.0",
      responsavel: "NIN & Diretora da DIRAF",
      criticidade: "Crítica",
      detalhe:
        "Projetos de inovação sem documentação técnica e financeira consolidada até 31/03 ficam bloqueados fora do ciclo anual de incentivo fiscal.",
    },
  ]);
}

// 4. /access client
export async function apiAccessList(): Promise<{
  data: AccessRequestItem[];
  source: "fastapi" | "local_fallback";
}> {
  return fetchWithFallback("/access", { method: "GET" }, () => [
    {
      id: "REQ-2026-089",
      solicitante: "Ana (Analista / Empregada)",
      papelSolicitante: "Empregada - RBAC Interna",
      dominioDono: "GGC (Gerência de Gente e Cultura)",
      documentoAlvo: "Dossiê Restrito de Exceções de Ressarcimento & Folha (GGC/GFI)",
      perguntaOriginal:
        "Qual o detalhamento interno de auditoria da folha para ressarcimento de passagens não reembolsáveis canceladas em D-15 e histórico nominal da equipe?",
      nivelExigido: "Restrita",
      status: "Pendente",
      timestampSolicitacao: "12/11/2026 11:42:10",
    },
  ]);
}

// 5. /reports client
export async function apiGenerateReport(tema: string) {
  return fetchWithFallback(
    "/reports",
    {
      method: "POST",
      body: JSON.stringify({ tema }),
    },
    () => ({
      tituloDeck: "Apresentação Executiva — Programa Ideias em Campo (Edição 2027)",
      subtitulo: "Gerado via Raiz IQ Zero-Click • Fontes: RG_1100 v2.0.0, NT_2026-021 v1.0.0, NG_1130 v1.0.0",
      geradoEm: new Date().toLocaleString("pt-BR"),
      slides: [
        {
          numero: 1,
          titulo: "Orçamento Oficial 2027 (R$ 96.000,00) & Histórico 2026",
          destaque: "Conversão histórica de 17,8% (118 ideias -> 21 protótipos em 2026)",
          itens: [
            "Kits de Prototipagem: R$ 36.000,00 (37,5% do orçamento)",
            "Semana de Imersão: R$ 30.000,00 (31,3% do orçamento)",
            "Premiação Geral (1º R$ 8k, 2º R$ 5k, 3º R$ 3k): R$ 16.000,00 (16,7%)",
            "Premiação Destaques por Arena (4 arenas x R$ 2.000): R$ 8.000,00 (8,3%)",
            "Comunicação Institucional: R$ 6.000,00 (6,3%)",
          ],
          rodapeCitacao: "Fonte auditada: NT_2026-021 v1.0.0 (Itens 2.1 e 3.2) aprovada pela DIRAF em 16/10/2026.",
        },
        {
          numero: 2,
          titulo: "Calendário das 7 Fases (01/02 a 30/06/2027) & Elegibilidade",
          destaque: "Redução de 3 para 2 ideias por pessoa + mínimo de 6 meses de casa",
          itens: [
            "Fase 1 (Inscrição): 01/02/2027 a 28/02/2027 nas 4 Arenas (Operação, Tecnologia, Pessoas, Sustentabilidade)",
            "Fase 2 (Triagem NIN): Até 12/03/2027 | Fase 3 (Votação Interna - Top 20, máx 6/arena): 15/03 a 26/03/2027",
            "Fase 4 (Imersão presencial/integral): 05/04/2027 a 09/04/2027",
            "Fase 5 (Prototipagem TRL >= 4 com 4h/semana liberadas): 12/04/2027 a 31/05/2027",
            "Fase 6 (Banca Final - 5 membros sendo 1 DIRAF): 15/06/2027 | Fase 7 (Premiação em folha): 30/06/2027",
          ],
          rodapeCitacao: "Fonte auditada: RG_1100 v2.0.0 (aprovado pela DIRTEC em 20/10/2026, substitui RG_1100 v1.0.0).",
        },
        {
          numero: 3,
          titulo: "Matriz de Alçadas de Prototipagem (NG_012) & Trava Fiscal (31/03)",
          destaque: "R$ 18.000,00 vs R$ 18.000,01: gatilho imediato de Diretoria",
          itens: [
            "Até R$ 18.000,00 por protótipo: Aprovação pelo Gerente do NIN",
            "De R$ 18.000,01 a R$ 120.000,00: Aprovação pelo Diretor da DIRTEC (NT_2026-021 item 4.3)",
            "Acima de R$ 120.000,00: Aprovação pelo Comitê de Alçadas",
            "Ciclo de Incentivo Fiscal (PX_1130-001): Tese até 31/01 -> TRAVA CRÍTICA de documentação em 31/03 -> Declaração DIRAF até 31/07",
          ],
          rodapeCitacao: "Fonte auditada: NT_2026-021 v1.0.0 (Item 4.3), PX_1130-001 v1.0.0 e NG_1130 v1.0.0.",
        },
      ],
    })
  );
}

// 6. /ingest client (Medallion Architecture & Temporal Inconsistency Auditor)
export async function apiIngestAudit(): Promise<{
  data: IngestAuditFinding[];
  source: "fastapi" | "local_fallback";
}> {
  return fetchWithFallback("/ingest", { method: "GET" }, () => [
    {
      id: "AUD-TEMP-01",
      camada: "Silver (Validated Chunk)",
      severidade: "Inconsistência Temporal",
      documentosEnvolvidos: ["NG_1130 v1.0.0 (06/07/2026)", "NT_2026-021 v1.0.0 (14/10/2026)"],
      descricao:
        "A norma NG_1130 (vigente desde 06/07/2026) faz referência à Nota Técnica NT_2026-021, que só foi assinada em 14/10/2026 e aprovada em 16/10/2026 (anacronismo retroativo no PDF bruto).",
      acaoRecomendada:
        "Camada Gold preserva ambos vigentes, mas vincula a alçada financeira de 2027 à data de aprovação da NT_2026-021 (16/10/2026).",
    },
    {
      id: "AUD-TEMP-02",
      camada: "Silver (Validated Chunk)",
      severidade: "Inconsistência Temporal",
      documentosEnvolvidos: ["NT_2026-021 v1.0.0 (16/10/2026)", "RG_1100 v2.0.0 (20/10/2026)"],
      descricao:
        "A Nota Técnica NT_2026-021 (aprovada em 16/10/2026) cita como 'vinculado_a' o Regulamento RG_1100 v2.0.0, cuja aprovação formal ocorreu 4 dias depois (20/10/2026).",
      acaoRecomendada:
        "Sinalizar na trilha de auditoria da Série 11 para alinhamento de datas de publicação pelo NIN.",
    },
    {
      id: "AUD-TEMP-03",
      camada: "Gold (Curated Graph)",
      severidade: "Conflito de Vigência",
      documentosEnvolvidos: ["NG_111 v2.0.0 (até 10/06/2027)", "NG_111 v3.0.0 (desde 03/08/2026)"],
      descricao:
        "O cabeçalho da NG_111 v2.0.0 exibia vigência original de 10/12/2025 a 10/06/2027, o que induziria um RAG ingênuo a considerá-la válida em 2026/2027. Porém o campo 'fase: Versão anterior' e 'substitui: NG_111 v2.0.0' na v3.0.0 revogam a v2.0.0 em 03/08/2026.",
      acaoRecomendada:
        "Quarentena automática na Camada Silver: bloquear chunks de documentos com 'vigente: false' no índice principal.",
    },
    {
      id: "AUD-MISS-04",
      camada: "Bronze (Raw PDF)",
      severidade: "Documento Referenciado Ausente",
      documentosEnvolvidos: ["NG_010 (Taxonomia)", "NG_012 (Alçadas)"],
      descricao:
        "Os PDFs físicos da NG_010 e da NG_012 são referenciados em todos os documentos do acervo, mas não estão anexados na pasta de PDFs brutos — existem apenas como metadados estruturados de governança.",
      acaoRecomendada:
        "Acionar Abstenção Honesta quando o usuário pedir cláusulas textuais completas da NG_010/NG_012 fora das tabelas extraídas.",
    },
  ]);
}
