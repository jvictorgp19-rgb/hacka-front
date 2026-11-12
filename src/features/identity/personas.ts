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

