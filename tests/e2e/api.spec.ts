import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';

test('modo API consome contrato e não libera curadoria sem capacidade', async ({ page }) => {
  await contractServer(page);
  await page.goto('/');
  await expect(page.getByText('API externa', { exact: true })).toBeVisible();
  await page.getByLabel('Sua pergunta').fill('Equipe de 9: quantos podem sair juntos?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await expect(page.locator('.assistant-message')).toContainText('máximo de 2');
  await page.goto('/administracao/');
  await expect(page.getByLabel('Resposta da curadoria')).toHaveCount(0);
});
for (const status of [401, 403, 500])
  test(`erro ${status} não vira catálogo local`, async ({ page }) => {
    await contractServer(page, status);
    await page.goto('/acervo/');
    await expect(
      page.getByRole('heading', { name: 'Não foi possível carregar os dados' }),
    ).toBeVisible();
    await expect(page.locator('.document-row')).toHaveCount(0);
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
