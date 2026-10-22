import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
}

export function useAsync<T>(
  fetcher: () => Promise<{ ok: boolean; data?: T; error?: string }>,
  deps: React.DependencyList = [],
  options: UseAsyncOptions = {},
) {
  const { autoRefresh = false, refreshInterval = 30 } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const result = await fetcherRef.current();
    if (result.ok && result.data !== undefined) {
      setState({ data: result.data, loading: false, error: null });
    } else {
      setState({ data: null, loading: false, error: result.error || 'Failed to load data' });
    }
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!autoRefresh || refreshInterval < 5) return;
    const id = setInterval(() => {
      run();
    }, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, run]);

  return { ...state, refetch: run };
}
