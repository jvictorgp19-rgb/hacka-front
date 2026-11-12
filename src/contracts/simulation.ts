import { z } from 'zod';
import { citationSchema } from './models';
export const simulationSchema = z.object({
  advanceDays: z.number().int().positive(), absencePercent: z.number().positive().max(100),
  absenceTiers: z.array(z.object({ max: z.number().int().nonnegative(), days: z.number().int().nonnegative() })),
  managerCapCents: z.number().int().nonnegative(), directorCapCents: z.number().int().nonnegative(),
  rentCents: z.number().int().nonnegative(), dailyDiscountCents: z.number().int().nonnegative(),
  globalCents: z.number().int().positive(), fineThroughDay: z.number().int().positive(),
  calendar: z.object({ from: z.string(), to: z.string(), complete: z.boolean(), holidays: z.array(z.string()), description: z.string() }),
  citations: z.array(citationSchema),
});
export type SimulationRules = z.infer<typeof simulationSchema>;
