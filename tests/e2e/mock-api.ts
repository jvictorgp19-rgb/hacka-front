import type { Page } from '@playwright/test';
import {
  contextSchema,
  type AccessRequest,
  type AnalysisContext,
  type Answer,
  type UploadItem,
} from '../../src/contracts/models';
import { facts } from '../fixtures/facts';

// API de contrato para os testes de navegador: responde como o hacka-back, com dados fixos.
const documents = [
  {
    id: 'NG_111@3.0.0',
    codigo: 'NG_111',
    titulo: 'Férias',
    versao: '3.0.0',
    fase: 'Vigente',
    vigente: true,
    tema: 'ferias',
    area: 'GEPEC',
    camada: 'NG',
    resumo: 'Norma de férias.',
    vigencia: '2026-09-01 a consultar instrumento',
  },
  {
    id: 'NG_111@2.0.0',
    codigo: 'NG_111',
    titulo: 'Férias',
    versao: '2.0.0',
    fase: 'Versão anterior',
    vigente: false,
    tema: 'ferias',
    area: 'GEPEC',
    camada: 'NG',
    resumo: 'Versão anterior da norma de férias.',
    substitui: 'NG_111@1.0.0',
    vigencia: 'Versão anterior; consultar substituição',
  },
];
function answerFor(query: string, context: AnalysisContext): Answer {
  const fact = facts.find((f) => f.id === 'ferias-pedido') || facts[0];
  return {
    id: 'api-' + Math.random().toString(36).slice(2),
    query,
    status: 'answered',
    text: /equipe de 9/i.test(query)
      ? 'Com equipe de 9 pessoas, no máximo de 2 podem sair ao mesmo tempo.'
      : 'Resposta do serviço de teste, com a fonte citada.',
    facts: [fact],
    citations: [fact.citation],
    context,
    origin: 'api',
    createdAt: new Date().toISOString(),
    nextSteps: [],
  };
}
const fact = (id: string) => facts.find((f) => f.id === id)!;
const deadlines = [
  {
    id: 'prazo-ferias',
    date: '2027-03-21',
    title: 'Solicitação de férias',
    detail: 'Pedido com 45 dias de antecedência.',
    owner: 'GEPEC',
    priority: 'Alta',
    fact: fact('ferias-pedido'),
  },
  {
    id: 'prazo-fiscal',
    date: '2027-03-31',
    title: 'Consolidação fiscal',
    detail: 'Consolidação dos dados para a Lei do Bem.',
    owner: 'GEINOV',
    priority: 'Normal',
    fact: fact('inovacao-fiscal'),
  },
];
const simulationRules = {
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
  calendar: {
    from: '2026-01-01',
    to: '2028-12-31',
    complete: false,
    holidays: ['2026-05-01', '2027-05-01', '2028-05-01'],
    description: 'Calendário do serviço de teste: fins de semana e 1º de maio.',
  },
  citations: facts.map((f) => f.citation),
};
export async function contractServer(
  page: Page,
  bootstrapStatus = 200,
  capabilities: string[] = [],
) {
  const messages: Answer[] = [];
  const jobs: UploadItem[] = [];
  const requests: AccessRequest[] = [];
  const records: unknown[] = [];
  const feedback: unknown[] = [];
  const state = {
    invalid: false,
    slow: false,
    feedbackFails: false,
    slowCompleted: false,
    posts: 0,
    uploadFails: false,
  };
  await page.route('https://api.test.invalid/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const headers = {
      'access-control-allow-origin': new URL(
        page.url().startsWith('http')
          ? page.url()
          : process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
      ).origin,
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type, x-persona-id',
    };
    const reply = (json: unknown, status = 200) => route.fulfill({ json, status, headers });
    if (request.method() === 'OPTIONS') {
      await reply({});
      return;
    }
    if (url.pathname === '/identity') {
      await reply({ id: 'contract-user', name: 'Usuário de contrato', capabilities });
      return;
    }
    if (url.pathname === '/documents') {
      await reply(documents, bootstrapStatus);
      return;
    }
    if (url.pathname === '/analyses/evidence') {
      await reply(facts);
      return;
    }
    if (url.pathname === '/deadlines') {
      await reply(deadlines);
      return;
    }
    if (url.pathname === '/simulation-rules') {
      await reply(simulationRules);
      return;
    }
    if (url.pathname === '/audit/findings') {
      await reply([]);
      return;
    }
    if (url.pathname === '/conversations/messages') {
      if (request.method() === 'GET') {
        await reply(messages);
        return;
      }
      state.posts++;
      if (state.invalid) {
        await reply({ unexpected: true });
        return;
      }
      if (state.slow) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        await reply({ cancelled: true }).catch(() => {});
        state.slowCompleted = true;
        return;
      }
      const body = request.postDataJSON();
      const answer = answerFor(String(body.query), contextSchema.parse(body.context));
      messages.push(answer);
      await reply(answer);
      return;
    }
    if (url.pathname === '/feedback') {
      if (request.method() === 'GET') {
        await reply(feedback);
        return;
      }
      if (state.feedbackFails) {
        await reply({ error: 'falha' }, 500);
        return;
      }
      const item = request.postDataJSON();
      feedback.push(item);
      await reply(item);
      return;
    }
    if (url.pathname === '/access-requests') {
      if (request.method() === 'GET') {
        await reply(requests);
        return;
      }
      const body = request.postDataJSON();
      const item: AccessRequest = {
        id: 'REQ-' + String(requests.length + 1).padStart(8, '0'),
        persona: String(body.persona),
        owner: String(body.owner),
        reason: String(body.reason),
        status: 'pending',
        response: '',
        createdAt: new Date().toISOString(),
      };
      requests.unshift(item);
      await reply(item);
      return;
    }
    const decision = /^\/access-requests\/([^/]+)\/decision$/.exec(url.pathname);
    if (decision && request.method() === 'POST') {
      const body = request.postDataJSON();
      const item = requests.find((r) => r.id === decodeURIComponent(decision[1]));
      if (!item) {
        await reply({ error: 'Pedido não encontrado' }, 404);
        return;
      }
      Object.assign(item, {
        status: body.status,
        response: String(body.response),
        decidedAt: new Date().toISOString(),
        decidedBy: 'Usuário de contrato',
      });
      await reply(item);
      return;
    }
    if (url.pathname === '/analyses') {
      if (request.method() === 'POST') {
        const item = request.postDataJSON();
        records.unshift(item);
        await reply(item);
        return;
      }
      await reply(records);
      return;
    }
    if (url.pathname === '/document-jobs' && request.method() === 'POST') {
      if (state.uploadFails) {
        await reply({ detail: 'Banco indisponível' }, 503);
        return;
      }
      const item: UploadItem = {
        id: 'server-job-' + (jobs.length + 1),
        name: request.postData()?.match(/filename="([^"]+)"/)?.[1] || 'novo.pdf',
        size: 15,
        status: 'processing',
        message: 'Processamento iniciado pelo serviço de teste.',
        saved: true,
        fileAvailable: true,
        canApprove: false,
        aprovacao: 'pendente',
        createdAt: new Date().toISOString(),
      };
      jobs.push(item);
      await reply([item]);
      return;
    }
    if (url.pathname === '/document-jobs' && request.method() === 'GET') {
      const offset = Number(url.searchParams.get('offset') || 0);
      await reply(jobs.slice(offset, offset + 100));
      return;
    }
    if (url.pathname.startsWith('/document-jobs/')) {
      const id = url.pathname.split('/')[2];
      const item = jobs.find((job) => job.id === id);
      if (!item) {
        await reply({}, 404);
        return;
      }
      if (url.pathname.endsWith('/decision')) {
        Object.assign(item, {
          aprovacao: 'aprovado',
          canApprove: false,
          decidedBy: 'helena',
          decidedAt: new Date().toISOString(),
          message: 'Confirmado: documento aprovado.',
        });
      } else if (url.pathname.endsWith('/file')) {
        await route.fulfill({
          body: '%PDF-1.4\n',
          headers: {
            ...headers,
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment',
          },
        });
        return;
      } else {
        Object.assign(item, {
          status: 'ready',
          canApprove: true,
          message: 'Processamento confirmado pelo serviço de teste.',
        });
      }
      await reply(item);
      return;
    }
    await reply({ error: 'Endpoint não previsto pelo teste' }, 404);
  });
  return state;
}
