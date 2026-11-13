import { test, expect } from '@playwright/test';
const routes = [
  ['/', 'O que vamos esclarecer hoje?'],
  ['/acervo/', 'Acervo documental'],
  ['/analises/', 'Análises com fundamento'],
  ['/prazos/', 'Prazos e compromissos'],
  ['/resumos/', 'Resumos executivos'],
  ['/historico/', 'Histórico e análises salvas'],
  ['/administracao/', 'Curadoria e orientações'],
  ['/simuladores/', 'Simuladores de regras'],
];
test('todas as telas preservam leitura em mobile e desktop', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, title] of routes) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${path} a ${width}px`,
      ).toBe(true);
    }
  }
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O que vamos esclarecer hoje?' })).toBeVisible();
  await page.screenshot({ path: '/tmp/hacka-final-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Alternar tema' }).click();
  await page.screenshot({ path: '/tmp/hacka-final-dark.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: '/tmp/hacka-final-mobile.png', fullPage: true });
});
