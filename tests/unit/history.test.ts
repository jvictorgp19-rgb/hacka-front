import { it, expect } from 'vitest';
import { relatedRecords, recordHref } from '@/features/history/related';
import { demoFacts } from '@/services/demo/catalog';
import { defaultContext, type SavedRecord } from '@/contracts/models';
const record: SavedRecord = {
  id: 'analysis',
  title: 'Teste',
  kind: 'analysis',
  persona: 'ana',
  context: { ...defaultContext, tema: 'ferias' },
  facts: demoFacts.filter((f) => f.tema === 'ferias'),
  createdAt: '2026-11-12T00:00:00Z',
};
it('sugere registros com justificativa e exclui o próprio resultado', () => {
  const related = relatedRecords(record.facts, record.context, [record]);
  expect(related).toHaveLength(1);
  expect(related[0].reason).toContain('fonte(s) em comum');
  expect(relatedRecords(record.facts, record.context, [record], record.id)).toHaveLength(0);
  expect(recordHref(record)).toContain('perspectiva=obligations');
  expect(recordHref(record)).toContain('registro=analysis');
});
