'use client';
import { useState } from 'react';
import { Download, FileText, Printer, Save } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/context';
import { EmptyState, PageHeading } from '@/components/ui/primitives';
import { useUrlFilters } from '@/lib/url-filters';
import { useRecords } from './use-records';
import { composeReport, reportSections } from './compose';
export default function Reports() {
  const { context } = useWorkspace();
  return <ReportComposer key={context.persona} />;
}
function ReportComposer() {
  const { gateway, context, facts, selection, setSelection, openSource } = useWorkspace();
  const { params, update } = useUrlFilters();
  const { records, setRecords, error: loadError, loading } = useRecords();
  const [title, setTitle] = useState('Resumo executivo');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const saved = params.get('registro')
    ? records.find((r) => r.id === params.get('registro') && r.kind === 'report')
    : undefined;
  const selected = params.get('registro') ? saved?.facts || [] : selection;
  const reportTitle = saved?.title || title;
  const available = [...new Map([...facts, ...selected].map((f) => [f.id, f])).values()];
  async function save() {
    if (!gateway || !selected.length || !reportTitle.trim() || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await gateway.saveRecord({
        id: crypto.randomUUID(),
        kind: 'report',
        title: reportTitle.trim(),
        persona: context.persona,
        facts: selected,
        context,
        createdAt: new Date().toISOString(),
      });
      setRecords((list) => [result, ...list]);
      update({ registro: result.id });
      setMessage('Versão confirmada pela API.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const blob = new Blob([composeReport(reportTitle, selected, window.location.origin)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'resumo-executivo.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="no-print">
        <PageHeading
          eyebrow="DO ACERVO À REUNIÃO"
          title="Resumos executivos"
          description="Selecione evidências, organize uma síntese e leve as fontes para a decisão."
          action={
            <button
              className="primary-button"
              disabled={!selected.length || !reportTitle.trim() || busy || !!saved}
              onClick={() => void save()}
            >
              <Save size={15} />
              Salvar versão
            </button>
          }
        />
        {(message || loadError) && (
          <p className="notice" role="status">
            {message || loadError}
          </p>
        )}
        {params.get('registro') && loading && <p role="status">Carregando versão salva…</p>}
        {params.get('registro') && !loading && !saved && (
          <p className="notice">
            Este resumo não foi encontrado para o perfil atual.{' '}
            <button className="source-link" onClick={() => update({ registro: '' })}>
              Criar outro resumo
            </button>
          </p>
        )}
        <div className="report-controls">
          <label>
            Título
            <input
              aria-label="Título do resumo"
              value={reportTitle}
              readOnly={!!saved}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="toolbar">
            {saved && (
              <button
                className="secondary-button"
                onClick={() => {
                  setTitle(saved.title);
                  setSelection(saved.facts);
                  update({ registro: '' });
                  setMessage('Edite a seleção e salve como uma nova versão.');
                }}
              >
                Criar nova versão
              </button>
            )}
            <button className="secondary-button" disabled={!selected.length} onClick={download}>
              <Download size={15} />
              Baixar texto
            </button>
            <button
              className="secondary-button"
              disabled={!selected.length}
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Imprimir / PDF
            </button>
          </div>
        </div>
        <details className="evidence-picker" open={!selected.length}>
          <summary>{selected.length} evidência(s) selecionada(s) · ajustar seleção</summary>
          {saved && (
            <p className="muted">
              Esta é uma versão salva. Crie uma nova versão para alterar a seleção.
            </p>
          )}
          <div>
            {available.map((fact) => (
              <label className="check-line" key={fact.id}>
                <input
                  type="checkbox"
                  aria-label={'Incluir ' + fact.title}
                  checked={selected.some((f) => f.id === fact.id)}
                  disabled={!!saved}
                  onChange={() =>
                    setSelection(
                      selected.some((f) => f.id === fact.id)
                        ? selected.filter((f) => f.id !== fact.id)
                        : [...selected, fact],
                    )
                  }
                />
                <span>
                  {fact.title}
                  <small>
                    {fact.citation.codigo} · {fact.citation.item}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </details>
      </div>
      {!selected.length ? (
        <EmptyState title="Escolha as evidências do seu resumo">
          Selecione itens aqui ou use a ação “Usar no resumo” nas análises e conversas.
        </EmptyState>
      ) : (
        <article className="report-preview">
          <header>
            <div className="eyebrow">RAIZ IQ / RESUMO EXECUTIVO</div>
            <h1>{reportTitle}</h1>
            <p>
              Composição a partir das evidências retornadas pela API.{' '}
              {saved && `Versão salva em ${new Date(saved.createdAt).toLocaleString('pt-BR')}.`}
            </p>
          </header>
          {reportSections.map(([key, label]) => {
            const section = selected.filter((f) => f.perspective === key);
            return (
              section.length > 0 && (
                <section key={key}>
                  <h2>{label}</h2>
                  <ul>
                    {section.map((f) => (
                      <li key={f.id}>
                        <strong>{f.title}</strong>
                        <p>{f.text}</p>
                        <button className="source-link" onClick={() => openSource(f.citation)}>
                          {f.citation.codigo} · v{f.citation.versao} · {f.citation.item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            );
          })}
          <section className="report-sources">
            <h2>Fontes e rastreabilidade</h2>
            {[...new Map(selected.map((f) => [f.citation.id, f.citation])).values()].map(
              (source) => (
                <div key={source.id}>
                  <FileText size={15} />
                  <p>
                    <strong>
                      {source.codigo} · v{source.versao} · {source.item}
                    </strong>
                    <span>{source.trecho}</span>
                    <small>
                      {source.page ? `Página ${source.page}. ` : ''}
                      {source.url || 'Arquivo não disponível.'}
                    </small>
                  </p>
                </div>
              ),
            )}
          </section>
          <footer>Em caso de divergência, prevalece o documento oficial.</footer>
        </article>
      )}
    </>
  );
}
