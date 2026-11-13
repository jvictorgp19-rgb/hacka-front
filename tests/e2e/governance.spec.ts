import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';

test('registra pedido sem mostrar a fila da curadoria', async ({ page }) => {
  await contractServer(page);
  await page.goto('/administracao/');
  await expect(page.getByRole('heading', { name: 'Meus pedidos' })).toBeVisible();
  await page
    .getByLabel('Justificativa do pedido')
    .fill('Preciso confirmar o ressarcimento previsto nas férias.');
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Pedido confirmado pela API');
  await expect(page.getByText('Pendente', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Resposta da curadoria')).toHaveCount(0);
});

test('curadoria responde e a resposta continua após recarregar', async ({ page }) => {
  await contractServer(page, 200, ['upload', 'curate']);
  await page.goto('/administracao/');
  await expect(page.getByRole('heading', { name: 'Fila de curadoria e pedidos' })).toBeVisible();
  await page
    .getByLabel('Justificativa do pedido')
    .fill('Preciso confirmar o ressarcimento previsto nas férias.');
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click();
  await page
    .getByLabel('Resposta da curadoria')
    .fill('Consulte a NG_111 e apresente os comprovantes; esta orientação não abre a folha.');
  await page.getByRole('button', { name: 'Enviar resposta curada', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Decisão confirmada pela API');
  await page.reload();
  await expect(page.locator('.curated-response')).toContainText('Consulte a NG_111');
  await expect(page.getByText('Respondido com orientação curada', { exact: true })).toBeVisible();
});
