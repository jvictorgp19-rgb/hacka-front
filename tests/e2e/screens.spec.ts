import { test, expect } from '@playwright/test';
import { contractServer } from './mock-api';

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

test('todas as telas cabem em mobile e desktop', async ({ page }) => {
  await contractServer(page);
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
});
