import type { AnalysisContext, Fact } from '@/contracts/models';
export function filterEvidence(facts: Fact[], context: AnalysisContext, ids: string[] = []) {
  return facts.filter(
    (fact) =>
      (!ids.length || ids.includes(fact.id)) &&
      (context.tema === 'todos' || context.tema === fact.tema) &&
      (!context.area || context.area === fact.area) &&
      context.perspective === fact.perspective &&
      (!context.from || (!!fact.date && fact.date >= context.from)) &&
      (!context.to || (!!fact.date && fact.date <= context.to)),
  );
}
