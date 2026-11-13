'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Files, Search, Upload } from 'lucide-react';
import { useWorkspace, themeLabels } from '@/features/workspace/context';
import { EmptyState, PageHeading } from '@/components/ui/primitives';
import Dialog from '@/components/ui/Dialog';
import { useUrlFilters } from '@/lib/url-filters';
import { validatePdf, fileKey, MAX_FILES } from './validation';
import { useUploadHistory } from './use-upload-history';
import { saveUploadBlob } from './download';
import { ApiError, type UploadItem } from '@/contracts/models';
const statuses = {
  waiting: 'Aguardando envio',
  processing: 'Processamento informado pela API',
  ready: 'Pronto',
  failed: 'Falha',
  not_extracted: 'Conteúdo ainda não extraído',
};
export default function Documents() {
  const {
    gateway,
    documents,
    facts,
    openSource,
    uploadJobs: jobs,
    setUploadJobs: setJobs,
    context,
  } = useWorkspace();
  const { params, update } = useUrlFilters();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [deciding, setDeciding] = useState<string | null>(null);
  const decisionLock = useRef(false);
  const [rejectId, setRejectId] = useState('');
  const [response, setResponse] = useState('');
  const files = useRef(new Map<string, File>());
  const controller = useRef<AbortController | null>(null);
  const { historyLoading, refreshHistory, invalidateHistory } = useUploadHistory(
    gateway,
    jobs,
    setJobs,
    setError,
  );
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    files.current.clear();
    controller.current?.abort();
  }, [gateway, context.persona]);
  const selected = documents.find((doc) => doc.id === params.get('doc'));
  const query = (params.get('q') || '').toLocaleLowerCase('pt-BR');
  const filtered = documents.filter(
    (doc) =>
      (!params.get('tema') || doc.tema === params.get('tema')) &&
      (!params.get('area') || doc.area === params.get('area')) &&
      (!params.get('fase') || String(doc.vigente) === params.get('fase')) &&
      `${doc.codigo} ${doc.titulo} ${doc.resumo}`.toLocaleLowerCase('pt-BR').includes(query),
  );
  async function decide(id: string, status: 'aprovado' | 'recusado') {
    const job = jobs.find((item) => item.id === id);
    if (!gateway || gateway.mode !== 'api' || !job?.canApprove || decisionLock.current) return;
    decisionLock.current = true;
    setDeciding(id);
    try {
      const result = await gateway.decideUpload(
        job.remoteId || job.id,
        status,
        status === 'recusado' ? response.trim() : '',
      );
      setJobs((value) =>
        value.map((row) => (row.id === id ? { ...result, id, remoteId: result.id } : row)),
      );
      invalidateHistory();
      setError('');
      setRejectId('');
      setResponse('');
    } catch (error) {
      if (error instanceof ApiError && ['403', '404', '409'].includes(error.code)) refreshHistory();
      setError(error instanceof Error ? error.message : 'Não foi possível confirmar a decisão.');
    } finally {
      decisionLock.current = false;
      setDeciding(null);
    }
  }
  async function submitFile(file: File, key: string) {
    if (!gateway) return;
    setJobs((list) =>
      list.map((job) =>
        job.id === key ? { ...job, status: 'waiting', message: 'Preparando envio.' } : job,
      ),
    );
    try {
      const [result] = await gateway.upload([file], controller.current?.signal);
      if (!result) throw new Error('O serviço não retornou o estado do arquivo.');
      setJobs((list) =>
        list.map((job) => (job.id === key ? { ...result, id: key, remoteId: result.id } : job)),
      );
    } catch (e) {
      setJobs((list) =>
        list.map((job) =>
          job.id === key
            ? {
                ...job,
                status: 'failed',
                message: e instanceof Error ? e.message : 'Falha no envio.',
              }
            : job,
        ),
      );
    }
  }
  async function enqueue(selection: FileList | null) {
    if (!selection || !gateway || busy) return;
    setError('');
    setBusy(true);
    controller.current = new AbortController();
    try {
      for (const file of Array.from(selection).slice(0, MAX_FILES)) {
        const key = fileKey(file);
        if (files.current.has(key)) {
          setError('Um arquivo repetido foi ignorado. Os demais continuam na fila.');
          continue;
        }
        const message = await validatePdf(file);
        files.current.set(key, file);
        setJobs((list) => [
          ...list,
          {
            id: key,
            name: file.name,
            size: file.size,
            status: message ? 'failed' : 'waiting',
            message: message || 'Aguardando envio.',
          },
        ]);
        if (!message) await submitFile(file, key);
      }
      if (selection.length > MAX_FILES)
        setError('Foram considerados os primeiros 10 arquivos do lote.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.');
    } finally {
      setBusy(false);
    }
  }
  async function demonstrateProcessing() {
    if (busy) return;
    setBusy(true);
    const id = 'fixture-ng111';
    const item: UploadItem = {
      id,
      name: 'Exemplo: NG_111 já cadastrado',
      size: 0,
      status: 'waiting',
      message: 'Simulação de estados sobre uma fonte já conhecida; não é ingestão de arquivo novo.',
    };
    setJobs((list) => [...list.filter((j) => j.id !== id), item]);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, status: 'processing' } : j)));
    await new Promise((resolve) => setTimeout(resolve, 250));
    setJobs((list) =>
      list.map((j) =>
        j.id === id
          ? {
              ...j,
              status: 'ready',
              message:
                'Exemplo concluído. O documento já fazia parte do catálogo e suas evidências foram conferidas previamente.',
            }
          : j,
      ),
    );
    setBusy(false);
  }
  return (
    <>
      <PageHeading
        eyebrow="SEU CONHECIMENTO"
        title="Acervo documental"
        description="Encontre a versão certa. Consulte a fonte antes de decidir."
        action={
          <label className="primary-button upload-label">
            <Upload size={16} />
            Adicionar PDFs
            <input
              aria-label="Adicionar PDFs"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              disabled={busy}
              onChange={(e) => {
                void enqueue(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        }
      />
      <div className="summary-strip">
        <span>
          <strong>{documents.filter((d) => d.vigente).length}</strong> versões vigentes
        </span>
        <span>
          <strong>{documents.filter((d) => d.fileUrl).length}</strong> PDFs disponíveis
        </span>
        <span>
          <strong>{new Set(documents.map((d) => d.tema)).size}</strong> temas
        </span>
        <span className="muted">Catálogo fornecido pela API</span>
      </div>
      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Buscar no acervo"
            placeholder="Buscar por título, código ou assunto…"
            value={params.get('q') || ''}
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
        <select
          aria-label="Tema dos documentos"
          value={params.get('tema') || ''}
          onChange={(e) => update({ tema: e.target.value })}
        >
          <option value="">Todos os temas</option>
          {Object.entries(themeLabels).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Área dos documentos"
          value={params.get('area') || ''}
          onChange={(e) => update({ area: e.target.value })}
        >
          <option value="">Todas as áreas</option>
          {[...new Set(documents.map((d) => d.area))].map((area) => (
            <option key={area}>{area}</option>
          ))}
        </select>
        <select
          aria-label="Fase dos documentos"
          value={params.get('fase') || ''}
          onChange={(e) => update({ fase: e.target.value })}
        >
          <option value="">Todas as versões</option>
          <option value="true">Vigentes</option>
          <option value="false">Substituídas</option>
        </select>
      </div>
      {gateway?.mode === 'demo' && (
        <div className="notice demo-upload-notice">
          <span>
            PDFs novos não são interpretados nesta demo. Você pode visualizar os estados de um
            exemplo já cadastrado.
          </span>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => void demonstrateProcessing()}
          >
            Ver exemplo de processamento
          </button>
        </div>
      )}
      {(jobs.length > 0 || error || gateway?.mode === 'api') && (
        <section className="upload-queue" aria-label="Fila de arquivos">
          <div className="section-heading">
            <h2>Seus arquivos</h2>
            {gateway?.mode === 'api' && (
              <button
                className="secondary-button"
                disabled={historyLoading}
                onClick={refreshHistory}
              >
                {historyLoading ? 'Carregando arquivos…' : 'Atualizar arquivos'}
              </button>
            )}
            {busy && (
              <button className="secondary-button" onClick={() => controller.current?.abort()}>
                Cancelar espera
              </button>
            )}
          </div>
          <p className="muted">
            {gateway?.mode === 'demo'
              ? 'Seleção local: PDFs novos não são lidos nem indexados por esta demonstração.'
              : 'Os estados abaixo são informados pelo serviço de processamento.'}{' '}
            Limite: 10 PDFs por lote, 20 MiB por arquivo.
          </p>
          {error && (
            <p role="alert" className="notice">
              {error}
            </p>
          )}
          {jobs.map((job) => (
            <div className="upload-row" key={job.id}>
              <Files size={18} />
              <div>
                <strong>{job.name}</strong>
                <span>
                  {statuses[job.status]}
                  {job.id === 'fixture-ng111' ? ' (simulado)' : ''} · {(job.size / 1024).toFixed(1)}{' '}
                  KiB
                </span>
                <p>{job.message}</p>
                {job.saved && (
                  <span>
                    {job.fileAvailable
                      ? 'Salvo no sistema'
                      : 'Registro salvo; original indisponível'}
                  </span>
                )}
                {job.aprovacao === 'pendente' && <p>Aguardando aprovação: {job.aprovadores}</p>}
                {job.aprovacao === 'aprovado' && (
                  <p role="status">
                    Confirmado — aprovado por {job.decidedBy}
                    {job.decidedAt ? ` em ${new Date(job.decidedAt).toLocaleString('pt-BR')}` : ''}.
                  </p>
                )}
                {job.aprovacao === 'dispensado' && (
                  <p>Confirmado automaticamente — aprovação dispensada.</p>
                )}
                {job.aprovacao === 'recusado' && <p>Recusado na revisão.</p>}
              </div>
              {job.fileAvailable && gateway && (
                <button
                  className="secondary-button"
                  onClick={async () => {
                    try {
                      const blob = await gateway.downloadUpload(job.remoteId || job.id);
                      saveUploadBlob(blob, job.name);
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : 'Não foi possível baixar o arquivo.',
                      );
                    }
                  }}
                >
                  Baixar original
                </button>
              )}
              {job.canApprove && gateway?.mode === 'api' && (
                <div className="toolbar upload-actions">
                  <button
                    className="primary-button"
                    disabled={deciding !== null}
                    onClick={() => void decide(job.id, 'aprovado')}
                  >
                    {deciding === job.id ? 'Confirmando…' : 'Aprovar documento'}
                  </button>
                  <button
                    className="secondary-button"
                    disabled={deciding !== null}
                    onClick={() => {
                      setRejectId(job.id);
                      setResponse('');
                    }}
                  >
                    Recusar documento
                  </button>
                </div>
              )}
              {job.status === 'processing' && job.remoteId && gateway && (
                <button
                  className="secondary-button"
                  onClick={async () => {
                    try {
                      const result = await gateway.uploadStatus(job.remoteId!);
                      setJobs((list) =>
                        list.map((row) =>
                          row.id === job.id ? { ...result, id: job.id, remoteId: result.id } : row,
                        ),
                      );
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Não foi possível atualizar.');
                    }
                  }}
                >
                  Atualizar processamento
                </button>
              )}
              {job.status === 'failed' &&
                files.current.get(job.id)?.name.toLowerCase().endsWith('.pdf') && (
                  <button
                    className="secondary-button"
                    disabled={busy}
                    onClick={async () => {
                      const file = files.current.get(job.id)!;
                      const invalid = await validatePdf(file);
                      if (invalid) {
                        setError(invalid);
                        return;
                      }
                      controller.current = new AbortController();
                      await submitFile(file, job.id);
                    }}
                  >
                    Tentar novamente
                  </button>
                )}
            </div>
          ))}
        </section>
      )}
      <div className="section-heading">
        <h2>
          Documentos <span className="muted">{filtered.length} resultado(s)</span>
        </h2>
      </div>
      {!filtered.length ? (
        <EmptyState title="Nenhum documento com esses filtros">
          Ajuste a busca, o tema ou a versão desejada.
        </EmptyState>
      ) : (
        <div className="document-list">
          {filtered.map((doc) => (
            <button className="document-row" key={doc.id} onClick={() => update({ doc: doc.id })}>
              <span className="document-icon">
                <FileIcon />
              </span>
              <span className="document-title">
                <strong>{doc.titulo}</strong>
                <small>
                  {doc.codigo} · v{doc.versao} · {doc.area}
                </small>
              </span>
              <span className="tag">{doc.vigente ? 'Vigente' : 'Substituída'}</span>
              <span className="muted document-theme">{themeLabels[doc.tema]}</span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
      <Dialog
        open={!!rejectId}
        title="Recusar documento"
        onClose={() => {
          if (!deciding) setRejectId('');
        }}
      >
        <form
          className="access-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (response.trim().length >= 10) void decide(rejectId, 'recusado');
          }}
        >
          <label>
            Motivo da recusa
            <textarea
              required
              minLength={10}
              maxLength={1000}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
            />
          </label>
          <button
            className="primary-button"
            disabled={deciding !== null || response.trim().length < 10}
          >
            Confirmar recusa
          </button>
        </form>
      </Dialog>
      <Dialog
        open={!!selected}
        title={selected?.codigo || 'Documento'}
        onClose={() => update({ doc: '' })}
      >
        {selected && (
          <>
            <p className="detail-title">{selected.titulo}</p>
            <div className="source-tags">
              <span className="tag">v{selected.versao}</span>
              <span className="tag">{selected.fase}</span>
              <span className="tag">{selected.camada}</span>
            </div>
            <p>{selected.resumo}</p>
            <dl className="metadata">
              <dt>Área responsável</dt>
              <dd>{selected.area}</dd>
              <dt>Vigência</dt>
              <dd>{selected.vigencia}</dd>
              {selected.substitui && (
                <>
                  <dt>Substitui</dt>
                  <dd>{selected.substitui}</dd>
                </>
              )}
            </dl>
            <h3>Versões relacionadas</h3>
            {documents
              .filter((d) => d.codigo === selected.codigo)
              .map((d) => (
                <p key={d.id} className="version-row">
                  v{d.versao} · {d.fase}
                  {!d.fileUrl && ' · PDF ausente'}
                </p>
              ))}
            <h3>Evidências verificadas</h3>
            {facts
              .filter((f) => f.citation.documentId === selected.id)
              .map((f) => (
                <button
                  className="source-link detail-source"
                  key={f.id}
                  onClick={() => {
                    update({ doc: '' });
                    openSource(f.citation);
                  }}
                >
                  {f.title} · {f.citation.item}
                </button>
              ))}
            {selected.fileUrl ? (
              <a
                className="primary-button"
                href={selected.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir PDF <ArrowUpRight size={15} />
              </a>
            ) : (
              <p className="notice">
                O registro histórico foi preservado, mas este PDF não está no acervo disponível.
              </p>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}
function FileIcon() {
  return <Files size={21} />;
}
