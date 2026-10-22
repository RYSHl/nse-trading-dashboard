import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getApiBaseUrl,
  setApiBaseUrl as persistBaseUrl,
  getRefreshInterval,
  setRefreshInterval as persistInterval,
  getAutoRefresh,
  setAutoRefresh as persistAutoRefresh,
} from '../lib/config';
import { checkHealth } from '../lib/api';
import type { ApiStatus } from '../types';

interface AppContextValue {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  apiStatus: ApiStatus;
  apiError: string | null;
  lastChecked: Date | null;
  testConnection: () => Promise<void>;
  refreshInterval: number;
  setRefreshInterval: (s: number) => void;
  autoRefresh: boolean;
  setAutoRefresh: (b: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiBaseUrl, setBaseUrlState] = useState(getApiBaseUrl());
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [refreshInterval, setRefreshIntervalState] = useState(getRefreshInterval());
  const [autoRefresh, setAutoRefreshState] = useState(getAutoRefresh());

  const testConnection = useCallback(async () => {
    setApiStatus('loading');
    setApiError(null);
    const result = await checkHealth();
    setLastChecked(new Date());
    if (result.ok) {
      setApiStatus('connected');
      setApiError(null);
    } else {
      setApiStatus('error');
      setApiError(result.error || 'Connection failed');
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [apiBaseUrl, testConnection]);

  const setApiBaseUrl = useCallback((url: string) => {
    persistBaseUrl(url);
    setBaseUrlState(getApiBaseUrl());
  }, []);

  const setRefreshInterval = useCallback((s: number) => {
    persistInterval(s);
    setRefreshIntervalState(s);
  }, []);

  const setAutoRefresh = useCallback((b: boolean) => {
    persistAutoRefresh(b);
    setAutoRefreshState(b);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      apiBaseUrl,
      setApiBaseUrl,
      apiStatus,
      apiError,
      lastChecked,
      testConnection,
      refreshInterval,
      setRefreshInterval,
      autoRefresh,
      setAutoRefresh,
    }),
    [apiBaseUrl, setApiBaseUrl, apiStatus, apiError, lastChecked, testConnection, refreshInterval, setRefreshInterval, autoRefresh, setAutoRefresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
