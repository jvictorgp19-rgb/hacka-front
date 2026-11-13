import { it, expect } from 'vitest';
import { filterEvidence } from '@/features/analyses/filter';
import { demoFacts } from '@/services/demo/catalog';
import { defaultContext } from '@/contracts/models';
it('combina tema, área, perspectiva e período sem substituir seleção vazia', () => {
  const context = {
    ...defaultContext,
    tema: 'inovacao' as const,
    area: 'NIN',
    perspective: 'deadlines' as const,
    from: '2027-03-01',
    to: '2027-03-31',
  };
  expect(filterEvidence(demoFacts, context).map((f) => f.id)).toEqual(['inovacao-fiscal']);
  expect(filterEvidence(demoFacts, { ...context, area: 'GGC' })).toEqual([]);
  expect(filterEvidence(demoFacts, context, ['ferias-pedido'])).toEqual([]);
  expect(filterEvidence(demoFacts, { ...context, from: '2027-04-01' })).toEqual([]);
});
