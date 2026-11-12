'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getGateway } from '@/services';
import type { AppGateway } from '@/services/gateway';
import { defaultContext, type AnalysisContext, type Citation, type Deadline, type DocumentVersion, type Fact, type Finding, type Identity } from '@/contracts/models';

interface WorkspaceState {
  gateway: AppGateway | null; documents: DocumentVersion[]; facts: Fact[];
  deadlines: Deadline[]; findings: Finding[]; identity: Identity | null;
  context: AnalysisContext; setContext: (context: AnalysisContext) => void;
  source: Citation | null; openSource: (source: Citation | null) => void;
  loading: boolean; error: string; reload: () => void;
}
const Workspace = createContext<WorkspaceState | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [gateway, setGateway] = useState<AppGateway | null>(null);
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [context, setContext] = useState(defaultContext);
  const [source, openSource] = useState<Citation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getGateway().then(async g => {
      const [docs, evidence, events, issues, user] = await Promise.all([g.documents(controller.signal), g.facts(controller.signal), g.deadlines(controller.signal), g.findings(controller.signal), g.identity(controller.signal)]);
      if (controller.signal.aborted) return;
      setGateway(g); setDocuments(docs); setFacts(evidence); setDeadlines(events); setFindings(issues); setIdentity(user);
      if (g.mode === 'api') setContext(current => ({ ...current, persona: user.id }));
      setLoading(false); setError('');
    }).catch(e => { if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : 'Não foi possível carregar o workspace.'); setLoading(false); } });
    return () => controller.abort();
  }, [revision]);
  return <Workspace.Provider value={{ gateway, documents, facts, deadlines, findings, identity, context, setContext, source, openSource, loading, error, reload: () => { setError(''); setLoading(true); setRevision(n => n + 1); } }}>{children}</Workspace.Provider>;
}
export function useWorkspace() { const context = useContext(Workspace); if (!context) throw new Error('WorkspaceProvider ausente'); return context; }
export const themeLabels = { ferias: 'Férias', inovacao: 'Inovação', locacao: 'Locação' };
export const perspectiveLabels = { risks: 'Riscos', deadlines: 'Prazos', obligations: 'Obrigações', values: 'Valores' };
