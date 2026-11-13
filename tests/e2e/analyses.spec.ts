import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';

test('alterna perspectivas, mantém filtros e abre a fonte pelo gráfico', async ({ page }) => {
  await contractServer(page);
  await page.goto('/analises/');
  await page.getByLabel('Tema da análise').selectOption('inovacao');
  await page.getByRole('button', { name: 'Valores', exact: true }).click();
  await expect(page.locator('.evidence-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Visualização', exact: true }).click();
  await page.locator('.value-bar-row').first().click();
  await expect(page.getByRole('dialog')).toContainText('NT_2026-021');
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.getByLabel('Tema da análise')).toHaveValue('inovacao');
  await page.getByRole('button', { name: 'Prazos', exact: true }).click();
  await page.getByLabel('Data inicial da análise').fill('2028-01-01');
  await expect(
    page.getByRole('heading', { name: 'Nenhuma evidência nessa perspectiva' }),
  ).toBeVisible();
});

test('compõe resumo por seleção, salva na API e exporta com fonte', async ({ page }) => {
  await contractServer(page);
  await page.goto('/analises/?tema=inovacao&perspectiva=values');
  await page.getByLabel('Selecionar Alçada de prototipagem').check();
  await page.getByRole('link', { name: 'Compor resumo (1)', exact: true }).click();
  await expect(page.locator('.report-preview')).toContainText('Até R$ 18.000,00');
  await expect(page.locator('.report-preview')).not.toContainText('De R$ 18.000,01');
  await page.getByLabel('Título do resumo').fill('Reunião da diretoria');
  await page.getByRole('button', { name: 'Salvar versão', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Versão confirmada pela API');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar texto', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('resumo-executivo.txt');
  await page.getByRole('button', { name: 'Criar nova versão' }).click();
  await page.locator('.evidence-picker summary').click();
  await page.getByLabel('Incluir Alçada de diretoria').check();
  await expect(page.locator('.report-preview')).toContainText('De R$ 18.000,01');
});

test('avalia resposta e reabre análise salva pelo histórico', async ({ page }) => {
  await contractServer(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Planejar minhas férias', exact: false }).click();
  await page.getByRole('button', { name: 'Marcar resposta como útil' }).click();
  await expect(page.locator('.answer-feedback')).toContainText('Avaliação confirmada pela API');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Marcar resposta como útil' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.goto('/analises/?tema=ferias&perspectiva=obligations');
  await page.getByRole('button', { name: 'Salvar análise', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Análise confirmada pela API');
  await page.getByRole('link', { name: 'Histórico', exact: true }).click();
  await page.getByRole('link', { name: 'Obrigações · Férias', exact: false }).click();
  await expect(page.getByLabel('Tema da análise')).toHaveValue('ferias');
});
