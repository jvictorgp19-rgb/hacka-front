import { test, expect, type Page } from '@playwright/test';
import { demoAnswer, createDemoGateway } from '../../src/services/demo/provider';
import { demoDocuments, demoFacts } from '../../src/services/demo/catalog';
import { contextSchema, type Answer } from '../../src/contracts/models';

async function contractServer(page: Page, bootstrapStatus = 200) {
  const messages: Answer[] = [];
  const state = {
    invalid: false,
    slow: false,
    feedbackFails: false,
    slowCompleted: false,
    posts: 0,
  };
  const rules = await createDemoGateway().simulationRules();
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
      await reply(demoDocuments, bootstrapStatus);
      return;
    }
    if (url.pathname === '/analyses/evidence') {
      await reply(demoFacts);
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
    if (url.pathname === '/simulation-rules') {
      await reply(rules);
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
      const answer = {
        ...demoAnswer(String(body.query), contextSchema.parse(body.context)),
        origin: 'api' as const,
      };
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
test('modo API consome contrato e não grava dados demo nem libera persona', async ({ page }) => {
  await contractServer(page);
  await page.goto('/');
  await expect(page.getByText('API externa', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Persona de demonstração')).toHaveCount(0);
  await page.getByLabel('Sua pergunta').fill('Equipe de 9: quantos podem sair juntos?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await expect(page.locator('.assistant-message')).toContainText('máximo de 2');
  expect(await page.evaluate(() => localStorage.getItem('raiziq.demo.v1'))).toBeNull();
  await page.goto('/administracao/');
  await expect(page.getByLabel('Resposta da curadoria')).toHaveCount(0);
});
for (const status of [401, 403, 500])
  test(`erro ${status} não vira catálogo demo`, async ({ page }) => {
    await contractServer(page, status);
    await page.goto('/acervo/');
    await expect(
      page.getByRole('heading', { name: 'Não foi possível carregar os dados' }),
    ).toBeVisible();
    await expect(page.locator('.document-row')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('raiziq.demo.v1'))).toBeNull();
  });
test('resposta inválida permite nova tentativa sem sucesso fictício', async ({ page }) => {
  const state = await contractServer(page);
  state.invalid = true;
  await page.goto('/');
  await page.getByLabel('Sua pergunta').fill('Qual o limite de ideias por pessoa?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'incompatíveis com o contrato',
  );
  await expect(page.locator('.assistant-message')).toHaveCount(0);
  state.invalid = false;
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.locator('.assistant-message')).toHaveCount(1);
});
test('cancelamento preserva pergunta e não adiciona resposta tardia', async ({ page }) => {
  const state = await contractServer(page);
  state.slow = true;
  await page.goto('/');
  await page.getByLabel('Sua pergunta').fill('Qual o prazo para férias?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await page.getByRole('button', { name: 'Cancelar consulta' }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Consulta cancelada');
  await expect(page.getByLabel('Sua pergunta')).toHaveValue('Qual o prazo para férias?');
  await expect.poll(() => state.slowCompleted).toBe(true);
  expect(state.posts).toBe(1);
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Consulta cancelada');
  await expect(page.locator('.assistant-message')).toHaveCount(0);
});
test('processamento usa estado retornado e ID remoto para atualização', async ({ page }) => {
  await contractServer(page);
  await page.goto('/acervo/');
  await page.getByLabel('Adicionar PDFs').setInputFiles({
    name: 'novo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n'),
  });
  await expect(page.getByRole('region', { name: 'Fila de arquivos' })).toContainText(
    'Processamento informado pela API',
  );
  await page.getByRole('button', { name: 'Atualizar processamento' }).click();
  await expect(page.getByRole('region', { name: 'Fila de arquivos' })).toContainText(
    'Processamento confirmado pelo serviço de teste',
  );
});

test('feedback com erro só confirma sucesso após resposta válida da API', async ({ page }) => {
  const state = await contractServer(page);
  state.feedbackFails = true;
  await page.goto('/');
  await page.getByRole('button', { name: 'Planejar minhas férias', exact: false }).click();
  await page.getByRole('button', { name: 'Marcar resposta como útil' }).click();
  await expect(page.locator('.answer-feedback')).toContainText('O serviço não concluiu');
  await expect(page.getByRole('button', { name: 'Marcar resposta como útil' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  state.feedbackFails = false;
  await page.getByRole('button', { name: 'Marcar resposta como útil' }).click();
  await expect(page.locator('.answer-feedback')).toContainText('Avaliação confirmada pela API');
});
