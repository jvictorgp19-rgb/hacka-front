import { test, expect } from '@playwright/test';
test('simula limites, datas com premissas e alçada de fronteira',async({page})=>{
  await page.goto('/simuladores/');
  await expect(page.getByText('Máximo de 2 pessoa(s) simultaneamente')).toBeVisible();
  await page.getByRole('checkbox',{name:'Entendo que preciso validar',exact:false}).check();
  await expect(page.getByText('30/04/2027',{exact:true})).toBeVisible();
  await expect(page.getByText('04/06/2027',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Inovação',exact:true}).first().click();
  await expect(page.locator('.result-box')).toContainText('Diretor da DIRTEC');
  await page.getByLabel('Valor do protótipo').fill('18000');
  await expect(page.locator('.result-box')).toContainText('Gerente do NIN');
});
test('lista e calendário mantêm o mesmo conjunto de eventos',async({page})=>{
  await page.goto('/prazos/');
  await expect(page.locator('.deadline-list>li')).toHaveCount(2);
  await page.getByRole('button',{name:'Calendário',exact:true}).click();
  await expect(page.locator('.calendar-event')).toHaveCount(2);
  await page.locator('.calendar-event').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
