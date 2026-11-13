import { test, expect } from '@playwright/test';

test('marcas e cabeçalho carregam com CSS atual nos dois temas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O que vamos esclarecer hoje?' })).toBeVisible();
  await expect(page.locator('.topbar')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Alternar tema' })).toBeVisible();
  await expect(page.locator('.company-brand').getByRole('img', { name: /BBTS/ })).toBeVisible();
  await expect(page.locator('.footer-identity')).toHaveCSS('display', 'flex');
  for (const asset of ['bbts-wordmark.png', 'zero-click-symbol.svg']) {
    const response = await page.request.get(`/brand/${asset}`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toMatch(/image\//);
  }
  for (const theme of ['light', 'dark']) {
    if ((await page.locator('html').getAttribute('data-theme')) !== theme)
      await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const symbol = page.locator('.intro-mark .zero-click-symbol');
    await expect(symbol).toBeVisible();
    await expect(symbol).toHaveCSS('width', '56px');
    await expect(symbol).toHaveCSS(
      'background-color',
      theme === 'light' ? 'rgb(70, 94, 255)' : 'rgb(252, 252, 48)',
    );
    await expect(symbol).toHaveCSS('mask-image', /\/brand\/zero-click-symbol\.svg/);
  }
  await page.getByRole('button', { name: 'Recolher navegação' }).click();
  await expect(page.locator('.company-brand .bbts-logo')).toHaveCSS('width', '40px');
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await expect(page.getByRole('link', { name: 'Zero Click, início', exact: true })).toBeVisible();
  await expect(page.locator('.brand .nav-label')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
