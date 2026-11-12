import { test, expect } from '@playwright/test';
test('abre a aplicação preservada', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText('O que você precisa resolver hoje', { exact: false })).toBeVisible();
});
