import { getApiBaseUrl } from './config';
import type {
  HealthResponse,
  WatchlistResponse,
  WatchlistSymbol,
  ScannerResponse,
  ScannerResult,
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

export async function fetchScanner(): Promise<{
  ok: boolean;
  data?: ScannerResponse;
  error?: string;
}> {
  try {
    const data = await request<ScannerResponse>('/scanner');
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function isResultAvailable(r: ScannerResult): boolean {
  return (
    r.price !== undefined &&
    r.price !== null &&
    !isNaN(Number(r.price))
  );
}

export interface BacktestApiResponse {
  symbol: string;
  data_source: string;
  data_date: string;
  summary: {
    strategy: string;
    ema_fast_period: number;
    ema_slow_period: number;
    rows: number;
    initial_capital: number;
    final_equity: number;
    total_return_pct: number;
    buy_hold_return_pct: number;
    cagr_pct_approx: number | null;
    max_drawdown_pct: number;
    entries: number;
    fee_bps_per_side_assumption: number;
    slippage_bps_per_side_assumption: number;
    sharpe_like_per_bar_not_annualized: number | null;
    warning: string;
  };
  equity_curve: {
    date: string;
    equity: number;
    buy_hold_equity: number;
  }[];
  warning: string;
}

export async function fetchBacktest(params: {
  symbol: string;
  fast: number;
  slow: number;
  initialCapital: number;
  feeBps: number;
  slippageBps: number;
}): Promise<BacktestApiResponse> {
  const query = new URLSearchParams({
    symbol: params.symbol,
    fast: String(params.fast),
    slow: String(params.slow),
    initial_capital: String(params.initialCapital),
    fee_bps: String(params.feeBps),
    slippage_bps: String(params.slippageBps),
  });

  return request<BacktestApiResponse>(
    `/backtest?${query.toString()}`,
    undefined,
    60000,
  );
}
