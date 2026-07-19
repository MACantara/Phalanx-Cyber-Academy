import { useCallback, useEffect, useRef, useState } from 'react';

export interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export interface UseDataOptions<T> {
  initial: T;
}

export function useData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  options: UseDataOptions<T>
): DataState<T> & { reload: () => void } {
  const { initial } = options;
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const timeoutRef = useRef<number | null>(null);
  const attemptRef = useRef(0);

  const load = useCallback(async () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      attemptRef.current = 0;
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Unknown error';
      setError(message);
      attemptRef.current += 1;
      const delay = Math.min(2000 * attemptRef.current, 30000);
      timeoutRef.current = window.setTimeout(() => load(), delay);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => {
    attemptRef.current = 0;
    load();
  }, [load]);

  useEffect(() => {
    load();
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return { data, loading, error, reload };
}
