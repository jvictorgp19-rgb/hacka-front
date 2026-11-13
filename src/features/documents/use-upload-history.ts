'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { AppGateway } from '@/services/gateway';
import { mergeUploadHistory, readUploadHistory, type UploadJob } from './history';

export function useUploadHistory(
  gateway: AppGateway | null,
  jobs: UploadJob[],
  setJobs: Dispatch<SetStateAction<UploadJob[]>>,
  setError: Dispatch<SetStateAction<string>>,
) {
  const [loading, setLoading] = useState(false),
    [revision, setRevision] = useState(0);
  const current = useRef(jobs),
    generation = useRef(0);
  useEffect(() => {
    current.current = jobs;
  }, [jobs]);
  const invalidate = useCallback(() => {
    generation.current++;
    setRevision((n) => n + 1);
  }, []);
  useEffect(() => {
    if (gateway?.mode !== 'api') return;
    window.addEventListener('focus', invalidate);
    return () => window.removeEventListener('focus', invalidate);
  }, [gateway, invalidate]);
  useEffect(() => {
    if (gateway?.mode !== 'api') return;
    const abort = new AbortController(),
      version = ++generation.current,
      baseline = current.current;
    async function restore() {
      setLoading(true);
      try {
        const history = await readUploadHistory(
          (offset, signal) => gateway!.uploads(offset, signal),
          abort.signal,
        );
        if (!abort.signal.aborted && version === generation.current) {
          setJobs((value) => mergeUploadHistory(value, history, baseline));
        }
      } catch (error) {
        if (!abort.signal.aborted && version === generation.current)
          setError(
            error instanceof Error ? error.message : 'Não foi possível recuperar seus arquivos.',
          );
      } finally {
        if (!abort.signal.aborted && version === generation.current) setLoading(false);
      }
    }
    void restore();
    return () => {
      abort.abort();
    };
  }, [gateway, setJobs, setError, revision]);
  useEffect(() => {
    if (gateway?.mode !== 'api') return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>,
      delay = 3000;
    async function poll() {
      const pending = current.current.filter(
        (job) => job.remoteId && ['waiting', 'processing'].includes(job.status),
      );
      if (pending.length) {
        const version = generation.current;
        const updates = await Promise.allSettled(
          pending.map((job) => gateway!.uploadStatus(job.remoteId!, abort.signal)),
        );
        if (abort.signal.aborted) return;
        let failed = false;
        if (version === generation.current)
          updates.forEach((result) => {
            if (result.status === 'fulfilled')
              setJobs((value) =>
                value.map((job) =>
                  job.remoteId === result.value.id
                    ? { ...result.value, id: job.id, remoteId: result.value.id }
                    : job,
                ),
              );
            else {
              failed = true;
              setError(
                result.reason instanceof Error
                  ? result.reason.message
                  : 'Não foi possível atualizar o processamento.',
              );
            }
          });
        delay = failed ? Math.min(delay * 2, 30000) : 3000;
      }
      if (!abort.signal.aborted) timer = setTimeout(poll, delay);
    }
    timer = setTimeout(poll, delay);
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [gateway, setJobs, setError]);
  return { historyLoading: loading, refreshHistory: invalidate, invalidateHistory: invalidate };
}
