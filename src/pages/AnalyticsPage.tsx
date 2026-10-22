import { BarChart3, TrendingUp, Target, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { UnavailableNotice } from '../components/Status';

export function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">Analytics</h1>
        <p className="text-sm text-terminal-300 mt-1">
          Performance and risk metrics from backtested strategies. All figures require backend data.
        </p>
      </div>

      {/* Returns section */}
      <div>
        <SectionLabel icon={<TrendingUp className="w-4 h-4" />} title="Returns" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Total Return" available={false} />
          <MetricCard label="Avg. Daily Return" available={false} />
          <MetricCard label="Annualized Return" available={false} />
          <MetricCard label="Best Day" available={false} variant="green" />
        </div>
      </div>

      {/* Win rate / trade stats */}
      <div>
        <SectionLabel icon={<Target className="w-4 h-4" />} title="Trade Statistics" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Win Rate" available={false} />
          <MetricCard label="Profit Factor" available={false} />
          <MetricCard label="Avg. Win" available={false} variant="green" />
          <MetricCard label="Avg. Loss" available={false} variant="red" />
        </div>
      </div>

      {/* Risk metrics */}
      <div>
        <SectionLabel icon={<ShieldAlert className="w-4 h-4" />} title="Risk Metrics" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Max Drawdown" available={false} variant="red" />
          <MetricCard label="Sharpe Ratio" available={false} />
          <MetricCard label="Sortino Ratio" available={false} />
          <MetricCard label="Calmar Ratio" available={false} />
        </div>
      </div>

      {/* Detailed breakdown */}
      <Card>
        <CardHeader
          title="Detailed Risk Breakdown"
          subtitle="Volatility, VaR, beta, and more"
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RiskRow label="Volatility (Annualized)" />
            <RiskRow label="Value at Risk (95%)" />
            <RiskRow label="Conditional VaR (95%)" />
            <RiskRow label="Beta vs NIFTY" />
            <RiskRow label="Alpha" />
            <RiskRow label="Information Ratio" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <UnavailableNotice
            label="All analytics metrics require backtest data from the backend. Run a backtest in Strategy Lab, then return here for the full breakdown."
            className="py-8"
          />
        </CardBody>
      </Card>
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <h2 className="text-sm font-semibold text-terminal-100 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function MetricCard({
  label,
  available = true,
  variant = 'neutral',
}: {
  label: string;
  available?: boolean;
  variant?: 'green' | 'red' | 'neutral';
}) {
  const colorCls = variant === 'green' ? 'text-bull' : variant === 'red' ? 'text-bear' : 'text-terminal-100';
  return (
    <Card hover>
      <CardBody>
        <div className="stat-label mb-2">{label}</div>
        {available ? (
          <div className={`font-mono text-2xl font-semibold ${colorCls}`}>--</div>
        ) : (
          <div className="font-mono text-2xl text-terminal-300">N/A</div>
        )}
        {!available && <Badge variant="neutral" className="mt-2">Unavailable</Badge>}
      </CardBody>
    </Card>
  );
}

function RiskRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-terminal-800/40 border border-terminal-700/30">
      <span className="text-sm text-terminal-200">{label}</span>
      <span className="font-mono text-sm text-terminal-300">N/A</span>
    </div>
  );
}
