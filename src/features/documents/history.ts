import type { UploadItem } from '@/contracts/models';
export type UploadJob = UploadItem & { remoteId?: string };

/** Preserve uploads created while the history request was in flight. */
export function mergeUploadHistory(
  current: UploadJob[],
  history: UploadItem[],
  baseline: UploadJob[],
) {
  const saved = new Map(history.map((item) => [item.id, item]));
  const previous = new Map(baseline.map((item) => [item.id, item.remoteId]));
  const merged = current.flatMap((item) => {
    const remote = saved.get(item.remoteId || item.id);
    if (remote) {
      saved.delete(remote.id);
      return [{ ...remote, id: item.id, remoteId: remote.id }];
    }
    return !item.remoteId || previous.get(item.id) !== item.remoteId ? [item] : [];
  });
  return [...merged, ...Array.from(saved.values(), (item) => ({ ...item, remoteId: item.id }))];
}

export async function readUploadHistory(
  load: (offset: number, signal: AbortSignal) => Promise<UploadItem[]>,
  signal: AbortSignal,
) {
  const result: UploadItem[] = [],
    seen = new Set<string>();
  for (let offset = 0; offset < 100000; offset += 100) {
    const batch = await load(offset, signal);
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    if (
      new Set(batch.map((item) => item.id)).size !== batch.length ||
      batch.length > 100 ||
      batch.some((item) => seen.has(item.id))
    )
      throw new Error('O serviço repetiu uma página do histórico. Tente atualizar os arquivos.');
    for (const item of batch) {
      seen.add(item.id);
      result.push(item);
    }
    if (batch.length < 100) return result;
  }
  throw new Error('Histórico incompleto: refine a consulta no serviço antes de continuar.');
}
