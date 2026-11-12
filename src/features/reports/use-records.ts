'use client';
import { useEffect, useState, type SetStateAction } from 'react';
import type { SavedRecord } from '@/contracts/models';
import { useWorkspace } from '@/features/workspace/context';
export function useRecords() {
  const { gateway, context } = useWorkspace();
  const [state, setState] = useState<{ persona: string; values: SavedRecord[] }>({
    persona: '',
    values: [],
  });
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    gateway
      ?.records(context.persona, controller.signal)
      .then((values) => {
        if (!controller.signal.aborted) {
          setState({ persona: context.persona, values });
          setError('');
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : 'Não foi possível carregar os registros.');
          setState({ persona: context.persona, values: [] });
        }
      });
    return () => controller.abort();
  }, [gateway, context.persona]);
  const setRecords = (update: SetStateAction<SavedRecord[]>) =>
    setState((current) => ({
      persona: context.persona,
      values:
        typeof update === 'function'
          ? update(current.persona === context.persona ? current.values : [])
          : update,
    }));
  return {
    records: state.persona === context.persona ? state.values : [],
    setRecords,
    error,
    loading: state.persona !== context.persona,
  };
}
