import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';
test('todos os envios permanecem após navegar e recarregar, com aprovação e original', async ({
  page,
}) => {
  await contractServer(page);
  await page.goto('/acervo/');
  await page.getByLabel('Adicionar PDFs').setInputFiles(
    ['um.pdf', 'dois.pdf', 'tres.pdf'].map((name) => ({
      name,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n'),
    })),
  );
  await expect(page.locator('.upload-row')).toHaveCount(3);
  await expect(page.getByText('Salvo no sistema', { exact: true })).toHaveCount(3);
  await page.getByRole('link', { name: 'Prazos', exact: true }).click();
  await page.getByRole('link', { name: 'Acervo', exact: true }).click();
  await expect(page.locator('.upload-row')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('.upload-row')).toHaveCount(3);
  for (const name of ['um.pdf', 'dois.pdf', 'tres.pdf'])
    await expect(page.locator('.upload-row').filter({ hasText: name })).toBeVisible();
  const row = page.locator('.upload-row').filter({ hasText: 'um.pdf' });
  if (await row.getByRole('button', { name: 'Atualizar processamento' }).count())
    await row.getByRole('button', { name: 'Atualizar processamento' }).click();
  await row.getByRole('button', { name: 'Aprovar documento' }).click();
  await expect(row).toContainText('aprovado por helena');
  await page.reload();
  await expect(page.locator('.upload-row').filter({ hasText: 'um.pdf' })).toContainText(
    'aprovado por helena',
  );
  const downloaded = page.waitForEvent('download');
  await page
    .locator('.upload-row')
    .filter({ hasText: 'um.pdf' })
    .getByRole('button', { name: 'Baixar original' })
    .click();
  expect((await downloaded).suggestedFilename()).toBe('um.pdf');
});

test('erro no banco não mostra arquivo como salvo', async ({ page }) => {
  const state = await contractServer(page);
  state.uploadFails = true;
  await page.goto('/acervo/');
  await page.getByLabel('Adicionar PDFs').setInputFiles({
    name: 'novo.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n'),
  });
  await expect(page.locator('.upload-row')).toContainText('Falha');
  await expect(page.getByText('Salvo no sistema', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.upload-row')).toHaveCount(0);
});

function savedJob(id: string) {
  return {
    id,
    name: id + '.pdf',
    size: 30,
    status: 'ready' as const,
    message: 'Arquivo processado',
    saved: true,
    fileAvailable: false,
    canApprove: false,
    createdAt: new Date().toISOString(),
  };
}
test('histórico carrega todas as páginas sem truncar em 100 envios', async ({ page }) => {
  const state = await contractServer(page);
  state.jobs.push(...Array.from({ length: 105 }, (_, i) => savedJob(String(i))));
  await page.goto('/acervo/');
  await expect(page.locator('.upload-row')).toHaveCount(105);
  expect(state.historyCalls).toEqual([0, 100]);
  await expect(page.getByRole('button', { name: 'Aprovar documento' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Baixar original' })).toHaveCount(0);
});
for (const status of [403, 409, 503])
  test(`decisão ${status} não confirma aprovação`, async ({ page }) => {
    const state = await contractServer(page);
    state.jobs.push({ ...savedJob('pendente'), canApprove: true, aprovacao: 'pendente' });
    state.decisionStatus = status;
    await page.goto('/acervo/');
    await page.getByRole('button', { name: 'Aprovar documento' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(page.locator('.upload-row')).not.toContainText('aprovado por');
  });
test('histórico atrasado não desfaz decisão confirmada', async ({ page }) => {
  const state = await contractServer(page);
  state.jobs.push({ ...savedJob('pendente'), canApprove: true, aprovacao: 'pendente' });
  await page.goto('/acervo/');
  await expect(page.locator('.upload-row')).toHaveCount(1);
  state.historyDelay = 900;
  await page.getByRole('button', { name: 'Atualizar arquivos' }).click();
  await expect.poll(() => state.historyStarted).toBe(2);
  await page.getByRole('button', { name: 'Aprovar documento' }).click();
  await expect(page.locator('.upload-row')).toContainText('aprovado por helena');
  await page.waitForTimeout(1200);
  await expect(page.locator('.upload-row')).toContainText('aprovado por helena');
  await expect(page.getByRole('button', { name: 'Aprovar documento' })).toHaveCount(0);
});
test('recusa exige motivo e mostra o estado confirmado pelo serviço', async ({ page }) => {
  const state = await contractServer(page);
  state.jobs.push({ ...savedJob('pendente'), canApprove: true, aprovacao: 'pendente' });
  await page.goto('/acervo/');
  await page.getByRole('button', { name: 'Recusar documento', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirmar recusa' })).toBeDisabled();
  await page.getByLabel('Motivo da recusa').fill('Documento precisa ser revisado pelo setor.');
  await page.getByRole('button', { name: 'Confirmar recusa' }).click();
  await expect(page.locator('.upload-row')).toContainText('Recusado na revisão');
  expect(state.jobs[0].response).toBe('Documento precisa ser revisado pelo setor.');
});
