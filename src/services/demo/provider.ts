import simulationSources from './simulation-sources.json';
import { ApiError, type AnalysisContext, type Answer } from '@/contracts/models';
import type { AppGateway } from '@/services/gateway';
import { demoDocuments, demoFacts, historicalVacationCitation } from './catalog';
import { findings } from './findings';
import { readDemo, writeDemo, resetDemo } from './storage';

export const demoSuggestions = [
  'Quero férias em 05/05/2027. Qual o prazo?',
  'Não eram 30 dias para pedir férias?',
  'Equipe de 9: quantos podem sair juntos?',
  'Quem aprova R$ 18.000,01 em protótipo?',
  'Se rescindir o contrato em março, há multa?',
  'Como dividir o prêmio em equipe?',
  'Preciso de acesso à auditoria restrita da folha.',
  'Qual o limite de ideias por pessoa?',
];
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
export function demoAnswer(query: string, context: AnalysisContext): Answer {
  const q = normalize(query);
  let ids: string[] = [];
  let status: Answer['status'] = 'answered';
  let text = '';
  if (/restrit|sigilos|auditoria.*folha/.test(q)) {
    status = 'access_required';
    text =
      'Este cenário requer uma orientação da GGC. Registre um pedido com justificativa. A demo não concede acesso real.';
  } else if (/rateio|divisao|dividir|afastad/.test(q) || (/premio/.test(q) && /equipe/.test(q))) {
    ids = ['inovacao-rateio'];
    status = 'abstained';
    text = 'A divisão do prêmio não está definida nesta fonte. Consulte o NIN para orientação.';
  } else if (/30 dias|v2\.0/.test(q) && /ferias|pedir|anteced/.test(q)) {
    ids = ['ferias-pedido'];
    status = 'conflict';
    text =
      'A NG_111 v2 previa 30 dias; a v3 substituiu essa regra por 45 dias. A versão anterior continua identificada no acervo.';
  } else if (/equipe|30%/.test(q)) {
    ids = ['ferias-equipe'];
    const n = Number(q.match(/equipe(?: de)?\s+(\d+)/)?.[1]);
    text =
      n > 0
        ? `Equipe de ${n}: máximo de ${n <= 3 ? 1 : Math.floor(n * 0.3)} pessoa(s) em férias simultâneas. Simulação sujeita à validação da área.`
        : 'O limite simultâneo é 30%, arredondado para baixo, com exceção para equipes de até três pessoas.';
  } else if (/prototipo|alcada|18[.,]?000|18000/.test(q)) {
    ids = ['inovacao-gerente', 'inovacao-diretor'];
    text =
      'Até R$ 18.000,00, gerente do NIN. De R$ 18.000,01 a R$ 120.000,00, diretor da DIRTEC. Acima disso, Comitê de Alçadas.';
  } else if (/rescind|rescisao|multa/.test(q)) {
    ids = ['locacao-multa'];
    text =
      'A partir do 91º dia de vigência não há multa; o contrato exige aviso escrito de 30 dias. Para datas concretas, confira o simulador.';
  } else if (/prorrog|coworking|contrato/.test(q)) {
    ids = ['locacao-prorroga', 'locacao-vistoria'];
    text =
      'O pedido de prorrogação deste contrato deve ocorrer até 30/03/2027. Confira os marcos e responsáveis nas fontes.';
  } else if (/ideias|elegib|meses de casa/.test(q)) {
    ids = ['inovacao-ideias', 'inovacao-elegivel'];
    text =
      'Na edição 2027, são até duas ideias por proponente e pelo menos seis meses de casa na abertura das inscrições.';
  } else if (/ferias|d-45/.test(q)) {
    ids = ['ferias-pedido', 'ferias-decisao', 'ferias-pagamento'];
    text = q.includes('05/05/2027')
      ? 'Para início em 05/05/2027, solicite até 21/03/2027 (D-45). Pagamento no exemplo: 30/04/2027. Confira as premissas no simulador.'
      : 'A solicitação de férias exige 45 dias corridos de antecedência. Use o simulador para uma data concreta.';
  } else {
    status = 'abstained';
    text =
      'Esta demonstração não tem evidência suficiente para responder à pergunta. Escolha um cenário sugerido ou consulte a área responsável.';
  }
  const facts = demoFacts.filter((f) => ids.includes(f.id));
  return {
    id: crypto.randomUUID(),
    query,
    status,
    text,
    facts,
    citations: [
      ...facts.map((f) => f.citation),
      ...(status === 'conflict' ? [historicalVacationCitation] : []),
    ],
    context,
    origin: 'demo',
    createdAt: new Date().toISOString(),
    nextSteps:
      status === 'access_required' ? ['Solicitar orientação'] : ['Ver fontes', 'Explorar análise'],
  };
}
export function createDemoGateway(): AppGateway {
  return {
    simulationRules: async () => ({
      advanceDays: 45,
      absencePercent: 30,
      absenceTiers: [
        { max: 5, days: 30 },
        { max: 14, days: 24 },
        { max: 23, days: 18 },
        { max: 32, days: 12 },
      ],
      managerCapCents: 1800000,
      directorCapCents: 12000000,
      rentCents: 365000,
      dailyDiscountCents: 12167,
      globalCents: 1825000,
      fineThroughDay: 90,
      available: ['ferias', 'inovacao', 'locacao'],
      calendar: {
        from: '2026-01-01',
        to: '2028-12-31',
        complete: false,
        holidays: ['2026-05-01', '2027-05-01', '2028-05-01'],
        description:
          'Calendário parcial da demonstração: fins de semana e 1º de maio. Feriados locais e outros feriados precisam de validação da unidade.',
      },
      citations: [...demoFacts.map((f) => f.citation), ...simulationSources],
    }),
    mode: 'demo',
    uploads: async () => [],
    decideUpload: async () => {
      throw new ApiError('UNSUPPORTED', 'Aprovação de arquivo exige a API externa.');
    },
    downloadUpload: async () => {
      throw new ApiError('UNSUPPORTED', 'Original de envio disponível somente na API externa.');
    },
    documents: async () => demoDocuments,
    facts: async () => demoFacts,
    messages: async (persona) => readDemo().messages.filter((m) => m.context.persona === persona),
    ask: async (query, context, signal) => {
      if (signal?.aborted) throw new ApiError('ABORTED', 'Consulta cancelada.');
      const result = demoAnswer(query, context);
      writeDemo((state) => ({ ...state, messages: [...state.messages, result] }));
      return result;
    },
    identity: async () => ({ id: 'ana', name: 'Ana — demonstração', capabilities: [] }),
    deadlines: async () =>
      demoFacts
        .filter((f) => f.date)
        .map((f) => ({
          id: f.id,
          date: f.date!,
          title: f.title,
          detail: f.text,
          owner: f.area,
          priority: f.id === 'inovacao-fiscal' || f.id === 'locacao-prorroga' ? 'Crítica' : 'Alta',
          fact: f,
        })),
    findings: async () =>
      findings.map((f) => ({
        id: f.id,
        title: f.severidade,
        detail: f.descricao,
        documents: f.documentosEnvolvidos,
      })),
    requests: async (persona) =>
      readDemo().requests.filter(
        (r) => (persona === 'curadora_ggc' && r.owner === 'GGC') || r.persona === persona,
      ),
    createRequest: async (reason, persona, owner = 'GGC') => {
      if (reason.trim().length < 10)
        throw new ApiError('VALIDATION', 'Informe uma justificativa com pelo menos 10 caracteres.');
      const item = {
        id: crypto.randomUUID(),
        persona,
        reason,
        owner,
        status: 'pending' as const,
        response: '',
        createdAt: new Date().toISOString(),
      };
      writeDemo((s) => ({ ...s, requests: [...s.requests, item] }));
      return item;
    },
    decideRequest: async (id, status, response, persona) => {
      if (persona !== 'curadora_ggc' || !response.trim())
        throw new ApiError(
          'VALIDATION',
          'Use a persona de curadoria e informe a orientação ou justificativa.',
        );
      const item = readDemo().requests.find((r) => r.id === id);
      if (!item) throw new ApiError('NOT_FOUND', 'Pedido não encontrado.');
      if (item.owner !== 'GGC')
        throw new ApiError('VALIDATION', 'A persona desta demonstração só faz curadoria da GGC.');
      const result = {
        ...item,
        status,
        response,
        decidedAt: new Date().toISOString(),
        decidedBy: 'Curadora da GGC (demonstração)',
      };
      writeDemo((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? result : r)) }));
      return result;
    },
    records: async (persona) => readDemo().records.filter((r) => r.persona === persona),
    saveRecord: async (record) => {
      writeDemo((s) => ({
        ...s,
        records: [record, ...s.records.filter((r) => r.id !== record.id)],
      }));
      return record;
    },
    feedback: async (persona) => readDemo().feedback.filter((f) => f.persona === persona),
    saveFeedback: async (item) => {
      writeDemo((s) => ({
        ...s,
        feedback: [
          item,
          ...s.feedback.filter(
            (f) => !(f.targetId === item.targetId && f.persona === item.persona),
          ),
        ],
      }));
      return item;
    },
    uploadStatus: async () => {
      throw new ApiError(
        'UNSUPPORTED',
        'A demonstração não possui um processamento externo em andamento.',
      );
    },
    upload: async (files) =>
      files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        status: 'not_extracted',
        message:
          'Arquivo selecionado localmente; conteúdo ainda não extraído. A demo não executa ingestão.',
      })),
    reset: resetDemo,
  };
}
