import { z } from 'zod';
import { citationSchema } from './models';
export const simulationSchema = z.object({
  advanceDays: z.number().int().positive(),
  absencePercent: z.number().positive().max(100),
  absenceTiers: z.array(
    z.object({ max: z.number().int().nonnegative(), days: z.number().int().nonnegative() }),
  ),
  // Grupos restritos: a API só os envia se a pessoa vê as fontes. Ausentes = sem acesso.
  managerCapCents: z.number().int().nonnegative().optional(),
  directorCapCents: z.number().int().nonnegative().optional(),
  rentCents: z.number().int().nonnegative().optional(),
  dailyDiscountCents: z.number().int().nonnegative().optional(),
  globalCents: z.number().int().positive().optional(),
  fineThroughDay: z.number().int().positive().optional(),
  available: z.array(z.enum(['ferias', 'inovacao', 'locacao'])).optional(),
  calendar: z.object({
    from: z.string(),
    to: z.string(),
    complete: z.boolean(),
    holidays: z.array(z.string()),
    description: z.string(),
  }),
  citations: z.array(citationSchema),
});
export type SimulationRules = z.infer<typeof simulationSchema>;
