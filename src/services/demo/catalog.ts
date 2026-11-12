import acervo from '@/data/acervo_estruturado_acme_bbts.json';
import evidence from './evidence.json';
import { documentSchema, factSchema } from '@/contracts/models';

// Curated synthetic fixtures, not a document ingestion pipeline.
export const demoFacts = evidence.map((f) => factSchema.parse(f));
const files: Record<string, string> = {
  NG_111: 'NG_111__FERIAS',
  'PX_1111-001': 'PX_1111-001__PROCEDIMENTO_DE_FERIAS',
  'FM_1111-001': 'FM_1111-001__SOLICITACAO_DE_FERIAS',
  'TB_1111-001': 'TB_1111-001__TABELAS_DE_FERIAS',
  'FL_1111-001': 'FL_1111-001__FLUXOGRAMA_DE_FERIAS',
  NG_1130: 'NG_1130__GESTAO_DA_INOVACAO',
  'PX_1130-001': 'PX_1130-001__FUNIL_DE_INOVACAO',
  RG_1100: 'RG_1100__PROGRAMA_IDEIAS_EM_CAMPO',
  'NT_2026-021': 'NT_2026-021__ORCAMENTO_E_COMPETENCIAS_IDEIAS_EM_CAMPO',
  'CTR_2026-012': 'CTR_2026-012__LOCACAO_DE_ESPACO_DE_COWORKING',
  'NT_2026-018': 'NT_2026-018__CONTRATACAO_DE_COWORKING',
};
export const demoDocuments = [
  ...acervo.documentos_acervo,
  ...acervo.documentos_substituidos_bloqueados,
].map((doc) => {
  const tema = ['NG_111', 'PX_1111-001', 'FM_1111-001', 'TB_1111-001', 'FL_1111-001'].includes(
    doc.codigo,
  )
    ? 'ferias'
    : ['CTR_2026-012', 'NT_2026-018'].includes(doc.codigo)
      ? 'locacao'
      : 'inovacao';
  const missing = !doc.vigente && doc.codigo === 'RG_1100';
  const summary =
    'resumo_legal_design' in doc
      ? doc.resumo_legal_design?.o_que_e || doc.titulo
      : 'diferenca_critica_pegadinha' in doc
        ? doc.diferenca_critica_pegadinha
        : doc.titulo;
  return documentSchema.parse({
    id: doc.codigo + '@' + doc.versao,
    codigo: doc.codigo,
    titulo: doc.titulo,
    versao: doc.versao,
    fase: doc.fase,
    vigente: doc.vigente,
    tema,
    area: tema === 'ferias' ? 'GGC' : tema === 'locacao' ? 'GCO' : 'NIN',
    camada: doc.codigo.split('_')[0],
    resumo: summary,
    fileUrl: missing
      ? undefined
      : `/docs_acervo/${doc.vigente ? 'vigentes' : 'substituidos'}/${files[doc.codigo]}__v${doc.versao}.pdf`,
    substitui: 'substitui' in doc ? doc.substitui : undefined,
    vigencia:
      'vigencia_inicio' in doc
        ? `${doc.vigencia_inicio} a ${doc.vigencia_fim || 'consultar instrumento'}`
        : 'Versão anterior; consultar substituição',
  });
});

export const historicalVacationCitation = {
  id: 'ferias-previous-rule',
  documentId: 'NG_111@2.0.0',
  codigo: 'NG_111',
  titulo: 'Férias (versão anterior)',
  versao: '2.0.0',
  status: 'Versão anterior',
  item: '2.3',
  page: 1,
  trecho: 'A solicitação deve ser feita com antecedência mínima de 30 dias.',
  url: '/docs_acervo/substituidos/NG_111__FERIAS__v2.0.0.pdf',
};
