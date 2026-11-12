import { test, expect } from '@playwright/test';
test('registra pedido e preserva resposta curada sem conceder acesso real', async ({ page }) => {
  await page.goto('/administracao/');
  await page
    .getByLabel('Justificativa do pedido')
    .fill('Preciso confirmar o ressarcimento previsto nas férias.');
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Pedido registrado localmente');
  await expect(page.getByText('Pendente', { exact: true })).toBeVisible();
  await page.getByLabel('Persona de demonstração').selectOption('curadora_ggc');
  await page
    .getByLabel('Resposta da curadoria')
    .fill(
      'Consulte a NG_111 e apresente os comprovantes à GGC; esta orientação não abre dados da folha.',
    );
  await page.getByRole('button', { name: 'Enviar resposta curada', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Nenhum acesso real foi concedido');
  await page.reload();
  await page.getByLabel('Persona de demonstração').selectOption('ana');
  await expect(page.locator('.curated-response')).toContainText('Consulte a NG_111');
  await expect(page.getByText('Respondido com orientação curada', { exact: true })).toBeVisible();
});
