import { test, expect } from '@playwright/test';
test('preserva conversa, separa persona e não inventa resposta desconhecida', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Sua pergunta').fill('Qual o faturamento de ontem?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await expect(page.locator('.assistant-message')).toContainText('não tem evidência suficiente');
  await expect(page.locator('.message-sources button')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.assistant-message')).toContainText('não tem evidência suficiente');
  await page.getByLabel('Persona de demonstração').selectOption('carlos');
  await expect(page.locator('.assistant-message')).toHaveCount(0);
  await page.getByLabel('Persona de demonstração').selectOption('ana');
  await expect(page.locator('.assistant-message')).toHaveCount(1);
  await page.getByRole('button', { name: 'Nova consulta', exact: false }).click();
  await expect(page.locator('.assistant-message')).toHaveCount(0);
  await page.getByLabel('Sua pergunta').fill('Não eram 30 dias para pedir férias?');
  await page.getByRole('button', { name: 'Enviar pergunta' }).click();
  await expect(page.locator('.assistant-message')).toContainText('Mudança de versão');
});
