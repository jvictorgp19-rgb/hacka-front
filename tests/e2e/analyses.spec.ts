import { test, expect } from '@playwright/test';
test('alterna perspectivas, mantém filtros e permite fontes por elemento visual', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'Nenhuma evidência nessa perspectiva' })).toBeVisible();
  await page.getByRole('button', { name: 'Versões e conflitos', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Alertas cadastrados para revisão' })).toBeVisible();
});
