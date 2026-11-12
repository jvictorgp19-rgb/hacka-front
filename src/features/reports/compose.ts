import type { Fact } from '@/contracts/models';
export const reportSections = [ ['obligations','Obrigações e próximos passos'], ['risks','Riscos e pontos de atenção'], ['deadlines','Prazos relevantes'], ['values','Valores e alçadas'] ] as const;
export function composeReport(title:string, facts:Fact[], baseUrl='') {
  const lines=[title,'Síntese composta a partir das evidências selecionadas.',''];
  for(const [key,label] of reportSections) {
    const section=facts.filter(f=>f.perspective===key); if(!section.length)continue;
    lines.push(label,...section.map(f=>`- ${f.text} [${f.citation.codigo} v${f.citation.versao}, ${f.citation.item}]`),'');
  }
  lines.push('Fontes');
  for(const citation of [...new Map(facts.map(f=>[f.citation.id,f.citation])).values()]) {
    lines.push(`${citation.codigo} v${citation.versao} | ${citation.status} | ${citation.item}${citation.page?` | página ${citation.page}`:''}`,citation.trecho,citation.url?(baseUrl?new URL(citation.url,baseUrl).href:citation.url):'Arquivo não disponível','');
  }
  lines.push('Em caso de divergência, prevalece o documento oficial.');
  return lines.join('\n');
}
