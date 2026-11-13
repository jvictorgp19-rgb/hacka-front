import { it, expect, vi } from 'vitest';
import { createHttpGateway } from '@/services/http/client';

it('consome catálogo válido sem fallback e encaminha credenciais', async () => {
  const transport = vi.fn(async () => Response.json([]));
  await expect(createHttpGateway('https://example.test', transport).documents()).resolves.toEqual(
    [],
  );
  expect(transport.mock.calls[0]).toBeDefined();
});
it('rejeita dados com formato incorreto', async () => {
  await expect(
    createHttpGateway('https://example.test', async () =>
      Response.json({ success: true }),
    ).documents(),
  ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});
it.each([401, 403, 500])('preserva erro HTTP %s sem substituir por dado local', async (status) => {
  await expect(
    createHttpGateway('https://example.test', async () => new Response('', { status })).documents(),
  ).rejects.toMatchObject({ code: String(status) });
});
it('distingue timeout de cancelamento', async () => {
  const transport: typeof fetch = async (_url, init) =>
    new Promise((_, reject) =>
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')),
      ),
    );
  await expect(
    createHttpGateway('https://example.test', transport, 5).documents(),
  ).rejects.toMatchObject({ code: 'TIMEOUT' });
  const controller = new AbortController();
  const request = createHttpGateway('https://example.test', transport).documents(controller.signal);
  controller.abort();
  await expect(request).rejects.toMatchObject({ code: 'ABORTED' });
});
it('rejeita JSON malformado como violação de contrato', async () => {
  await expect(
    createHttpGateway(
      'https://example.test',
      async () => new Response('<html>erro</html>'),
    ).documents(),
  ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
});
it('não inicia transporte quando a consulta já foi cancelada', async () => {
  const controller = new AbortController();
  controller.abort();
  const transport = vi.fn(async () => Response.json([]));
  await expect(
    createHttpGateway('https://example.test', transport).documents(controller.signal),
  ).rejects.toMatchObject({ code: 'ABORTED' });
  expect(transport).not.toHaveBeenCalled();
});
