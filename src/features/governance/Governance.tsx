'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/context';
import { EmptyState, PageHeading } from '@/components/ui/primitives';
import { useUrlFilters } from '@/lib/url-filters';
import type { AccessRequest } from '@/contracts/models';
const labels = {
  pending: 'Pendente',
  curated: 'Respondido com orientação curada',
  denied: 'Negado com justificativa',
  granted: 'Concessão registrada',
};
export default function Governance() {
  const { context } = useWorkspace();
  const { params } = useUrlFilters();
  return <GovernancePanel key={context.persona + ':' + (params.get('pedido') || '')} />;
}
function GovernancePanel() {
  const { gateway, context, identity, documents, findings } = useWorkspace();
  const { params } = useUrlFilters();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [reason, setReason] = useState(params.get('pedido') || '');
  const areas = [...new Set(documents.map((d) => d.area))];
  const [owner, setOwner] = useState(
    areas.includes(params.get('area') || '') ? params.get('area')! : areas[0] || 'GGC',
  );
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const isCurator =
    gateway?.mode === 'demo'
      ? context.persona === 'curadora_ggc'
      : !!identity?.capabilities.includes('curate');
  useEffect(() => {
    const controller = new AbortController();
    gateway
      ?.requests(context.persona, controller.signal)
      .then((list) => {
        if (!controller.signal.aborted) setRequests(list);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setMessage(e instanceof Error ? e.message : 'Pedidos indisponíveis.');
      });
    return () => controller.abort();
  }, [gateway, context.persona]);
  async function create() {
    if (!gateway || reason.trim().length < 10 || busy) return;
    setBusy('new');
    setMessage('');
    try {
      const result = await gateway.createRequest(reason.trim(), context.persona, owner);
      setRequests((list) => [result, ...list]);
      setReason('');
      setMessage(
        gateway.mode === 'demo'
          ? 'Pedido registrado localmente na demonstração.'
          : 'Pedido confirmado pela API.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Pedido não registrado.');
    } finally {
      setBusy('');
    }
  }
  async function decide(id: string, status: 'curated' | 'denied' | 'granted') {
    if (!gateway || !responses[id]?.trim() || busy) return;
    setBusy(id);
    setMessage('');
    try {
      const result = await gateway.decideRequest(id, status, responses[id].trim(), context.persona);
      setRequests((list) => list.map((r) => (r.id === id ? result : r)));
      setMessage(
        gateway.mode === 'demo'
          ? 'Decisão salva localmente. Nenhum acesso real foi concedido.'
          : 'Decisão confirmada pela API.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Decisão não registrada.');
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="QUALIDADE E RESPONSABILIDADE"
        title="Curadoria e orientações"
        description="Peça uma orientação à área responsável e acompanhe a resposta sem expor documentos protegidos."
      />
      <div className="notice">
        {gateway?.mode === 'demo'
          ? 'Simulação com dados sintéticos. Registros ficam neste navegador e não constituem auditoria imutável. A curadoria de exemplo pertence à GGC.'
          : 'A identidade, as capacidades e as decisões são confirmadas pelo serviço. O frontend não concede permissão.'}
      </div>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <div className="card-grid">
        <section className="evidence-card">
          <div className="assistant-label">
            <MessageSquare size={17} />
            SOLICITAR ORIENTAÇÃO
          </div>
          <form
            className="access-form"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <label>
              Área responsável
              <select
                aria-label="Área responsável pelo pedido"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                {areas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>
            <label>
              Justificativa e pergunta
              <textarea
                aria-label="Justificativa do pedido"
                required
                minLength={10}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o que precisa saber e por quê…"
              />
            </label>
            <p className="muted">
              Informe pelo menos 10 caracteres. Evite incluir dados pessoais ou conteúdo protegido.
            </p>
            <button className="primary-button" disabled={reason.trim().length < 10 || !!busy}>
              Registrar pedido
            </button>
          </form>
        </section>
        <section className="evidence-card">
          <div className="assistant-label">
            <ShieldCheck size={17} />
            COMO FUNCIONA
          </div>
          <ol className="access-steps">
            <li>Você informa sua necessidade e a área responsável.</li>
            <li>A área avalia e pode enviar uma resposta curada ou negar com justificativa.</li>
            <li>A orientação pode ser reutilizada dentro das permissões definidas pelo serviço.</li>
          </ol>
          <p className="muted">
            Receber uma orientação não abre automaticamente o documento original.
          </p>
        </section>
      </div>
      <div className="section-heading">
        <h2>{isCurator ? 'Fila de curadoria e pedidos' : 'Meus pedidos'}</h2>
        <span className="muted">{requests.length} registro(s)</span>
      </div>
      {!requests.length ? (
        <EmptyState title="Nenhum pedido para este perfil">
          Quando uma orientação for registrada, ela aparecerá aqui.
        </EmptyState>
      ) : (
        <div className="request-list">
          {requests.map((request) => (
            <article className="evidence-card" key={request.id}>
              <div className="card-meta">
                <span>
                  {request.owner} · solicitante: {request.persona}
                </span>
                <span>{labels[request.status]}</span>
              </div>
              <h3>{request.reason}</h3>
              <p className="request-meta">
                Registrado em {new Date(request.createdAt).toLocaleString('pt-BR')} · #
                {request.id.slice(0, 8)}
              </p>
              {request.response && (
                <div className="curated-response">
                  <strong>
                    {request.status === 'denied'
                      ? 'Justificativa da decisão'
                      : 'Orientação registrada'}
                  </strong>
                  <p>{request.response}</p>
                  {request.decidedBy && (
                    <small>
                      {request.decidedBy}
                      {request.decidedAt
                        ? ` · ${new Date(request.decidedAt).toLocaleString('pt-BR')}`
                        : ''}
                    </small>
                  )}
                </div>
              )}
              {isCurator && request.status === 'pending' && (
                <form
                  className="access-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void decide(request.id, 'curated');
                  }}
                >
                  <label>
                    Resposta ou justificativa
                    <textarea
                      aria-label="Resposta da curadoria"
                      required
                      value={responses[request.id] || ''}
                      onChange={(e) =>
                        setResponses((current) => ({ ...current, [request.id]: e.target.value }))
                      }
                    />
                  </label>
                  <div className="toolbar">
                    <button
                      className="primary-button"
                      disabled={!responses[request.id]?.trim() || !!busy}
                    >
                      Enviar resposta curada
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={!responses[request.id]?.trim() || !!busy}
                      onClick={() => void decide(request.id, 'denied')}
                    >
                      Negar com justificativa
                    </button>
                    {gateway?.mode === 'demo' && (
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={!responses[request.id]?.trim() || !!busy}
                        onClick={() => void decide(request.id, 'granted')}
                      >
                        Simular concessão
                      </button>
                    )}
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
      <details className="audit-details">
        <summary>Revisões e inconsistências cadastradas no acervo ({findings.length})</summary>
        <div className="card-grid">
          {findings.map((f) => (
            <article className="evidence-card" key={f.id}>
              <h3>{f.title}</h3>
              <p>{f.detail}</p>
              <footer>
                <span className="muted">{f.documents.join(' · ')}</span>
              </footer>
            </article>
          ))}
        </div>
      </details>
    </>
  );
}
