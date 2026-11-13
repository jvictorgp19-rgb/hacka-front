// Opt-in integration with the actual FastAPI process. Only localhost synthetic test environments.
import { chromium, expect } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const api = process.env.REAL_API_URL || 'http://127.0.0.1:8100';
const frontend = process.env.TEST_BASE_URL || 'http://127.0.0.1:3500';
for (const address of [api, frontend])
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(address).hostname));
assert.equal(
  process.env.RUN_REAL_BACKEND_TESTS,
  '1',
  'Use only an isolated synthetic test environment.',
);
const output = process.env.REAL_RESULT_PATH || '/tmp/hacka-real-result.json';
const screenshots = process.env.REAL_SCREENSHOT_DIR || '/tmp/hacka-real-screenshots';
await mkdir(screenshots, { recursive: true });
const sha = (data) => createHash('sha256').update(data).digest('hex');
const get = async (path, persona = 'helena') => {
  const result = await fetch(api + path, { headers: { 'X-Persona-Id': persona } });
  assert.ok(result.ok, `${path}: ${result.status}`);
  return result.json();
};
const identity = await get('/identity');
assert.equal(identity.modo, 'demo');
assert.equal(identity.id, 'helena');
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  if (process.argv.includes('--verify-restart')) {
    const previous = JSON.parse(await readFile(output, 'utf8'));
    const item = await get('/document-jobs/' + previous.approved.id);
    assert.equal(item.aprovacao, 'aprovado');
    assert.equal(item.canApprove, false);
    await page.goto(frontend + '/acervo/');
    await expect(page.locator('.upload-row').filter({ hasText: item.name })).toContainText(
      'aprovado por helena',
    );
    const original = await fetch(api + '/document-jobs/' + item.id + '/file', {
      headers: { 'X-Persona-Id': 'helena' },
    });
    assert.equal(sha(Buffer.from(await original.arrayBuffer())), previous.pdfSha256);
    previous.restartVerified = true;
    await writeFile(output, JSON.stringify(previous, null, 2));
    console.log('FastAPI restart: decisão, histórico e bytes do original preservados.');
  } else {
    const pdf = await readFile(
      process.env.SYNTHETIC_PDF || new URL('../fixtures/integracao-sintetica.pdf', import.meta.url),
    );
    const name = `integracao-pendente-${Date.now()}.pdf`,
      form = new FormData();
    form.append('files', new Blob([pdf], { type: 'application/pdf' }), name);
    const upload = await fetch(api + '/document-jobs', {
      method: 'POST',
      headers: { 'X-Persona-Id': 'bruno' },
      body: form,
    });
    assert.ok(upload.ok);
    const [pending] = await upload.json();
    let item;
    for (let i = 0; i < 100; i++) {
      item = await get('/document-jobs/' + pending.id, 'bruno');
      if (item.status === 'ready') break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.equal(item.aprovacao, 'pendente');
    assert.equal(item.canApprove, false);
    const forbidden = await fetch(api + '/document-jobs/' + item.id + '/decision', {
      method: 'POST',
      headers: { 'X-Persona-Id': 'bruno', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aprovado' }),
    });
    assert.equal(forbidden.status, 403);
    await page.goto(frontend + '/acervo/');
    const row = page.locator('.upload-row').filter({ hasText: name });
    await expect(row.getByRole('button', { name: 'Aprovar documento' })).toBeVisible();
    await row.getByRole('button', { name: 'Aprovar documento' }).click();
    await expect(row).toContainText('aprovado por helena');
    await page.reload();
    await expect(page.locator('.upload-row').filter({ hasText: name })).toContainText(
      'aprovado por helena',
    );
    let downloadPromise = page.waitForEvent('download');
    await page
      .locator('.upload-row')
      .filter({ hasText: name })
      .getByRole('button', { name: 'Baixar original' })
      .click();
    const downloaded = await downloadPromise;
    assert.equal(downloaded.suggestedFilename(), name);
    assert.equal(sha(await readFile(await downloaded.path())), sha(pdf));
    const ownName = `integracao-interface-${Date.now()}.pdf`;
    await page
      .getByLabel('Adicionar PDFs')
      .setInputFiles({ name: ownName, mimeType: 'application/pdf', buffer: pdf });
    await expect(page.locator('.upload-row').filter({ hasText: ownName })).toContainText(
      'Salvo no sistema',
    );
    await page.getByRole('link', { name: 'Prazos', exact: true }).click();
    await page.getByRole('link', { name: 'Acervo', exact: true }).click();
    await expect(page.locator('.upload-row').filter({ hasText: ownName })).toBeVisible();
    await page.reload();
    await expect(page.locator('.upload-row').filter({ hasText: ownName })).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
    await page.screenshot({ path: screenshots + '/api-desktop-claro.png', fullPage: true });
    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: screenshots + '/api-desktop-escuro.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: screenshots + '/api-mobile.png', fullPage: true });
    const saved = await get('/document-jobs/' + pending.id);
    await writeFile(
      output,
      JSON.stringify(
        {
          api,
          frontend,
          backendSha: 'e777c4fb0deea164ba7cbea226672f24c5acfb38',
          authMode: 'demo',
          database: 'isolated SQLite',
          approved: saved,
          ownName,
          pdfSha256: sha(pdf),
          restartVerified: false,
        },
        null,
        2,
      ),
    );
    console.log(
      'FastAPI real: envio pela UI, navegação/reload, autorização, aprovação e download exato aprovados.',
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
