import { test, expect } from '@playwright/test';
test('avalia resposta, retoma conversa e reabre análise salva', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Planejar minhas férias', exact: false }).click();
  await page.getByRole('button', { name: 'Marcar resposta como útil' }).click();
  await expect(page.locator('.answer-feedback')).toContainText('Avaliação salva neste navegador');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Marcar resposta como útil' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Sinalizar revisão da resposta' }).click();
  await page.getByLabel('Motivo da revisão').fill('Preciso conferir o calendário da unidade.');
  await page.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sinalizar revisão da resposta' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('link', { name: 'Histórico', exact: true }).click();
  await page.locator('.document-list a').first().click();
  await expect(page.locator('.assistant-message')).toContainText('21/03/2027');
  await page.goto('/analises/?tema=ferias&perspectiva=obligations');
  await page.getByRole('button', { name: 'Salvar análise', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Análise salva');
  await page.getByRole('link', { name: 'Histórico', exact: true }).click();
  await page.getByRole('link', { name: 'Obrigações · Férias', exact: false }).click();
  await expect(page.getByLabel('Tema da análise')).toHaveValue('ferias');
  await expect(page.getByText('Snapshot salvo', { exact: false })).toBeVisible();
});
