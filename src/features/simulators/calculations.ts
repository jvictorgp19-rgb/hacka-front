function integer(value: number, min = 0) {
  if (!Number.isInteger(value) || value < min)
    throw new Error(`Informe um número inteiro a partir de ${min}.`);
}
export function teamLimit(size: number, percent = 30) {
  integer(size);
  return size === 0 ? 0 : size <= 3 ? 1 : Math.max(1, Math.floor((size * percent) / 100));
}
export function vacationDays(
  absences: number,
  tiers = [
    { max: 5, days: 30 },
    { max: 14, days: 24 },
    { max: 23, days: 18 },
    { max: 32, days: 12 },
  ],
) {
  integer(absences);
  return tiers.find((t) => absences <= t.max)?.days || 0;
}
export function approvalIndex(
  cents: number,
  managerCapCents = 1800000,
  directorCapCents = 12000000,
) {
  integer(cents);
  return cents <= managerCapCents ? 0 : cents <= directorCapCents ? 1 : 2;
}
export function rentalFine(day: number, rentCents: number, fineThroughDay = 90) {
  integer(day, 1);
  integer(rentCents);
  return day <= fineThroughDay ? rentCents : 0;
}
export function rentalDiscount(days: number, dailyCents: number, rentCents: number) {
  integer(days);
  integer(dailyCents);
  integer(rentCents);
  return Math.min(rentCents, days * dailyCents);
}
export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Informe uma data válida.');
  const date = new Date(value + 'T12:00:00Z');
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value)
    throw new Error('Informe uma data válida.');
  return date;
}
export function shiftDate(value: string, days: number) {
  const date = parseDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function isBusinessDay(value: string, holidays: string[]) {
  const weekday = parseDate(value).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !holidays.includes(value);
}
export function shiftBusinessDays(value: string, amount: number, holidays: string[]) {
  integer(Math.abs(amount));
  let result = value;
  for (let i = 0; i < Math.abs(amount);) {
    result = shiftDate(result, Math.sign(amount));
    if (isBusinessDay(result, holidays)) i++;
  }
  return result;
}
export function vacationTimeline(
  start: string,
  holidays: string[],
  advanceDays = 45,
  receivedOn?: string,
  requestedOn?: string,
  daysOfVacation = 30,
) {
  parseDate(start);
  integer(daysOfVacation, 1);
  const requested = requestedOn || shiftDate(start, -advanceDays);
  const received = receivedOn || shiftDate(start, -35);
  parseDate(requested);
  parseDate(received);
  let payment = shiftDate(start, -3);
  while (!isBusinessDay(payment, holidays)) payment = shiftDate(payment, -1);
  const signature = shiftBusinessDays(received, 5, holidays);
  const lastDay = shiftDate(start, daysOfVacation - 1);
  return [
    {
      id: 'request',
      label: 'Solicitar férias',
      date: shiftDate(start, -advanceDays),
      owner: 'Empregado',
      item: '4.3.1',
    },
    {
      id: 'manager',
      label: 'Decisão do gestor',
      date: shiftDate(requested, 7),
      owner: 'Gestor',
      item: '4.5.2',
    },
    {
      id: 'director',
      label: 'Decisão após escalada no 8º dia',
      date: shiftBusinessDays(shiftDate(requested, 8), 3, holidays),
      owner: 'Diretor',
      item: '4.6.2',
    },
    {
      id: 'notice',
      label: 'Emissão do aviso',
      date: shiftDate(start, -35),
      owner: 'GGC',
      item: '4.5.3',
    },
    {
      id: 'signature',
      label: 'Assinar aviso (prazo mais restritivo)',
      date: signature < shiftDate(start, -30) ? signature : shiftDate(start, -30),
      owner: 'Empregado',
      item: '4.5.4',
    },
    {
      id: 'change',
      label: 'Alteração por iniciativa do empregado',
      date: shiftDate(start, -20),
      owner: 'Empregado e gestor',
      item: '4.9.1',
    },
    {
      id: 'payment',
      label: 'Pagamento antecipado se necessário',
      date: payment,
      owner: 'GFI',
      item: '4.5.5',
    },
    {
      id: 'return',
      label: 'Retorno após o fim do gozo',
      date: shiftBusinessDays(lastDay, 1, holidays),
      owner: 'Gestor',
      item: '6.3',
    },
  ];
}
export function startRestriction(start: string, holidays: string[]) {
  if (!isBusinessDay(start, holidays))
    return 'O início precisa ocorrer em dia útil no calendário informado.';
  const sunday = shiftDate(start, (7 - parseDate(start).getUTCDay()) % 7);
  const nextKnown = [sunday, ...holidays.filter((h) => h > start && h <= shiftDate(start, 7))];
  if (
    nextKnown.some(
      (day) =>
        shiftBusinessDays(day, -1, holidays) === start ||
        shiftBusinessDays(day, -2, holidays) === start,
    )
  )
    return 'O início coincide com um dos dois dias úteis anteriores a feriado conhecido ou descanso semanal.';
  return '';
}
