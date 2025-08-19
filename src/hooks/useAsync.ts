import { useState, useEffect, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}

export function useAsyncCallback<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
): {
  execute: (...args: Args) => Promise<void>;
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: Args) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await asyncFunction(...args);
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }, [asyncFunction]);

  return {
    execute,
    ...state,
  };
}