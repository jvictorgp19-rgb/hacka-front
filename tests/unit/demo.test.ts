import { it, expect } from 'vitest';
import { demoAnswer, demoSuggestions } from '@/services/demo/provider';
import { demoDocuments, demoFacts } from '@/services/demo/catalog';
import { defaultContext, answerSchema } from '@/contracts/models';

it('preserva os cenários e informa a origem demo', () => {
  for (const query of demoSuggestions) {
    const answer = answerSchema.parse(demoAnswer(query, defaultContext));
    expect(answer.origin).toBe('demo');
    expect(answer.text.length).toBeGreaterThan(20);
  }
});
it('não responde a perguntas desconhecidas com resumo arbitrário', () => {
  const result = demoAnswer('Qual o faturamento da empresa ontem?', defaultContext);
  expect(result.status).toBe('abstained'); expect(result.citations).toEqual([]);
});
it('distingue alteração de regra, rateio ausente e acesso necessário', () => {
  expect(demoAnswer(demoSuggestions[1], defaultContext).status).toBe('conflict');
  expect(demoAnswer(demoSuggestions[5], defaultContext).status).toBe('abstained');
  expect(demoAnswer(demoSuggestions[6], defaultContext).status).toBe('access_required');
});
it('preserva 14 versões, com ausência explícita do PDF histórico', () => {
  expect(demoDocuments).toHaveLength(14);
  expect(demoDocuments.find(d => d.id === 'RG_1100@1.0.0')?.fileUrl).toBeUndefined();
  for (const fact of demoFacts) expect(fact.citation.page).toBeGreaterThan(0);
});

import { vi, afterEach } from 'vitest';
import { readDemo, writeDemo, resetDemo, DEMO_STORAGE_KEY } from '@/services/demo/storage';
afterEach(() => vi.unstubAllGlobals());
it('isola registros por persona e permite reset sem afetar outras chaves', async () => {
  const map = new Map<string, string>([['other-app', 'preservado']]);
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', { getItem: (key: string) => map.get(key) || null, setItem: (key: string, value: string) => map.set(key, value), removeItem: (key: string) => map.delete(key) });
  const { createDemoGateway } = await import('@/services/demo/provider');
  const gateway = createDemoGateway();
  await gateway.saveRecord({ id: 'one', title: 'Teste', kind: 'analysis', persona: 'ana', facts: demoFacts.slice(0, 1), context: defaultContext, createdAt: '2026-11-12T00:00:00Z' });
  expect(await gateway.records('ana')).toHaveLength(1);
  expect(await gateway.records('carlos')).toHaveLength(0);
  resetDemo(); expect(readDemo().records).toEqual([]);
  expect(map.get('other-app')).toBe('preservado');
  map.set(DEMO_STORAGE_KEY, 'invalid'); expect(readDemo().records).toEqual([]);
  expect(() => writeDemo(s => s)).not.toThrow();
});
