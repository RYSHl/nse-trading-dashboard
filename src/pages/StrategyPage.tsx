
import { useState } from 'react';
import {
  FlaskConical,
  Play,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

import { Card, CardHeader, CardBody } from '../components/Card';
import { LineChart, DrawdownChart } from '../components/Charts';
import { fetchBacktest } from '../lib/api';

const SYMBOLS = [
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'ICICIBANK.NS',
  'ITC.NS',
  'BHARTIARTL.NS',
  'LT.NS',
  'AXISBANK.NS',
  'SBIN.NS',
];

type BacktestResult = Awaited<ReturnType<typeof fetchBacktest>>;

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);

const percent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

export function StrategyPage() {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [fast, setFast] = useState(20);
  const [slow, setSlow] = useState(50);
  const [capital, setCapital] = useState(100000);
  const [feeBps, setFeeBps] = useState(3);
  const [slippageBps, setSlippageBps] = useState(5);

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRun() {
    if (!Number.isInteger(fast) || !Number.isInteger(slow) ||
        fast < 1 || slow < 2 || fast >= slow) {
      setError('Fast EMA must be a positive integer smaller than Slow EMA.');
      return;
    }

    if (!Number.isFinite(capital) || capital <= 0) {
      setError('Initial capital must be greater than zero.');
      return;
    }

    if (
      !Number.isFinite(feeBps) || feeBps < 0 ||
      !Number.isFinite(slippageBps) || slippageBps < 0
    ) {
      setError('Fees and slippage must be zero or greater.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchBacktest({
        symbol,
        fast,
        slow,
        initialCapital: capital,
        feeBps,
        slippageBps,
      });

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not run the backtest. Please try again.',
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const summary = result?.summary;
  const curve = result?.equity_curve ?? [];

  const drawdownData = curve.map((point, index) => {
    const peak = Math.max(
      ...curve.slice(0, index + 1).map((item) => item.equity),
    );

    return {
      date: point.date,
      drawdown: peak > 0
        ? ((point.equity - peak) / peak) * 100
        : 0,
    };
  });

  const metrics = [
    {
      label: 'Final Equity',
      value: summary ? money(summary.final_equity) : '—',
      detail: summary
        ? `Initial: ${money(summary.initial_capital)}`
        : 'Run a backtest to calculate',
      icon: WalletIcon,
    },
    {
      label: 'Strategy Return',
      value: summary ? percent(summary.total_return_pct) : '—',
      detail: summary
        ? `CAGR (approx.): ${
            summary.cagr_pct_approx == null
              ? 'N/A'
              : percent(summary.cagr_pct_approx)
          }`
        : 'Total strategy return',
      icon: summary && summary.total_return_pct >= 0
        ? TrendingUp
        : TrendingDown,
    },
    {
      label: 'Buy & Hold Return',
      value: summary ? percent(summary.buy_hold_return_pct) : '—',
      detail: 'Benchmark return',
      icon: Activity,
    },
    {
      label: 'Maximum Drawdown',
      value: summary ? percent(summary.max_drawdown_pct) : '—',
      detail: summary
        ? `${summary.entries} entries`
        : 'Largest peak-to-trough decline',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">
          Strategy Lab
        </h1>
        <p className="mt-1 text-sm text-terminal-300">
          Configure an EMA crossover strategy and run a historical backtest.
          Research only — no live orders.
        </p>
      </div>

      <Card>
        <CardHeader
          title="EMA Crossover Strategy"
          subtitle="Configure your stock, moving-average periods and trading assumptions."
          icon={<FlaskConical className="h-4 w-4" />}
        />

        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="stat-label mb-2 block">
                Stock Symbol
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              >
                {SYMBOLS.map((item) => (
                  <option key={item} value={item}>
                    {item.replace('.NS', '')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="stat-label mb-2 block">
                Fast EMA
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={fast}
                onChange={(e) => setFast(Number(e.target.value))}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="stat-label mb-2 block">
                Slow EMA
              </label>
              <input
                type="number"
                min="2"
                step="1"
                value={slow}
                onChange={(e) => setSlow(Number(e.target.value))}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="stat-label mb-2 block">
                Initial Capital (₹)
              </label>
              <input
                type="number"
                min="1"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="stat-label mb-2 block">
                Fee (basis points per side)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={feeBps}
                onChange={(e) => setFeeBps(Number(e.target.value))}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-terminal-400">
                1 basis point = 0.01%
              </p>
            </div>

            <div>
              <label className="stat-label mb-2 block">
                Slippage (basis points per side)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={slippageBps}
                onChange={(e) => setSlippageBps(Number(e.target.value))}
                className="w-full rounded-lg border border-terminal-700 bg-terminal-800 px-3 py-2 text-sm text-terminal-100 focus:border-accent/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {loading ? 'Running Backtest…' : 'Run Backtest'}
            </button>

            <span className="text-xs text-terminal-400">
              Historical daily data · Yahoo Finance
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Backtest failed</p>
                <p className="mt-1">{error}</p>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={loading}
                  className="mt-2 underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {loading && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 text-sm text-terminal-300">
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
              Fetching historical prices and calculating strategy performance…
            </div>
          </CardBody>
        </Card>
      )}

      {!result && !loading && !error && (
        <Card>
          <CardBody>
            <div className="py-8 text-center">
              <FlaskConical className="mx-auto mb-3 h-8 w-8 text-terminal-400" />
              <h3 className="font-semibold text-terminal-100">
                Ready to test your strategy
              </h3>
              <p className="mt-2 text-sm text-terminal-300">
                Choose a stock and EMA periods, then click Run Backtest to
                load actual results from your backend.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {result && summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <Card key={metric.label} hover>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="stat-label">{metric.label}</p>
                        <p className="mt-2 break-words font-mono text-xl font-bold text-terminal-100">
                          {metric.value}
                        </p>
                      </div>
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <p className="mt-2 text-xs text-terminal-400">
                      {metric.detail}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader
              title="Strategy Equity Curve"
              subtitle={`${symbol.replace('.NS', '')} · EMA ${fast}/${slow} · Daily data`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <CardBody>
              {curve.length > 1 ? (
                <>
                  <LineChart
                    data={curve.map((point) => ({
                      date: point.date,
                      equity: point.equity,
                    }))}
                    color="#00c853"
                    fillColor="rgba(0, 200, 83, 0.08)"
                    label="Strategy equity (₹)"
                  />
                  <div className="mt-4 border-t border-terminal-700/50 pt-4">
                    <p className="mb-2 text-xs font-semibold text-terminal-300">
                      Buy & Hold Benchmark
                    </p>
                    <LineChart
                      data={curve.map((point) => ({
                        date: point.date,
                        value: point.buy_hold_equity,
                      }))}
                      color="#38bdf8"
                      fillColor="rgba(56, 189, 248, 0.06)"
                      label="Buy & hold equity (₹)"
                    />
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-terminal-400">
                  Not enough historical data to draw the chart.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Drawdown Analysis"
              subtitle="Percentage decline from the strategy's previous equity peak"
              icon={<Activity className="h-4 w-4" />}
            />
            <CardBody>
              {drawdownData.length > 1 ? (
                <DrawdownChart data={drawdownData} />
              ) : (
                <p className="py-6 text-center text-sm text-terminal-400">
                  Drawdown data is unavailable.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Backtest Details"
              subtitle="Results returned by the backend"
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <CardBody>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Detail label="Symbol" value={result.symbol} />
                <Detail label="Data date" value={result.data_date} />
                <Detail label="Strategy" value={summary.strategy} />
                <Detail label="Historical rows" value={String(summary.rows)} />
                <Detail
                  label="Fast / Slow EMA"
                  value={`${summary.ema_fast_period} / ${summary.ema_slow_period}`}
                />
                <Detail
                  label="Entries"
                  value={String(summary.entries)}
                />
                <Detail
                  label="Fee assumption"
                  value={`${summary.fee_bps_per_side_assumption} bps per side`}
                />
                <Detail
                  label="Slippage assumption"
                  value={`${summary.slippage_bps_per_side_assumption} bps per side`}
                />
                <Detail
                  label="Sharpe-like metric"
                  value={
                    summary.sharpe_like_per_bar_not_annualized == null
                      ? 'N/A'
                      : summary.sharpe_like_per_bar_not_annualized.toFixed(3)
                  }
                />
              </div>

              <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs leading-relaxed text-terminal-300">
                  <strong className="text-amber-300">Research warning:</strong>{' '}
                  {result.warning || summary.warning}
                </p>
              </div>
              <p className="mt-3 text-xs text-terminal-400">
                Historical results are not predictions of future performance.
                This page does not place live orders. Market data availability
                depends on the upstream data provider.
              </p>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-terminal-700/50 bg-terminal-800/40 p-3">
      <p className="stat-label">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-terminal-100">
        {value}
      </p>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return <BarChart3 className={className} />;
}
