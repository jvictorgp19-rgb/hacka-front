import { test, expect } from '@playwright/test';
test('filtra acervo, preserva versão sem PDF e trata lote parcialmente inválido', async ({ page }) => {
  await page.goto('/acervo/');
  await page.getByLabel('Buscar no acervo').fill('RG_1100');
  await expect(page.locator('.document-row')).toHaveCount(2);
  await page.getByLabel('Fase dos documentos').selectOption('false');
  await page.locator('.document-row').click();
  await expect(page.getByRole('dialog')).toContainText('este PDF não está no acervo');
  await page.keyboard.press('Escape');
  await page.getByLabel('Adicionar PDFs').setInputFiles([
    { name: 'novo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n') },
    { name: 'incorreto.txt', mimeType: 'text/plain', buffer: Buffer.from('texto') },
  ]);
  await expect(page.getByRole('region', { name: 'Fila de arquivos' })).toContainText('Conteúdo ainda não extraído');
  await expect(page.getByRole('region', { name: 'Fila de arquivos' })).toContainText('Escolha um arquivo PDF');
  await page.getByRole('button', { name: 'Ver exemplo de processamento' }).click();
  await expect(page.getByRole('region', { name: 'Fila de arquivos' })).toContainText('Pronto (simulado)');
});
