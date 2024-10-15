import { AugmentedBrowser, browser } from 'wxt/browser';
import { useState, useEffect, useCallback } from 'react';

type StorageArea = 'local' | 'sync' | 'managed';

interface UseStoredValueOptions<T> {
  initialValue?: T;
  storageArea?: StorageArea;
}

interface StorageChange {
  oldValue?: any;
  newValue?: any;
}

export function useStoredValue<T>(
  key: string,
  options: UseStoredValueOptions<T> = {}
) {
  const { initialValue, storageArea = 'local' } = options;
  const [state, setState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getStoredValue = useCallback(async () => {
    try {
      const result = await browser.storage[storageArea].get(key);
      return result[key] ?? initialValue ?? null;
    } catch (err) {
      console.error('Error retrieving stored value:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return initialValue ?? null;
    }
  }, [key, initialValue, storageArea]);

  const setStoredValue = useCallback(async (newValue: T) => {
    try {
      await browser.storage[storageArea].set({ [key]: newValue });
      setState(newValue);
    } catch (err) {
      console.error('Error setting stored value:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [key, storageArea]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialValue = async () => {
      setIsLoading(true);
      const value = await getStoredValue();
      if (isMounted) {
        setState(value);
        setIsLoading(false);
      }
    };
    loadInitialValue();

    const onChange = (changes: { [key: string]: StorageChange }, areaName: string) => {
      if (areaName === storageArea && key in changes) {
        setState(changes[key].newValue ?? initialValue ?? null);
      }
    };

    browser.storage.onChanged.addListener(onChange);
    return () => {
      isMounted = false;
      browser.storage.onChanged.removeListener(onChange);
    };
  }, [key, storageArea, getStoredValue, initialValue]);

  return {
    state,
    setState: setStoredValue,
    isLoading,
    error,
  };
}