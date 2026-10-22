import { getApiBaseUrl } from './config';
import type {
  HealthResponse,
  WatchlistResponse,
  WatchlistSymbol,
} from '../types';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
  timeoutMs = 15000,
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(
        `Request failed (${res.status})`,
        res.status,
      );
    }

    const text = await res.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out');
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network request failed',
    );
  }
}

export async function checkHealth(): Promise<{ ok: boolean; data?: HealthResponse; error?: string }> {
  try {
    const data = await request<HealthResponse>('/health', undefined, 10000);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function fetchWatchlist(): Promise<{
  ok: boolean;
  symbols?: WatchlistSymbol[];
  error?: string;
}> {
  try {
    const data = await request<WatchlistResponse>('/watchlist');
    const symbols = normalizeSymbols(data);
    return { ok: true, symbols };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function normalizeSymbols(data: WatchlistResponse): WatchlistSymbol[] {
  // The backend may return symbols in several shapes; normalize to our type.
  if (Array.isArray(data.symbols)) {
    return data.symbols.map((s) =>
      typeof s === 'string' ? { symbol: s } : (s as WatchlistSymbol),
    );
  }
  if (Array.isArray(data.watchlist)) {
    return data.watchlist.map((s) =>
      typeof s === 'string' ? { symbol: s } : (s as WatchlistSymbol),
    );
  }
  return [];
}
