import { Activity, TrendingUp, TrendingDown, Wallet, BellRing, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { ChangeIndicator } from '../components/ChangeIndicator';
import { LoadingBlock, ErrorBlock, UnavailableNotice, StatusPill } from '../components/Status';
import { Sparkline } from '../components/Sparkline';
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

export function OverviewPage() {
  const { apiStatus, autoRefresh, refreshInterval } = useAppContext();

  const { data: watchlist, loading, error, refetch } = useAsync(
    () => fetchWatchlist().then((r) => ({ ok: r.ok, data: r.symbols, error: r.error })),
    [],
    { autoRefresh: apiStatus === 'connected' && autoRefresh, refreshInterval },
  );

  const symbols = watchlist && watchlist.length > 0 ? watchlist : FALLBACK_SYMBOLS;
  const usingFallback = !watchlist || watchlist.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-terminal-100">Market Overview</h1>
          <p className="text-sm text-terminal-300 mt-1">
            Research dashboard for paper-trading analysis. No real orders are placed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={apiStatus} />
          {usingFallback && !loading && (
            <Badge variant="warning">Fallback list</Badge>
          )}
        </div>
      </div>

      {/* Market summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MarketSummaryCard
          title="NIFTY 50"
          icon={<TrendingUp className="w-4 h-4" />}
          available={false}
        />
        <MarketSummaryCard
          title="BANK NIFTY"
          icon={<TrendingDown className="w-4 h-4" />}
          available={false}
        />
        <MarketSummaryCard
          title="INDIA VIX"
          icon={<Activity className="w-4 h-4" />}
          available={false}
        />
        <MarketSummaryCard
          title="USD/INR"
          icon={<Wallet className="w-4 h-4" />}
          available={false}
        />
      </div>

      {/* Portfolio + Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PortfolioCard />
        <SignalsCard symbols={symbols.slice(0, 5)} />
      </div>

      {/* Watchlist */}
      <Card>
        <CardHeader
          title="Watchlist"
          subtitle="Symbols loaded from backend /watchlist endpoint"
          icon={<Eye className="w-4 h-4" />}
          action={
            <button
              onClick={refetch}
              className="text-xs text-accent hover:text-accent-light transition-colors"
            >
              Refresh
            </button>
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <LoadingBlock message="Fetching watchlist from backend&hellip;" />
          ) : error ? (
            <ErrorBlock message={`Could not load watchlist: ${error}. Showing fallback stock list.`} onRetry={refetch} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-terminal-700/50 text-terminal-300">
                    <th className="text-left font-medium px-5 py-3">#</th>
                    <th className="text-left font-medium px-5 py-3">Symbol</th>
                    <th className="text-right font-medium px-5 py-3">Price</th>
                    <th className="text-right font-medium px-5 py-3 hidden sm:table-cell">Change</th>
                    <th className="text-right font-medium px-5 py-3 hidden md:table-cell">Volume</th>
                    <th className="text-right font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols.map((s, i) => (
                    <WatchlistRow key={s.symbol} index={i} symbol={s.symbol} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {usingFallback && !loading && !error && (
            <div className="px-5 py-3 text-xs text-warning border-t border-terminal-700/50">
              Backend did not return symbols. Showing the 10 configured NSE stocks.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function MarketSummaryCard({
  title,
  icon,
  available = false,
}: {
  title: string;
  icon: React.ReactNode;
  available?: boolean;
}) {
  return (
    <Card hover className="overflow-hidden">
      <CardBody className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="stat-label">{title}</span>
          <span className="text-terminal-400">{icon}</span>
        </div>
        {available ? (
          <>
            <div className="stat-value">--</div>
            <div className="flex items-center gap-2 mt-2">
              <ChangeIndicator unavailable />
              <Sparkline data={[]} />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="text-lg font-mono text-terminal-300">N/A</div>
            <Badge variant="neutral">Data unavailable</Badge>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function PortfolioCard() {
  return (
    <Card>
      <CardHeader
        title="Portfolio Overview"
        subtitle="Paper trading account"
        icon={<Wallet className="w-4 h-4" />}
      />
      <CardBody>
        <UnavailableNotice
          label="No paper-trading portfolio data available yet. Start a backtest in Strategy Lab to simulate trades."
          className="py-8"
        />
      </CardBody>
    </Card>
  );
}

function SignalsCard({ symbols }: { symbols: WatchlistSymbol[] }) {
  return (
    <Card>
      <CardHeader
        title="Recent Signals"
        subtitle="Strategy-generated trade signals"
        icon={<BellRing className="w-4 h-4" />}
      />
      <CardBody className="space-y-2">
        {symbols.map((s) => (
          <div
            key={s.symbol}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-terminal-800/40 border border-terminal-700/30"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-terminal-100">{s.symbol}</span>
            </div>
            <Badge variant="neutral">No signal</Badge>
          </div>
        ))}
        <div className="pt-2 text-xs text-terminal-300">
          Signals require live strategy execution on the backend.
        </div>
      </CardBody>
    </Card>
  );
}

function WatchlistRow({ index, symbol }: { index: number; symbol: string }) {
  return (
    <tr className="border-b border-terminal-700/30 hover:bg-terminal-800/40 transition-colors">
      <td className="px-5 py-3 text-terminal-400 text-xs tabular-nums">{String(index + 1).padStart(2, '0')}</td>
      <td className="px-5 py-3">
        <span className="font-mono text-sm font-medium text-terminal-100">{symbol}</span>
      </td>
      <td className="px-5 py-3 text-right font-mono text-terminal-300">--</td>
      <td className="px-5 py-3 text-right hidden sm:table-cell">
        <ChangeIndicator unavailable />
      </td>
      <td className="px-5 py-3 text-right hidden md:table-cell font-mono text-terminal-300">--</td>
      <td className="px-5 py-3 text-right">
        <Badge variant="neutral">No data</Badge>
      </td>
    </tr>
  );
}
