'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/context';
import { PageHeading, EmptyState } from '@/components/ui/primitives';
import { useUrlFilters } from '@/lib/url-filters';
export default function Deadlines() {
  const { deadlines, openSource } = useWorkspace();
  const { params, update } = useUrlFilters();
  const [reference, setReference] = useState('2027-03-01');
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.get('mes') || '')
    ? params.get('mes')!
    : '2027-03';
  const view = params.get('vista') || 'lista';
  const visible = deadlines.filter(
    (e) => e.date.startsWith(month) && (!params.get('area') || e.owner === params.get('area')),
  );
  const first = new Date(month + '-01T12:00:00Z');
  const count = new Date(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const cells = Array.from(
    { length: Math.ceil((count + offset) / 7) * 7 },
    (_, i) => i - offset + 1,
  );
  const status = (date: string) =>
    date < reference
      ? 'Vencido na referência'
      : date === reference
        ? 'Vence na referência'
        : 'Prazo futuro';
  function shiftMonth(amount: number) {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + amount);
    update({ mes: date.toISOString().slice(0, 7) });
  }
  return (
    <>
      <PageHeading
        eyebrow="ANTECIPE O QUE IMPORTA"
        title="Prazos e compromissos"
        description="Lista e calendário mostram os mesmos eventos, com fonte e responsável."
      />
      <div className="toolbar">
        <label className="date-filter">
          Mês
          <input
            aria-label="Mês dos prazos"
            type="month"
            value={month}
            onChange={(e) => update({ mes: e.target.value })}
          />
        </label>
        <select
          aria-label="Área dos prazos"
          value={params.get('area') || ''}
          onChange={(e) => update({ area: e.target.value })}
        >
          <option value="">Todas as áreas</option>
          {[...new Set(deadlines.map((e) => e.owner))].map((owner) => (
            <option key={owner}>{owner}</option>
          ))}
        </select>
        <label className="date-filter">
          Data de referência
          <input
            aria-label="Data de referência"
            type="date"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </label>
      </div>
      <p className="muted">
        A situação dos eventos é calculada pela referência informada. Nenhum e-mail ou agendamento é
        enviado.
      </p>
      <div className="section-heading">
        <div className="segmented">
          <button aria-pressed={view === 'lista'} onClick={() => update({ vista: 'lista' })}>
            Lista
          </button>
          <button
            aria-pressed={view === 'calendario'}
            onClick={() => update({ vista: 'calendario' })}
          >
            Calendário
          </button>
        </div>
        <span className="muted">{visible.length} evento(s)</span>
      </div>
      {view === 'calendario' ? (
        <>
          <div className="calendar-heading">
            <button
              className="icon-button"
              aria-label="Mês anterior"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <h2>
              {first.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </h2>
            <button className="icon-button" aria-label="Próximo mês" onClick={() => shiftMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="table-scroll">
            <table className="deadline-calendar">
              <caption>Eventos com fonte — {month}</caption>
              <thead>
                <tr>
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                    <th key={d} scope="col">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: cells.length / 7 }, (_, week) => (
                  <tr key={week}>
                    {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
                      const date = `${month}-${String(day).padStart(2, '0')}`;
                      return (
                        <td key={i}>
                          {day > 0 && day <= count && (
                            <>
                              <span className="calendar-day">{day}</span>
                              {visible
                                .filter((e) => e.date === date)
                                .map((e) => (
                                  <button
                                    className="calendar-event"
                                    key={e.id}
                                    onClick={() => openSource(e.fact.citation)}
                                    title={`${e.title} — ${status(e.date)}`}
                                  >
                                    <span>{e.title}</span>
                                    <small>{e.owner}</small>
                                  </button>
                                ))}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : !visible.length ? (
        <EmptyState title="Nenhum prazo cadastrado nesse mês">
          Mude o mês ou a área. A ausência de eventos não substitui a consulta aos documentos.
        </EmptyState>
      ) : (
        <ol className="evidence-timeline deadline-list">
          {[...visible]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((event) => (
              <li key={event.id}>
                <span className="timeline-dot" />
                <div className="card-meta">
                  <span>
                    {new Date(event.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                      timeZone: 'UTC',
                    })}{' '}
                    · {event.owner}
                  </span>
                  <span>
                    {event.priority} · {status(event.date)}
                  </span>
                </div>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                <button className="source-link" onClick={() => openSource(event.fact.citation)}>
                  {event.fact.citation.codigo} · {event.fact.citation.item}
                </button>
              </li>
            ))}
        </ol>
      )}
    </>
  );
}
