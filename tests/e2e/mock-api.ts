import type { Page } from '@playwright/test';
import { contextSchema, type AnalysisContext, type Answer } from '../../src/contracts/models';
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
export async function contractServer(page: Page, bootstrapStatus = 200) {
  const messages: Answer[] = [];
  const state = {
    invalid: false,
    slow: false,
    feedbackFails: false,
    slowCompleted: false,
    posts: 0,
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
      'access-control-allow-headers': 'content-type',
    };
    const reply = (json: unknown, status = 200) => route.fulfill({ json, status, headers });
    if (request.method() === 'OPTIONS') {
      await reply({});
      return;
    }
    if (url.pathname === '/identity') {
      await reply({ id: 'contract-user', name: 'Usuário de contrato', capabilities: [] });
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
      await reply([]);
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
      await reply(
        request.method() === 'POST' ? request.postDataJSON() : [],
        request.method() === 'POST' && state.feedbackFails ? 500 : 200,
      );
      return;
    }
    if (url.pathname === '/document-jobs' && request.method() === 'POST') {
      await reply([
        {
          id: 'server-job-1',
          name: 'novo.pdf',
          size: 15,
          status: 'processing',
          message: 'Processamento iniciado pelo serviço de teste.',
        },
      ]);
      return;
    }
    if (url.pathname === '/document-jobs/server-job-1') {
      await reply({
        id: 'server-job-1',
        name: 'novo.pdf',
        size: 15,
        status: 'ready',
        message: 'Processamento confirmado pelo serviço de teste.',
      });
      return;
    }
    if (url.pathname === '/analyses' || url.pathname === '/access-requests') {
      await reply([]);
      return;
    }
    await reply({ error: 'Endpoint não previsto pelo teste' }, 404);
  });
  return state;
}
