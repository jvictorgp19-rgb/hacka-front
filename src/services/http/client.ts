import { simulationSchema } from '@/contracts/simulation';
import { z } from 'zod';
import {
  ApiError,
  accessSchema,
  answerSchema,
  deadlineSchema,
  documentSchema,
  factSchema,
  feedbackSchema,
  findingSchema,
  identitySchema,
  recordSchema,
  uploadSchema,
} from '@/contracts/models';
import type { AppGateway } from '@/services/gateway';

export function createHttpGateway(
  baseUrl: string,
  transport: typeof fetch = fetch,
  timeoutMs = 15000,
): AppGateway {
  let personaId = '';
  async function request<T>(
    path: string,
    schema: z.ZodType<T> | null,
    init: RequestInit = {},
    signal?: AbortSignal,
  ): Promise<T> {
    if (!/^https?:\/\//.test(baseUrl))
      throw new ApiError('CONFIG', 'Configure uma URL HTTP válida para a API.');
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      if (controller.signal.aborted) throw new ApiError('ABORTED', 'Consulta cancelada.');
      const response = await transport(baseUrl.replace(/\/$/, '') + path, {
        ...init,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(personaId ? { 'X-Persona-Id': personaId } : {}),
          ...init.headers,
        },
      });
      if (controller.signal.aborted) throw new ApiError('ABORTED', 'Consulta cancelada.');
      const requestId = response.headers.get('x-request-id') || undefined;
      if (!response.ok)
        throw new ApiError(
          String(response.status),
          response.status === 401
            ? 'Entre na sua conta para continuar.'
            : response.status === 403
              ? 'Seu perfil não tem acesso a este conteúdo.'
              : 'O serviço não concluiu a solicitação.',
          response.status >= 500 || response.status === 429,
          requestId,
        );
      if (!schema) return (await response.blob()) as T;
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new ApiError(
          'INVALID_RESPONSE',
          'A API não retornou um documento JSON válido.',
          false,
          requestId,
        );
      }
      const parsed = schema.safeParse(json);
      if (!parsed.success)
        throw new ApiError(
          'INVALID_RESPONSE',
          'A API retornou dados incompatíveis com o contrato.',
          false,
          requestId,
        );
      return parsed.data;
    } catch (error) {
      if (controller.signal.aborted)
        throw new ApiError(
          timedOut ? 'TIMEOUT' : 'ABORTED',
          timedOut ? 'O serviço demorou demais. Tente novamente.' : 'Consulta cancelada.',
          timedOut,
        );
      if (error instanceof ApiError) throw error;
      throw new ApiError('NETWORK', 'Não foi possível acessar a API. Verifique a conexão.', true);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }
  const post = <T>(path: string, schema: z.ZodType<T>, body: unknown, signal?: AbortSignal) =>
    request(path, schema, { method: 'POST', body: JSON.stringify(body) }, signal);
  return {
    mode: 'api',
    reset: () => {
      throw new ApiError('UNSUPPORTED', 'O reset está disponível somente na demonstração.');
    },
    simulationRules: (signal) => request('/simulation-rules', simulationSchema, {}, signal),
    documents: (signal) => request('/documents', z.array(documentSchema).max(100), {}, signal),
    facts: (signal) => request('/analyses/evidence', z.array(factSchema).max(100), {}, signal),
    messages: (persona, signal) =>
      request(
        '/conversations/messages?persona=' + encodeURIComponent(persona),
        z.array(answerSchema.extend({ origin: z.literal('api') })).max(100),
        {},
        signal,
      ),
    ask: (query, context, signal) =>
      post(
        '/conversations/messages',
        answerSchema.extend({ origin: z.literal('api') }),
        { query, context },
        signal,
      ),
    deadlines: (signal) => request('/deadlines', z.array(deadlineSchema), {}, signal),
    findings: (signal) => request('/audit/findings', z.array(findingSchema), {}, signal),
    identity: async (signal) => {
      const identity = await request('/identity', identitySchema, {}, signal);
      personaId = identity.modo === 'demo' ? identity.id : '';
      return identity;
    },
    requests: (persona, signal) =>
      request(
        '/access-requests?persona=' + encodeURIComponent(persona),
        z.array(accessSchema),
        {},
        signal,
      ),
    createRequest: (reason, persona, owner) =>
      post('/access-requests', accessSchema, { reason, persona, owner }),
    decideRequest: (id, status, response, persona) =>
      post('/access-requests/' + encodeURIComponent(id) + '/decision', accessSchema, {
        status,
        response,
        persona,
      }),
    records: (persona, signal) =>
      request(
        '/analyses?persona=' + encodeURIComponent(persona),
        z.array(recordSchema),
        {},
        signal,
      ),
    saveRecord: (record) => post('/analyses', recordSchema, record),
    feedback: (persona, signal) =>
      request(
        '/feedback?persona=' + encodeURIComponent(persona),
        z.array(feedbackSchema),
        {},
        signal,
      ),
    saveFeedback: (item) => post('/feedback', feedbackSchema, item),
    uploadStatus: (id, signal) =>
      request('/document-jobs/' + encodeURIComponent(id), uploadSchema, {}, signal),
    uploads: (offset = 0, signal) =>
      request('/document-jobs?limit=100&offset=' + offset, z.array(uploadSchema), {}, signal),
    decideUpload: (id, status, response = '') =>
      post('/document-jobs/' + encodeURIComponent(id) + '/decision', uploadSchema, {
        status,
        response,
      }),
    downloadUpload: (id) =>
      request<Blob>('/document-jobs/' + encodeURIComponent(id) + '/file', null),
    upload: (files, signal) => {
      const body = new FormData();
      files.forEach((file) => body.append('files', file));
      return request('/document-jobs', z.array(uploadSchema), { method: 'POST', body }, signal);
    },
  };
}
