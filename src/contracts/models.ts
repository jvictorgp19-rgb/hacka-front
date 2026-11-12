import { z } from 'zod';

export const themeSchema = z.enum(['ferias', 'inovacao', 'locacao']);
export const perspectiveSchema = z.enum(['risks', 'deadlines', 'obligations', 'values']);
export const sourceUrlSchema = z.string().refine(s => /^\/(?!\/)/.test(s) || /^https?:\/\//.test(s), 'Referência de fonte inválida');
export const citationSchema = z.object({
  id: z.string(), documentId: z.string(), codigo: z.string(), titulo: z.string(),
  versao: z.string(), status: z.string(), item: z.string(), trecho: z.string(),
  page: z.number().int().positive().optional(), url: sourceUrlSchema.optional(),
});
export const documentSchema = z.object({
  id: z.string(), codigo: z.string(), titulo: z.string(), versao: z.string(),
  fase: z.string(), vigente: z.boolean(), tema: themeSchema, area: z.string(),
  camada: z.string(), resumo: z.string(), fileUrl: sourceUrlSchema.optional(),
  substitui: z.string().optional(), vigencia: z.string(),
});
export const factSchema = z.object({
  id: z.string(), title: z.string(), text: z.string(), tema: themeSchema,
  area: z.string(), perspective: perspectiveSchema, date: z.string().optional(),
  valueCents: z.number().int().optional(), citation: citationSchema,
});
export const contextSchema = z.object({
  conversationId: z.string().default(''),
  tema: z.union([themeSchema, z.literal('todos')]), area: z.string(),
  perspective: perspectiveSchema, from: z.string(), to: z.string(), persona: z.string(),
});
export const answerSchema = z.object({
  id: z.string(), query: z.string(), status: z.enum(['answered', 'abstained', 'conflict', 'access_required']),
  text: z.string(), facts: z.array(factSchema), citations: z.array(citationSchema),
  context: contextSchema, origin: z.enum(['demo', 'api']), createdAt: z.string(),
  nextSteps: z.array(z.string()),
});
export const deadlineSchema = z.object({
  id: z.string(), date: z.string(), title: z.string(), detail: z.string(),
  owner: z.string(), priority: z.enum(['Crítica', 'Alta', 'Normal']), fact: factSchema,
});
export const findingSchema = z.object({ id: z.string(), title: z.string(), detail: z.string(), documents: z.array(z.string()) });
export const accessSchema = z.object({
  id: z.string(), persona: z.string(), reason: z.string(), owner: z.string(),
  status: z.enum(['pending', 'curated', 'denied', 'granted']),
  response: z.string(), createdAt: z.string(), decidedAt: z.string().optional(), decidedBy: z.string().optional(),
});
export const recordSchema = z.object({
  id: z.string(), title: z.string(), kind: z.enum(['analysis', 'report']),
  persona: z.string(), facts: z.array(factSchema), context: contextSchema, createdAt: z.string(),
});
export const feedbackSchema = z.object({ id: z.string(), targetId: z.string(), persona: z.string(), useful: z.boolean(), reason: z.string() });
export const uploadSchema = z.object({
  id: z.string(), name: z.string(), size: z.number(),
  status: z.enum(['waiting', 'processing', 'ready', 'failed', 'not_extracted']), message: z.string(),
});
export const identitySchema = z.object({ id: z.string(), name: z.string(), capabilities: z.array(z.string()) });
export type Citation = z.infer<typeof citationSchema>;
export type DocumentVersion = z.infer<typeof documentSchema>;
export type Fact = z.infer<typeof factSchema>;
export type AnalysisContext = z.infer<typeof contextSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type Deadline = z.infer<typeof deadlineSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type AccessRequest = z.infer<typeof accessSchema>;
export type SavedRecord = z.infer<typeof recordSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type UploadItem = z.infer<typeof uploadSchema>;
export type Identity = z.infer<typeof identitySchema>;
export const defaultContext: AnalysisContext = { conversationId: '', tema: 'todos', area: '', perspective: 'obligations', from: '', to: '', persona: 'ana' };
export class ApiError extends Error {
  constructor(public code: string, message: string, public retryable = false, public requestId?: string) { super(message); this.name = 'ApiError'; }
}
