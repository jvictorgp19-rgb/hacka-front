import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';

test.beforeEach(async ({ page }) => {
  await contractServer(page);
});
test('abre a aplicação', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText('O que vamos esclarecer hoje?', { exact: false })).toBeVisible();
});
test('navegação responsiva, temas e painel de fontes', async ({ page }) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'O que vamos esclarecer hoje?' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Alternar tema' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Planejar minhas férias', exact: false }).click();
  await page.getByRole('button', { name: 'NG_111 · 4.3.1' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.screenshot({ path: '/tmp/hacka-cp04-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Abrir navegação', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Acervo', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Acervo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Acervo documental' })).toBeVisible();
});
test('texto a 200% e movimento reduzido mantêm conteúdo acessível', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O que vamos esclarecer hoje?' })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Ir para conteúdo' })).toBeFocused();
});
