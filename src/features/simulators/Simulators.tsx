'use client';
import { useEffect, useState } from 'react';
import { CalendarDays, Calculator } from 'lucide-react';
import { useWorkspace, themeLabels } from '@/features/workspace/context';
import { PageHeading, EmptyState } from '@/components/ui/primitives';
import { useUrlFilters } from '@/lib/url-filters';
import type { SimulationRules } from '@/contracts/simulation';
import {
  approvalIndex,
  rentalDiscount,
  rentalFine,
  startRestriction,
  teamLimit,
  vacationDays,
  vacationTimeline,
} from './calculations';
const money = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export default function Simulators() {
  const { gateway, openSource } = useWorkspace();
  const { params, update } = useUrlFilters();
  const theme =
    params.get('tema') && Object.keys(themeLabels).includes(params.get('tema')!)
      ? params.get('tema')!
      : 'ferias';
  const [rules, setRules] = useState<SimulationRules | null>(null);
  const [error, setError] = useState('');
  const [start, setStart] = useState('2027-05-05');
  const [requested, setRequested] = useState('');
  const [received, setReceived] = useState('');
  const [team, setTeam] = useState(9);
  const [absences, setAbsences] = useState(0);
  const [abono, setAbono] = useState(false);
  const [cents, setCents] = useState(1800001);
  const [day, setDay] = useState(95);
  const [outage, setOutage] = useState(2);
  const [acknowledged, setAcknowledged] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    gateway
      ?.simulationRules(controller.signal)
      .then(setRules)
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Regras indisponíveis.');
      });
    return () => controller.abort();
  }, [gateway]);
  if (error)
    return (
      <>
        <PageHeading
          eyebrow="FERRAMENTAS DE APOIO"
          title="Simuladores"
          description="As regras precisam corresponder ao acervo consultado."
        />
        <p role="alert" className="notice">
          {error}
        </p>
      </>
    );
  if (!rules) return <p role="status">Carregando regras de simulação…</p>;
  let issue = '';
  let entitlement = 0;
  let maxTeam = 0;
  let approver = 0;
  let fine = 0;
  let discount = 0;
  let restriction = '';
  let timeline: ReturnType<typeof vacationTimeline> = [];
  try {
    if (theme === 'ferias') {
      entitlement = vacationDays(absences, rules.absenceTiers);
      maxTeam = teamLimit(team, rules.absencePercent);
      if (team < 1) throw new Error('A equipe deve ter pelo menos uma pessoa.');
      if (start < rules.calendar.from || start > rules.calendar.to)
        throw new Error('Escolha uma data dentro do intervalo de calendário informado.');
      if ((requested && requested > start) || (received && received > start))
        throw new Error('Solicitação e recebimento do aviso precisam anteceder o gozo.');
      restriction = startRestriction(start, rules.calendar.holidays);
      if (entitlement > 0)
        timeline = vacationTimeline(
          start,
          rules.calendar.holidays,
          rules.advanceDays,
          received || undefined,
          requested || undefined,
          entitlement - (abono ? Math.min(10, Math.floor(entitlement / 3)) : 0),
        );
      if (timeline.some((m) => m.date < rules.calendar.from || m.date > rules.calendar.to))
        throw new Error('Alguns marcos ficam fora do intervalo do calendário informado.');
    } else if (theme === 'inovacao')
      approver = approvalIndex(cents, rules.managerCapCents, rules.directorCapCents);
    else {
      fine = rentalFine(day, rules.rentCents, rules.fineThroughDay);
      discount = rentalDiscount(outage, rules.dailyDiscountCents, rules.rentCents);
    }
  } catch (e) {
    issue = e instanceof Error ? e.message : 'Confira as entradas.';
  }
  const citation = (item: string, code = 'NG_111') =>
    rules.citations.find((c) => c.item === item && c.codigo === code);
  function sourceButton(item: string, code = 'NG_111') {
    const source = citation(item, code);
    return source ? (
      <button className="source-link" onClick={() => openSource(source)}>
        {source.codigo} · {item}
      </button>
    ) : (
      <span className="muted">Fonte específica não recebida</span>
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="ENTENDA ANTES DE DECIDIR"
        title="Simuladores de regras"
        description="Altere as entradas e veja como a regra se aplica. Resultados são prévias, sem aprovação de operações."
      />
      <div className="segmented" aria-label="Tema do simulador">
        {Object.entries(themeLabels).map(([id, label]) => (
          <button key={id} aria-pressed={theme === id} onClick={() => update({ tema: id })}>
            {label}
          </button>
        ))}
      </div>
      {issue && (
        <p className="notice" role="alert">
          {issue}
        </p>
      )}
      {theme === 'ferias' ? (
        <>
          <div className="card-grid">
            <section className="evidence-card simulator-card">
              <div className="assistant-label">
                <Calculator size={17} />
                EQUIPE E DIREITO A FÉRIAS
              </div>
              <label>
                Tamanho da equipe
                <input
                  aria-label="Tamanho da equipe"
                  type="number"
                  min={1}
                  step={1}
                  value={team}
                  onChange={(e) => setTeam(Number(e.target.value))}
                />
              </label>
              <label>
                Faltas injustificadas
                <input
                  aria-label="Faltas injustificadas"
                  type="number"
                  min={0}
                  step={1}
                  value={absences}
                  onChange={(e) => setAbsences(Number(e.target.value))}
                />
              </label>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={abono}
                  onChange={(e) => setAbono(e.target.checked)}
                />
                Simular abono de até um terço (máximo 10 dias)
              </label>
              {!issue && (
                <div className="result-box">
                  <strong>Máximo de {maxTeam} pessoa(s) simultaneamente</strong>
                  <p>
                    {entitlement} dias de direito ·{' '}
                    {abono ? Math.min(10, Math.floor(entitlement / 3)) : 0} dia(s) de abono simulado
                  </p>
                </div>
              )}
              <footer>
                {sourceButton('4.6.3')}
                {sourceButton('Tabela 1', 'TB_1111-001')}
              </footer>
            </section>
            <section className="evidence-card simulator-card">
              <div className="assistant-label">
                <CalendarDays size={17} />
                DATAS E PREMISSAS
              </div>
              <label>
                Início do gozo
                <input
                  aria-label="Início do gozo"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label>
                Registro da solicitação (opcional)
                <input
                  aria-label="Registro da solicitação"
                  type="date"
                  value={requested}
                  onChange={(e) => setRequested(e.target.value)}
                />
              </label>
              <label>
                Recebimento do aviso (opcional)
                <input
                  aria-label="Recebimento do aviso"
                  type="date"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                />
              </label>
              <p className="muted">
                Sem datas adicionais, a prévia usa solicitação em D-45 e aviso em D-35. O retorno
                considera o fim do gozo, não o dia seguinte ao início.
              </p>
            </section>
          </div>
          <div className="calendar-assumptions">
            <p>{rules.calendar.description}</p>
            <p>
              Intervalo: {rules.calendar.from} a {rules.calendar.to}.
            </p>
            {!rules.calendar.complete && (
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                Entendo que preciso validar o calendário da unidade antes de usar estes prazos.
              </label>
            )}
            {restriction && (
              <p className="notice">
                {restriction} A prévia não confirma essa data como válida para gozo.
              </p>
            )}
          </div>
          {!issue && entitlement > 0 && (rules.calendar.complete || acknowledged) ? (
            <section className="evidence-visual">
              <div className="section-heading">
                <h2>Prévia dos marcos</h2>
                <span className="tag">
                  {rules.calendar.complete ? 'Calendário recebido' : 'Calendário parcial'}
                </span>
              </div>
              <ol className="evidence-timeline">
                {[...timeline]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((m) => (
                    <li key={m.id}>
                      <span className="timeline-dot" />
                      <small>{m.owner}</small>
                      <h3>{m.label}</h3>
                      <p>
                        {new Date(m.date + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                        })}
                      </p>
                      {sourceButton(m.item, m.id === 'return' ? 'PX_1111-001' : 'NG_111')}
                    </li>
                  ))}
              </ol>
              <p className="notice">
                O marco de alteração segue o item 4.9.1. A redação do item 4.9.2 também menciona os
                20 dias anteriores; confirme essa fronteira com a GGC.
              </p>
            </section>
          ) : (
            <EmptyState
              title={
                entitlement === 0
                  ? 'Sem dias de férias para simular'
                  : 'Confirme as premissas para visualizar a prévia'
              }
            >
              Nenhum prazo é uma aprovação automática.
            </EmptyState>
          )}
        </>
      ) : theme === 'inovacao' ? (
        <section className="evidence-card simulator-card narrow-card">
          <div className="assistant-label">
            <Calculator size={17} />
            ALÇADA DE PROTOTIPAGEM
          </div>
          <label>
            Valor do protótipo (R$)
            <input
              aria-label="Valor do protótipo"
              type="number"
              min={0}
              step="0.01"
              value={cents / 100}
              onChange={(e) => setCents(Math.round(Number(e.target.value) * 100))}
            />
          </label>
          {!issue && (
            <div className="result-box">
              <strong>
                {['Gerente do NIN', 'Diretor da DIRTEC', 'Comitê de Alçadas'][approver]}
              </strong>
              <p>Valor simulado: {money(cents)}</p>
            </div>
          )}
          <footer>{sourceButton(approver === 0 ? '4.2' : '4.3', 'NT_2026-021')}</footer>
        </section>
      ) : (
        <div className="card-grid">
          <section className="evidence-card simulator-card">
            <h2>Multa de rescisão</h2>
            <label>
              Dia de vigência (inclusivo)
              <input
                aria-label="Dia de vigência"
                type="number"
                min={1}
                step={1}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
              />
            </label>
            {!issue && (
              <div className="result-box">
                <strong>{money(fine)}</strong>
                <p>
                  {day <= rules.fineThroughDay
                    ? 'Multa de um aluguel.'
                    : 'Isento de multa; permanece o aviso prévio de 30 dias.'}
                </p>
              </div>
            )}
            <footer>{sourceButton('Cláusula décima terceira', 'CTR_2026-012')}</footer>
          </section>
          <section className="evidence-card simulator-card">
            <h2>Desconto por internet</h2>
            <label>
              Dias com interrupção superior a 4h
              <input
                aria-label="Dias sem internet"
                type="number"
                min={0}
                max={30}
                step={1}
                value={outage}
                onChange={(e) => setOutage(Number(e.target.value))}
              />
            </label>
            {!issue && (
              <div className="result-box">
                <strong>Desconto: {money(discount)}</strong>
                <p>
                  Aluguel líquido: {money(rules.rentCents - discount)}. Usado o valor diário
                  arredondado da fonte.
                </p>
              </div>
            )}
            <footer>{sourceButton('Anexo, item 11', 'CTR_2026-012')}</footer>
          </section>
        </div>
      )}
    </>
  );
}
