// Temporary adapter for the preserved UI. No HTTP fallback and no server route.
import { getGateway } from '@/services';
import { defaultContext } from '@/contracts/models';
import type { ChatMessage } from '@/components/CopilotSidebar';
export { PERSONAS_NOMINAIS } from '@/features/identity/personas';
export type { PersonaNominal, RbacLevel } from '@/features/identity/personas';
export interface RadarEvent { id: string; dataLimite: string; titulo: string; documento: string; responsavel: string; criticidade: 'Crítica' | 'Alta' | 'Normal'; detalhe: string }
export interface AccessRequestItem { id: string; solicitante: string; dominioDono: string; perguntaOriginal: string }
export interface IngestAuditFinding { id: string; camada: string; severidade: string; documentosEnvolvidos: string[]; descricao: string; acaoRecomendada: string }
export async function apiChat(payload: { message: string; tema: string; perfil: string; personaId?: string }) {
  const gateway = await getGateway();
  const result = await gateway.ask(payload.message, { ...defaultContext, persona: payload.personaId || 'ana', tema: ['ferias', 'inovacao', 'locacao'].includes(payload.tema) ? payload.tema as 'ferias' | 'inovacao' | 'locacao' : 'todos' });
  const data: Omit<ChatMessage, 'id' | 'role' | 'text'> & { answer: string } = {
    answer: result.text, bullets: result.facts.map(f => f.text), citations: result.citations,
    honestAbstention: result.status === 'abstained' ? { lacuna: result.text, donoDominio: 'NIN / área responsável', botaoAcao: 'Consultar a área (demo)', detalhesExtras: [] } : undefined,
    rbacBlock: result.status === 'access_required' ? { dominioResponsavel: 'GGC', nivelExigido: 'Consultar área', mensagem: result.text } : undefined,
    revokedAlert: result.status === 'conflict' ? { codigo: 'NG_111', versaoRevogada: '2.0.0', substituidoPor: '3.0.0', pegadinha: result.text } : undefined,
  };
  return { data, source: gateway.mode };
}
export async function apiRadar(): Promise<{ data: RadarEvent[] }> {
  const gateway = await getGateway();
  const data = await gateway.deadlines();
  return { data: data.map(d => ({ id: d.id, dataLimite: d.date, titulo: d.title, documento: d.fact.citation.codigo, responsavel: d.owner, criticidade: d.priority, detalhe: d.detail })) };
}
export async function apiAccessList(): Promise<{ data: AccessRequestItem[] }> {
  const gateway = await getGateway();
  return { data: (await gateway.requests('ana')).map(r => ({ id: r.id, solicitante: r.persona, dominioDono: r.owner, perguntaOriginal: r.reason })) };
}
export async function apiIngestAudit(): Promise<{ data: IngestAuditFinding[] }> {
  const gateway = await getGateway();
  return { data: (await gateway.findings()).map(f => ({ id: f.id, camada: 'Demonstração / dados cadastrados', severidade: f.title, documentosEnvolvidos: f.documents, descricao: f.detail, acaoRecomendada: 'Validar com a área responsável.' })) };
}
