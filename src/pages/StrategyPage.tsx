import { useState } from 'react';
import { FlaskConical, Play, GitCommitHorizontal } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { LineChart, DrawdownChart } from '../components/Charts';
import { UnavailableNotice, LoadingBlock } from '../components/Status';
import { cn } from '../utils/cn';

type Period = '1M' | '3M' | '6M' | '1Y';

export function StrategyPage() {
  const [period, setPeriod] = useState<Period>('3M');
  const [running, setRunning] = useState(false);
  const [shortEMA, setShortEMA] = useState(20);
  const [longEMA, setLongEMA] = useState(50);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">Strategy Lab</h1>
        <p className="text-sm text-terminal-300 mt-1">
          EMA crossover strategy backtesting and analysis. Research only — no live orders.
        </p>
      </div>

      {/* Strategy config */}
      <Card>
        <CardHeader
          title="EMA Crossover Strategy"
          subtitle="Exponential Moving Average 20/50 crossover on daily candles"
          icon={<FlaskConical className="w-4 h-4" />}
        />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="stat-label block mb-2">Short EMA</label>
              <input
                type="number"
                value={shortEMA}
                onChange={(e) => setShortEMA(Number(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-terminal-800 border border-terminal-700 rounded-lg text-sm font-mono text-terminal-100 focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="stat-label block mb-2">Long EMA</label>
              <input
                type="number"
                value={longEMA}
                onChange={(e) => setLongEMA(Number(e.target.value) || 50)}
                className="w-full px-3 py-2 bg-terminal-800 border border-terminal-700 rounded-lg text-sm font-mono text-terminal-100 focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="stat-label block mb-2">Backtest Period</label>
              <div className="flex gap-1">
                {(['1M', '3M', '6M', '1Y'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                      period === p
                        ? 'bg-accent/10 text-accent border-accent/30'
                        : 'bg-terminal-800 text-terminal-300 border-terminal-700 hover:border-terminal-600',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRun}
                disabled={running}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent/20 transition-all disabled:opacity-50"
              >
                {running ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    Running&hellip;
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Backtest
                  </>
                )}
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Backtest results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Return" value="--" available={false} variant="green" />
        <MetricCard label="Win Rate" value="--" available={false} />
        <MetricCard label="Max Drawdown" value="--" available={false} variant="red" />
        <MetricCard label="Total Trades" value="--" available={false} />
      </div>

      {/* Equity curve */}
      <Card>
        <CardHeader
          title="Equity Curve"
          subtitle="Cumulative returns over the backtest period"
          icon={<GitCommitHorizontal className="w-4 h-4" />}
        />
        <CardBody>
          {running ? (
            <LoadingBlock message="Running backtest&hellip;" />
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <UnavailableNotice
                label="Backtest results are not available. Connect the backend and run a backtest to generate the equity curve."
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Drawdown */}
      <Card>
        <CardHeader
          title="Drawdown Chart"
          subtitle="Peak-to-trough decline percentage"
        />
        <CardBody>
          <div className="flex flex-col items-center justify-center py-8">
            <UnavailableNotice label="No drawdown data available. Run a backtest to populate this chart." />
          </div>
        </CardBody>
      </Card>

      {/* Trade history */}
      <Card>
        <CardHeader title="Trade History" subtitle="Individual trade records from the backtest" />
        <CardBody className="p-0">
          <div className="px-5 py-12">
            <UnavailableNotice label="No trades to display. Run a backtest to generate trade history." />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  available = true,
  variant = 'neutral',
}: {
  label: string;
  value: string;
  available?: boolean;
  variant?: 'green' | 'red' | 'neutral';
}) {
  const colorCls = variant === 'green' ? 'text-bull' : variant === 'red' ? 'text-bear' : 'text-terminal-100';
  return (
    <Card hover>
      <CardBody>
        <div className="stat-label mb-2">{label}</div>
        {available ? (
          <div className={cn('stat-value', colorCls)}>{value}</div>
        ) : (
          <div className="font-mono text-2xl text-terminal-300">N/A</div>
        )}
        {!available && (
          <Badge variant="neutral" className="mt-2">Unavailable</Badge>
        )}
      </CardBody>
    </Card>
  );
}
