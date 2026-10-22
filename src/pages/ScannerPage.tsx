import { useState, useMemo } from 'react';
import { Search, ScanLine } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { ChangeIndicator } from '../components/ChangeIndicator';
import { LoadingBlock, ErrorBlock } from '../components/Status';
import { useAsync } from '../hooks/useAsync';
import { useAppContext } from '../context/AppContext';
import { fetchWatchlist } from '../lib/api';
import type { WatchlistSymbol } from '../types';

const FALLBACK_SYMBOLS: WatchlistSymbol[] = [
  { symbol: 'ICICIBANK' },
  { symbol: 'ITC' },
  { symbol: 'BHARTIARTL' },
  { symbol: 'RELIANCE' },
  { symbol: 'TCS' },
  { symbol: 'HDFCBANK' },
  { symbol: 'INFY' },
  { symbol: 'LT' },
  { symbol: 'AXISBANK' },
  { symbol: 'SBIN' },
];

export function ScannerPage() {
  const { apiStatus, autoRefresh, refreshInterval } = useAppContext();
  const [query, setQuery] = useState('');

  const { data: watchlist, loading, error, refetch } = useAsync(
    () => fetchWatchlist().then((r) => ({ ok: r.ok, data: r.symbols, error: r.error })),
    [],
    { autoRefresh: apiStatus === 'connected' && autoRefresh, refreshInterval },
  );

  const symbols = watchlist && watchlist.length > 0 ? watchlist : FALLBACK_SYMBOLS;

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return symbols;
    return symbols.filter((s) => s.symbol.includes(q));
  }, [symbols, query]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">Stock Scanner</h1>
        <p className="text-sm text-terminal-300 mt-1">
          Search and filter NSE stocks. Price data is shown when the backend provides it.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Symbol Scanner"
          subtitle="Live data depends on backend availability"
          icon={<ScanLine className="w-4 h-4" />}
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

          {loading ? (
            <LoadingBlock message="Loading stock list&hellip;" />
          ) : error ? (
            <ErrorBlock message={`Failed to fetch watchlist: ${error}`} onRetry={refetch} />
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-terminal-300 border-b border-terminal-700/50">
                    <th className="text-left font-medium px-5 py-3">#</th>
                    <th className="text-left font-medium px-5 py-3">Symbol</th>
                    <th className="text-right font-medium px-5 py-3">LTP</th>
                    <th className="text-right font-medium px-5 py-3">Change</th>
                    <th className="text-right font-medium px-5 py-3 hidden sm:table-cell">Change %</th>
                    <th className="text-right font-medium px-5 py-3 hidden md:table-cell">High</th>
                    <th className="text-right font-medium px-5 py-3 hidden md:table-cell">Low</th>
                    <th className="text-right font-medium px-5 py-3 hidden lg:table-cell">Volume</th>
                    <th className="text-right font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.symbol}
                      className="border-b border-terminal-700/30 hover:bg-terminal-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-terminal-400 text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-sm font-medium text-terminal-100">{s.symbol}</span>
                        {s.sector && (
                          <span className="block text-xs text-terminal-400 mt-0.5">{s.sector}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-terminal-300">--</td>
                      <td className="px-5 py-3 text-right">
                        <ChangeIndicator unavailable />
                      </td>
                      <td className="px-5 py-3 text-right hidden sm:table-cell">
                        <ChangeIndicator suffix="%" unavailable />
                      </td>
                      <td className="px-5 py-3 text-right hidden md:table-cell font-mono text-terminal-300">--</td>
                      <td className="px-5 py-3 text-right hidden md:table-cell font-mono text-terminal-300">--</td>
                      <td className="px-5 py-3 text-right hidden lg:table-cell font-mono text-terminal-300">--</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant="neutral">No data</Badge>
                      </td>
                    </tr>
                  ))}
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
