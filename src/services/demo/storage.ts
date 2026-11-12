import { z } from 'zod';
import { answerSchema, accessSchema, feedbackSchema, recordSchema, ApiError } from '@/contracts/models';
const schema = z.object({ version: z.literal(1), messages: z.array(answerSchema).default([]), records: z.array(recordSchema), feedback: z.array(feedbackSchema), requests: z.array(accessSchema) });
export type DemoState = z.infer<typeof schema>;
const empty = (): DemoState => ({ version: 1, messages: [], records: [], feedback: [], requests: [] });
export const DEMO_STORAGE_KEY = 'raiziq.demo.v1';
export function readDemo(): DemoState {
  if (typeof window === 'undefined') return empty();
  try { const parsed = schema.safeParse(JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null')); return parsed.success ? parsed.data : empty(); }
  catch { return empty(); }
}
export function writeDemo(update: (state: DemoState) => DemoState) {
  try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(schema.parse(update(readDemo())))); }
  catch { throw new ApiError('STORAGE', 'Não foi possível salvar a demonstração neste navegador. Exporte o resultado ou libere o armazenamento.'); }
}
export function resetDemo() { localStorage.removeItem(DEMO_STORAGE_KEY); }
