// Configurable API base URL for the FastAPI backend.
// The user can override this in Settings; it persists to localStorage.

const STORAGE_KEY = 'nse_api_base_url';

const FALLBACK_API_BASE_URL = 'https://nse-algo-trading-2l1a.onrender.com';

// Build-time configured API base URL, with hardcoded fallback.
const ENV_API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL as string | undefined;

const DEFAULT_API_BASE_URL = ENV_API_BASE_URL || FALLBACK_API_BASE_URL;

export function getApiBaseUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '');
  } catch {
    // localStorage might be unavailable
  }
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  const cleaned = url.trim().replace(/\/+$/, '');
  try {
    localStorage.setItem(STORAGE_KEY, cleaned || DEFAULT_API_BASE_URL);
  } catch {
    // ignore
  }
}

export function getDefaultApiBaseUrl(): string {
  return DEFAULT_API_BASE_URL;
}

export const REFRESH_INTERVAL_KEY = 'nse_refresh_interval';
const DEFAULT_REFRESH_INTERVAL = 30; // seconds

export function getRefreshInterval(): number {
  try {
    const stored = localStorage.getItem(REFRESH_INTERVAL_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n) && n >= 5) return n;
    }
  } catch {
    // ignore
  }
  return DEFAULT_REFRESH_INTERVAL;
}

export function setRefreshInterval(seconds: number): void {
  try {
    localStorage.setItem(REFRESH_INTERVAL_KEY, String(seconds));
  } catch {
    // ignore
  }
}

export function getDefaultRefreshInterval(): number {
  return DEFAULT_REFRESH_INTERVAL;
}

export const AUTO_REFRESH_KEY = 'nse_auto_refresh';
export function getAutoRefresh(): boolean {
  try {
    return localStorage.getItem(AUTO_REFRESH_KEY) !== 'false';
  } catch {
    return true;
  }
}
export function setAutoRefresh(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_REFRESH_KEY, String(enabled));
  } catch {
    // ignore
  }
}
