import { it, expect } from 'vitest';
import {
  approvalIndex,
  rentalFine,
  rentalDiscount,
  teamLimit,
  vacationDays,
  vacationTimeline,
  startRestriction,
  parseDate,
  gamification,
} from '@/features/simulators/calculations';
it.each([
  [0, 30],
  [5, 30],
  [6, 24],
  [14, 24],
  [15, 18],
  [23, 18],
  [24, 12],
  [32, 12],
  [33, 0],
])('TB_1111 Tabela 1: %s faltas → %s dias', (faltas, dias) =>
  expect(vacationDays(faltas)).toBe(dias),
);
it('aplica mínimo de uma pessoa e arredonda 30% para baixo', () => {
  expect(teamLimit(3)).toBe(1);
  expect(teamLimit(9)).toBe(2);
  expect(teamLimit(16)).toBe(4);
});
it.each([
  [1800000, 0],
  [1800001, 1],
  [12000000, 1],
  [12000001, 2],
])('NT_2026-021: %s centavos → faixa %s', (cents, faixa) =>
  expect(approvalIndex(cents)).toBe(faixa),
);
it('CTR cláusula 13: dia 90 tem multa e dia 91 não', () => {
  expect(rentalFine(90, 365000)).toBe(365000);
  expect(rentalFine(91, 365000)).toBe(0);
  expect(rentalDiscount(2, 12167, 365000)).toBe(24334);
  expect(rentalDiscount(100, 12167, 365000)).toBe(365000);
});
it('reproduz o exemplo de 05/05/2027 e retorna depois do fim do gozo', () => {
  const timeline = vacationTimeline('2027-05-05', ['2027-05-01']);
  expect(timeline.find((m) => m.id === 'request')?.date).toBe('2027-03-21');
  expect(timeline.find((m) => m.id === 'notice')?.date).toBe('2027-03-31');
  expect(timeline.find((m) => m.id === 'signature')?.date).toBe('2027-04-05');
  expect(timeline.find((m) => m.id === 'payment')?.date).toBe('2027-04-30');
  expect(timeline.find((m) => m.id === 'return')?.date).toBe('2027-06-04');
});
it('considera recebimento real do aviso e feriado configurado', () => {
  const timeline = vacationTimeline('2027-05-05', ['2027-05-01'], 45, '2027-03-22');
  expect(timeline.find((m) => m.id === 'signature')?.date).toBe('2027-03-29');
  const withHoliday = vacationTimeline('2027-05-05', ['2027-05-01', '2027-04-30']);
  expect(withHoliday.find((m) => m.id === 'payment')?.date).toBe('2027-04-29');
});
it('valida dados e bloqueios conhecidos sem afirmar calendário completo', () => {
  expect(() => parseDate('2027-02-30')).toThrow();
  expect(() => vacationDays(1.5)).toThrow();
  expect(() => teamLimit(-1)).toThrow();
  expect(() => rentalFine(0, 365000)).toThrow();
  expect(startRestriction('2027-05-05', [])).toBe('');
  expect(startRestriction('2027-05-07', [])).toContain('dois dias');
  expect(startRestriction('2027-05-09', [])).toContain('dia útil');
  expect(gamification(true, 5, true, true, true)).toBe(800);
});
