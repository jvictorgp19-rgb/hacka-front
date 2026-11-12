export const findings = [
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
  ];
