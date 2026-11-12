import { it, expect } from 'vitest';
import { composeReport } from '@/features/reports/compose';
import { demoFacts } from '@/services/demo/catalog';
it('compõe somente o que foi selecionado e mantém a fonte na exportação', () => {
  const one = composeReport('Reunião', [demoFacts[0]], 'https://example.test');
  const two = composeReport('Reunião', [demoFacts[1]], 'https://example.test');
  expect(one).not.toBe(two);
  expect(one).toContain(demoFacts[0].text);
  expect(one).not.toContain(demoFacts[1].text);
  expect(one).toContain(demoFacts[0].citation.trecho);
  expect(one).toContain('https://example.test/docs_acervo/');
});
