import { it, expect } from 'vitest';
import { composeReport } from '@/features/reports/compose';
import { facts } from '../fixtures/facts';
it('compõe somente o que foi selecionado e mantém a fonte na exportação', () => {
  const one = composeReport('Reunião', [facts[0]], 'https://example.test');
  const two = composeReport('Reunião', [facts[1]], 'https://example.test');
  expect(one).not.toBe(two);
  expect(one).toContain(facts[0].text);
  expect(one).not.toContain(facts[1].text);
  expect(one).toContain(facts[0].citation.trecho);
  expect(one).toContain('https://example.test/documents/');
});
