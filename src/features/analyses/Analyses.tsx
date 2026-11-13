'use client';
import { useState } from 'react';
import { useRecords } from '@/features/reports/use-records';
import { relatedRecords, recordHref } from '@/features/history/related';
import Link from 'next/link';
import { useWorkspace, themeLabels, perspectiveLabels } from '@/features/workspace/context';
import { PageHeading, EvidenceCard, EmptyState } from '@/components/ui/primitives';
import { useUrlFilters } from '@/lib/url-filters';
import { filterEvidence } from './filter';
import { contextSchema, type AnalysisContext } from '@/contracts/models';
export default function Analyses() {
  const {
    gateway,
    facts: liveFacts,
    context: workspaceContext,
    documents,
    findings,
    openSource,
    setContext,
    selection,
    setSelection,
  } = useWorkspace();
  const { params, update } = useUrlFilters();
  const { records, setRecords, error: recordsError, loading: recordsLoading } = useRecords();
  const saved = params.get('registro')
    ? records.find((r) => r.id === params.get('registro'))
    : undefined;
  const facts = params.get('registro') ? saved?.facts || [] : liveFacts;
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const context = contextSchema.parse({
    ...workspaceContext,
    tema: themeLabels[params.get('tema') as keyof typeof themeLabels]
      ? params.get('tema')
      : 'todos',
    area: params.get('area') || '',
    perspective: perspectiveLabels[params.get('perspectiva') as keyof typeof perspectiveLabels]
      ? params.get('perspectiva')
      : 'obligations',
    from: params.get('de') || '',
    to: params.get('ate') || '',
  });
  const ids = (params.get('ids') || '').split(',').filter(Boolean);
  const visible = filterEvidence(facts, context, ids);
  const baseFacts = facts.filter((f) => !ids.length || ids.includes(f.id));
  const mode = params.get('vista') || 'cards';
  const scopedFacts = Object.keys(perspectiveLabels).flatMap((perspective) =>
    filterEvidence(
      facts,
      { ...context, perspective: perspective as AnalysisContext['perspective'] },
      ids,
    ),
  );
  const scopedDocuments = documents.filter((doc) =>
    scopedFacts.some((f) => f.citation.documentId === doc.id),
  );
  const issues = findings.filter((f) =>
    scopedDocuments.some((doc) => f.documents.some((code) => code.startsWith(doc.codigo))),
  );
  function change(key: keyof AnalysisContext, value: string, urlKey: string = key) {
    update({ [urlKey]: value });
    setContext({ ...context, [key]: value });
  }
  const related = relatedRecords(scopedFacts, context, records, saved?.id);
  async function saveAnalysis() {
    if (!gateway || !visible.length || saving) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const record = await gateway.saveRecord({
        id: crypto.randomUUID(),
        kind: 'analysis',
        title: `${perspectiveLabels[context.perspective]} · ${context.tema === 'todos' ? 'Todos os temas' : themeLabels[context.tema]}`,
        persona: context.persona,
        facts: scopedFacts,
        context,
        createdAt: new Date().toISOString(),
      });
      setRecords((list) => [record, ...list]);
      setSaveMessage('Análise confirmada pela API.');
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : 'A análise não foi salva.');
    } finally {
      setSaving(false);
    }
  }
  const maximum = Math.max(...visible.map((f) => f.valueCents || 0), 1);
  return (
    <>
      <PageHeading
        eyebrow="INFORMAÇÃO EM PERSPECTIVA"
        title="Análises com fundamento"
        description="Mude a perspectiva sem perder o conjunto de evidências. Cada destaque mantém sua fonte."
        action={
          <Link className="primary-button" href="/resumos/">
            Compor resumo ({selection.length})
          </Link>
        }
      />
      {params.get('registro') && !saved && (
        <p className="notice">
          {recordsLoading
            ? 'Carregando análise salva…'
            : 'Esta análise não foi encontrada para o perfil atual.'}
          <button className="source-link" onClick={() => update({ registro: '', ids: '' })}>
            Explorar o acervo atual
          </button>
        </p>
      )}
      <div className="analysis-save-row">
        <button
          className="secondary-button"
          disabled={!visible.length || saving}
          onClick={() => void saveAnalysis()}
        >
          Salvar análise
        </button>
        {(saveMessage || recordsError) && (
          <span role="status" className="muted">
            {saveMessage || recordsError}
          </span>
        )}
        {saved && <span className="tag">Snapshot salvo · {saved.title}</span>}
      </div>
      <div className="toolbar">
        <select
          aria-label="Tema da análise"
          value={context.tema}
          onChange={(e) => change('tema', e.target.value)}
        >
          <option value="todos">Todos os temas</option>
          {Object.entries(themeLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Área da análise"
          value={context.area}
          onChange={(e) => change('area', e.target.value)}
        >
          <option value="">Todas as áreas</option>
          {[...new Set(facts.map((f) => f.area))].map((area) => (
            <option key={area}>{area}</option>
          ))}
        </select>
        <label className="date-filter">
          De
          <input
            aria-label="Data inicial da análise"
            type="date"
            value={context.from}
            onChange={(e) => change('from', e.target.value, 'de')}
          />
        </label>
        <label className="date-filter">
          Até
          <input
            aria-label="Data final da análise"
            type="date"
            value={context.to}
            onChange={(e) => change('to', e.target.value, 'ate')}
          />
        </label>
      </div>
      {context.from && context.to && context.from > context.to && (
        <p className="notice" role="alert">
          A data inicial precisa ser anterior à data final.
        </p>
      )}
      <div className="section-heading">
        <div className="segmented" aria-label="Perspectiva da análise">
          {Object.entries(perspectiveLabels).map(([id, label]) => (
            <button
              key={id}
              aria-pressed={context.perspective === id}
              onClick={() => change('perspective', id, 'perspectiva')}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="muted">
          {baseFacts.length} evidências na base · {visible.length} destaque(s)
        </span>
      </div>
      {ids.length > 0 && (
        <p className="notice">
          Seleção trazida da conversa. Trocar perspectiva mantém essas evidências.{' '}
          <button className="source-link" onClick={() => update({ ids: '' })}>
            Explorar toda a base
          </button>
        </p>
      )}
      {(context.from || context.to) && (
        <p className="muted">
          O período considera apenas evidências com data identificada na fonte.
        </p>
      )}
      <div className="segmented no-print" aria-label="Visualização da análise">
        {[
          ['cards', 'Destaques'],
          ['visual', 'Visualização'],
          ['table', 'Tabela acessível'],
          ['versions', 'Versões e conflitos'],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={mode === id} onClick={() => update({ vista: id })}>
            {label}
          </button>
        ))}
      </div>
      {mode === 'versions' ? (
        <>
          <div className="card-grid">
            {scopedDocuments
              .filter((d) => d.vigente)
              .map((doc) => (
                <article key={doc.id} className="evidence-card">
                  <div className="card-meta">
                    <span>
                      {doc.camada} · {doc.area}
                    </span>
                    <span>{doc.fase}</span>
                  </div>
                  <h3>
                    {doc.codigo} · v{doc.versao}
                  </h3>
                  <p>Vigência informada: {doc.vigencia}</p>
                  {documents
                    .filter((d) => d.codigo === doc.codigo && !d.vigente)
                    .map((old) => (
                      <div key={old.id} className="version-comparison">
                        <strong>Versão anterior · v{old.versao}</strong>
                        <p>{old.resumo}</p>
                        {old.fileUrl ? (
                          <a
                            className="source-link"
                            href={old.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Consultar versão anterior
                          </a>
                        ) : (
                          <span className="muted">PDF histórico não disponível</span>
                        )}
                      </div>
                    ))}
                  <footer>
                    {doc.fileUrl && (
                      <a
                        className="source-link"
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Consultar documento vigente
                      </a>
                    )}
                  </footer>
                </article>
              ))}
          </div>
          <div className="section-heading">
            <h2>Alertas cadastrados para revisão</h2>
          </div>
          {issues.length ? (
            issues.map((issue) => (
              <article key={issue.id} className="notice">
                <strong>{issue.title}</strong>
                <p>{issue.detail}</p>
                <p>{issue.documents.join(' · ')}</p>
              </article>
            ))
          ) : (
            <EmptyState title="Nenhum alerta cadastrado para esta seleção" />
          )}
        </>
      ) : !visible.length ? (
        <EmptyState title="Nenhuma evidência nessa perspectiva">
          Ajuste área, período ou tema. A ausência de resultados não significa ausência de
          obrigações.
        </EmptyState>
      ) : mode === 'table' ? (
        <div className="table-scroll">
          <table>
            <caption>Evidências — {perspectiveLabels[context.perspective]}</caption>
            <thead>
              <tr>
                <th>Assunto</th>
                <th>Síntese</th>
                <th>Fonte e versão</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((f) => (
                <tr key={f.id}>
                  <td>{f.title}</td>
                  <td>{f.text}</td>
                  <td>
                    <button className="source-link" onClick={() => openSource(f.citation)}>
                      {f.citation.codigo} v{f.citation.versao} · {f.citation.item}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : mode === 'visual' ? (
        <section className="evidence-visual" aria-label="Visualização das evidências">
          {context.perspective === 'values' ? (
            <>
              <p className="muted">
                Valores de naturezas diferentes; consulte o contexto de cada fonte.
              </p>
              {visible.map((f) => (
                <button className="value-bar-row" key={f.id} onClick={() => openSource(f.citation)}>
                  <span>
                    {f.title}
                    <strong>
                      {((f.valueCents || 0) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </strong>
                  </span>
                  <span className="value-track">
                    <span
                      style={{ width: `${Math.max(1, ((f.valueCents || 0) / maximum) * 100)}%` }}
                    />
                  </span>
                  <small>
                    {f.citation.codigo} · {f.citation.item}
                  </small>
                </button>
              ))}
            </>
          ) : (
            <ol className="evidence-timeline">
              {[...visible]
                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                .map((f) => (
                  <li key={f.id}>
                    <span className="timeline-dot" />
                    <small>
                      {f.date ? new Date(f.date + 'T12:00:00').toLocaleDateString('pt-BR') : f.area}
                    </small>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                    <button className="source-link" onClick={() => openSource(f.citation)}>
                      {f.citation.codigo} · {f.citation.item}
                    </button>
                  </li>
                ))}
            </ol>
          )}
        </section>
      ) : (
        <div className="card-grid">
          {visible.map((f) => (
            <EvidenceCard
              fact={f}
              key={f.id}
              action={
                <label className="check-line evidence-select">
                  <input
                    type="checkbox"
                    aria-label={'Selecionar ' + f.title}
                    checked={selection.some((item) => item.id === f.id)}
                    onChange={() =>
                      setSelection(
                        selection.some((item) => item.id === f.id)
                          ? selection.filter((item) => item.id !== f.id)
                          : [...selection, f],
                      )
                    }
                  />
                  Usar no resumo
                </label>
              }
            />
          ))}
        </div>
      )}
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <h2>Análises anteriores relacionadas</h2>
          </div>
          <p className="muted">Sugestões entre registros carregados, por tema e fontes em comum.</p>
          <div className="card-grid">
            {related.map(({ record, reason }) => (
              <Link key={record.id} href={recordHref(record)} className="evidence-card">
                <h3>{record.title}</h3>
                <p>{reason}</p>
                <footer>
                  <span className="muted">Reabrir com contexto e fontes</span>
                </footer>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
