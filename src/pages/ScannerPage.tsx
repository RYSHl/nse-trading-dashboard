import { useState, useMemo } from 'react';
import { Search, ScanLine, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { ChangeIndicator } from '../components/ChangeIndicator';
import { LoadingBlock, ErrorBlock, UnavailableNotice } from '../components/Status';
import { useAsync } from '../hooks/useAsync';
import { useAppContext } from '../context/AppContext';
import { fetchScanner, isResultAvailable } from '../lib/api';
import type { ScannerResult } from '../types';
import { cn } from '../utils/cn';

function formatPrice(v: number | null | undefined): string {
  if (v === null || v === undefined || isNaN(v)) return '--';
  return v.toFixed(2);
}

function formatNum(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined || isNaN(v)) return '--';
  return Number(v).toFixed(digits);
}

function formatDate(v: string | null | undefined): string {
  if (!v) return '--';
  return String(v);
}

function signalBadgeVariant(signal: string | null | undefined): { variant: 'green' | 'red' | 'neutral'; label: string } {
  if (!signal) return { variant: 'neutral', label: 'N/A' };
  const s = signal.toUpperCase();
  if (s.includes('BUY') || s.includes('BULL') || s.includes('UP')) return { variant: 'green', label: signal };
  if (s.includes('SELL') || s.includes('BEAR') || s.includes('DOWN')) return { variant: 'red', label: signal };
  if (s.includes('HOLD') || s.includes('NEUTRAL') || s.includes('WAIT')) return { variant: 'neutral', label: signal };
  return { variant: 'neutral', label: signal };
}

function rsiColor(v: number | null | undefined): string {
  if (v === null || v === undefined || isNaN(v)) return 'text-terminal-300';
  const n = Number(v);
  if (n >= 70) return 'text-bear';
  if (n <= 30) return 'text-bull';
  return 'text-terminal-100';
}

export function ScannerPage() {
  const { apiStatus, autoRefresh, refreshInterval } = useAppContext();
  const [query, setQuery] = useState('');

  const [trendFilter, setTrendFilter] = useState('ALL');
const [sortBy, setSortBy] = useState('symbol');
const [sortDirection, setSortDirection] = useState('asc');

  const { data: scannerData, loading, error, refetch } = useAsync(
    () => fetchScanner().then((r) => ({ ok: r.ok, data: r.data, error: r.error })),
    [],
    { autoRefresh: apiStatus === 'connected' && autoRefresh, refreshInterval },
  );

  const results: ScannerResult[] = useMemo(() => {
    return scannerData?.results ?? [];
  }, [scannerData]);

  
const filtered = useMemo(() => {
  const q = query.trim().toUpperCase();

  const rows = results.filter((r) => {
    const matchesSearch = (r.symbol ?? '').toUpperCase().includes(q);
    const signal = (r.signal ?? '').toUpperCase();

    const matchesTrend =
      trendFilter === 'ALL' ||
      (trendFilter === 'BULLISH' &&
        (signal.includes('BUY') ||
          signal.includes('BULL') ||
          signal.includes('UP'))) ||
      (trendFilter === 'BEARISH' &&
        (signal.includes('SELL') ||
          signal.includes('BEAR') ||
          signal.includes('DOWN'))) ||
      (trendFilter === 'NEUTRAL' &&
        (signal.includes('HOLD') ||
          signal.includes('NEUTRAL') ||
          signal.includes('WAIT')));

    return matchesSearch && matchesTrend;
  });

  return rows.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'symbol') {
      comparison = (a.symbol ?? '').localeCompare(b.symbol ?? '');
    } else {
      const getValue = (r: ScannerResult) => {
        if (sortBy === 'price') return r.price ?? -Infinity;
        if (sortBy === 'change') return r.change_percent ?? -Infinity;
        if (sortBy === 'rsi') return r.rsi14 ?? -Infinity;
        return 0;
      };

      comparison = getValue(a) - getValue(b);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}, [results, query, trendFilter, sortBy, sortDirection]);


  const lastUpdated = scannerData?.source ? scannerData.source : null;
  const count = scannerData?.count ?? results.length;
  const hasData = results.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">Stock Scanner</h1>
        <p className="text-sm text-terminal-300 mt-1">
          Technical indicators from the backend /scanner endpoint. Research only — no live trades.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Symbol Scanner"
          subtitle={hasData ? `${count} symbols loaded` : 'Live data depends on backend availability'}
          icon={<ScanLine className="w-4 h-4" />}
          action={
            <button
              onClick={refetch}
              disabled={loading}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors',
                loading && 'opacity-50 cursor-not-allowed',
              )}
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Refresh
            </button>
          }
        />
        <CardBody className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by symbol (e.g. ICICIBANK, RELIANCE)"
              className="w-full pl-10 pr-4 py-2.5 bg-terminal-800 border border-terminal-700 rounded-lg text-sm text-terminal-100 placeholder-terminal-400 focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all"
            />
          </div>

          {/* Data source badge */}
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-terminal-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-bull" />
              Source: {lastUpdated}
              {scannerData?.data_type && <span className="text-terminal-400">&middot; {scannerData.data_type}</span>}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <LoadingBlock message="Fetching scanner data from backend&hellip;" />
          ) : error ? (
            <ErrorBlock
              message={`Could not load scanner data: ${error}. Check that the backend is running and CORS is enabled.`}
              onRetry={refetch}
            />
          ) : !hasData ? (
            <UnavailableNotice
              label="No scanner results returned by the backend. Verify the /scanner endpoint is available and try refreshing."
              className="py-8"
            />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-terminal-300 border-b border-terminal-700/50">
                    <th className="text-left font-medium px-5 py-3">#</th>
                    <th className="text-left font-medium px-5 py-3">Symbol</th>
                    <th className="text-right font-medium px-5 py-3">Price</th>
                    <th className="text-right font-medium px-5 py-3">Change %</th>
                    <th className="text-right font-medium px-5 py-3 hidden sm:table-cell">SMA20</th>
                    <th className="text-right font-medium px-5 py-3 hidden sm:table-cell">SMA50</th>
                    <th className="text-right font-medium px-5 py-3 hidden md:table-cell">RSI14</th>
                    <th className="text-center font-medium px-5 py-3">Signal</th>
                    <th className="text-right font-medium px-5 py-3 hidden lg:table-cell">Data Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const available = isResultAvailable(r);
                    const sig = signalBadgeVariant(r.signal);
                    return (
                      <tr
                        key={r.symbol ?? `row-${i}`}
                        className="border-b border-terminal-700/30 hover:bg-terminal-800/40 transition-colors"
                      >
                        <td className="px-5 py-3 text-terminal-400 text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-sm font-medium text-terminal-100">{r.symbol}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-terminal-100">
                          {available ? formatPrice(r.price) : <span className="text-terminal-300">--</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <ChangeIndicator value={r.change_percent ?? undefined} suffix="%" unavailable={!available} />
                        </td>
                        <td className="px-5 py-3 text-right hidden sm:table-cell font-mono text-terminal-200">
                          {formatNum(r.sma20)}
                        </td>
                        <td className="px-5 py-3 text-right hidden sm:table-cell font-mono text-terminal-200">
                          {formatNum(r.sma50)}
                        </td>
                        <td className={cn('px-5 py-3 text-right hidden md:table-cell font-mono', rsiColor(r.rsi14))}>
                          {formatNum(r.rsi14)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant={sig.variant}>{sig.label}</Badge>
                        </td>
                        <td className="px-5 py-3 text-right hidden lg:table-cell font-mono text-xs text-terminal-300">
                          {formatDate(r.data_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-terminal-300">
                  No symbols match &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
