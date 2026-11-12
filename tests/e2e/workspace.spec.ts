import { test, expect } from '@playwright/test';
test('abre a aplicação preservada', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText('O que você precisa resolver hoje', { exact: false })).toBeVisible();
});
test('consulta demo funciona sem chamar backend ou rota local', async ({ page }) => {
  const apiCalls: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/chat') || request.url().includes(':8000')) apiCalls.push(request.url()); });
  await page.goto('/');
  await page.getByRole('textbox').first().fill('Quero férias em 05/05/2027. Qual o prazo?');
  await page.getByRole('button', { name: 'Consultar Norma', exact: true }).click();
  await expect(page.getByText('Para início em 05/05/2027', { exact: false })).toBeVisible();
  expect(apiCalls).toEqual([]);
});
