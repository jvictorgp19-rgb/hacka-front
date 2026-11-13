import { describe, expect, it } from 'vitest';
import { mergeUploadHistory, readUploadHistory } from '@/features/documents/history';
import type { UploadItem } from '@/contracts/models';
const job = (id: string): UploadItem => ({
  id,
  name: id + '.pdf',
  size: 10,
  status: 'ready',
  message: 'Salvo',
  saved: true,
});
describe('histórico de envios', () => {
  it('lê todas as páginas inclusive uma última página vazia', async () => {
    const offsets: number[] = [];
    const items = Array.from({ length: 200 }, (_, i) => job(String(i)));
    const result = await readUploadHistory(async (offset) => {
      offsets.push(offset);
      return items.slice(offset, offset + 100);
    }, new AbortController().signal);
    expect(result).toHaveLength(200);
    expect(offsets).toEqual([0, 100, 200]);
  });
  it('não entra em loop quando o serviço ignora offset', async () => {
    const page = Array.from({ length: 100 }, (_, i) => job(String(i)));
    await expect(readUploadHistory(async () => page, new AbortController().signal)).rejects.toThrow(
      'repetiu',
    );
  });
  it('não apresenta resultado incompleto depois de cancelamento', async () => {
    const abort = new AbortController();
    abort.abort();
    await expect(readUploadHistory(async () => [], abort.signal)).rejects.toThrow();
  });
  it('preserva upload criado durante o GET e remove registro que deixou de ser visível', () => {
    const old = { ...job('old'), remoteId: 'old' },
      fresh = { ...job('local-new'), remoteId: 'server-new' };
    expect(mergeUploadHistory([old, fresh], [], [old])).toEqual([fresh]);
  });
  it('reconcilia IDs remotos sem duplicar e mantém a chave local', () => {
    const local = { ...job('local'), remoteId: 'remote' };
    expect(
      mergeUploadHistory([local], [{ ...job('remote'), aprovacao: 'aprovado' }], [local]),
    ).toEqual([{ ...job('remote'), aprovacao: 'aprovado', id: 'local', remoteId: 'remote' }]);
  });
});
