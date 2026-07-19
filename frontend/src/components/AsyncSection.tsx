import { createContext, useContext, useEffect, useState } from 'react';
import { Shimmer } from '@shimmer-from-structure/react';
import type { DataState } from '../hooks/useData';

export const AsyncLoadingContext = createContext(false);
export const useAsyncLoading = () => useContext(AsyncLoadingContext);

interface AsyncSectionProps<T> {
  state: DataState<T>;
  onRetry?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  shimmerColor?: string;
  backgroundColor?: string;
}

export default function AsyncSection<T>({
  state,
  children,
  skeleton,
  shimmerColor = 'rgba(107, 114, 128, 0.25)',
  backgroundColor = 'rgba(156, 163, 175, 0.15)',
}: AsyncSectionProps<T>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (state.loading || state.error) {
      setReady(false);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, [state.loading, state.error]);

  const shimmerChild = skeleton ?? children;

  if (ready) {
    return (
      <AsyncLoadingContext.Provider value={true}>
        {children}
      </AsyncLoadingContext.Provider>
    );
  }

  return (
    <AsyncLoadingContext.Provider value={true}>
      <div className={!state.loading && !state.error ? 'shimmer-fadeout' : ''}>
        <Shimmer loading={true} shimmerColor={shimmerColor} backgroundColor={backgroundColor}>
          {shimmerChild}
        </Shimmer>
      </div>
    </AsyncLoadingContext.Provider>
  );
}
