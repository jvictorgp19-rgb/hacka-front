import type { AnalysisContext, Fact, SavedRecord } from '@/contracts/models';
export function relatedRecords(
  facts: Fact[],
  context: AnalysisContext,
  records: SavedRecord[],
  excludeId = '',
) {
  const sources = new Set(facts.map((f) => f.citation.documentId));
  return records
    .filter((r) => r.id !== excludeId)
    .map((record) => {
      const overlap = new Set(
        record.facts
          .filter((f) => sources.has(f.citation.documentId))
          .map((f) => f.citation.documentId),
      ).size;
      const sameTheme = context.tema !== 'todos' && context.tema === record.context.tema;
      return {
        record,
        score: overlap * 3 + (sameTheme ? 2 : 0),
        reason: [overlap ? `${overlap} fonte(s) em comum` : '', sameTheme ? 'mesmo tema' : '']
          .filter(Boolean)
          .join(' · '),
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
export function recordHref(record: SavedRecord) {
  if (record.kind === 'report') return '/resumos/?registro=' + encodeURIComponent(record.id);
  const c = record.context;
  return (
    '/analises/?' +
    new URLSearchParams({
      registro: record.id,
      tema: c.tema,
      area: c.area,
      perspectiva: c.perspective,
      de: c.from,
      ate: c.to,
      ids: record.facts.map((f) => f.id).join(','),
    })
  );
}
