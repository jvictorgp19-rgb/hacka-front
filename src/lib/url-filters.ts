'use client';
import { useSyncExternalStore, useCallback } from 'react';
const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  window.addEventListener('raiziq:filters', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('raiziq:filters', callback);
  };
};
export function useUrlFilters() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  );
  return {
    params: new URLSearchParams(search),
    update: useCallback((values: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(values)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${params.size ? '?' + params : ''}`,
      );
      window.dispatchEvent(new Event('raiziq:filters'));
    }, []),
  };
}
