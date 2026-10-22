// Simple dependency-free chart components for equity curve and drawdown.
// Uses inline SVG so no external chart library is needed.

interface LineChartProps {
  data: { date?: string; equity?: number; value?: number }[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  className?: string;
  label?: string;
}

export function LineChart({
  data,
  width = 800,
  height = 200,
  color = '#00c853',
  fillColor = 'rgba(0, 200, 83, 0.06)',
  className,
  label,
}: LineChartProps) {
  const values = data.map((d) => (d.equity ?? d.value ?? 0)).filter((v) => typeof v === 'number' && !isNaN(v));
  if (values.length < 2) {
    return null;
  }

  const padding = { top: 16, right: 16, bottom: 28, left: 52 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * innerW;
    const y = padding.top + innerH - ((v - min) / range) * innerH;
    return [x, y] as [number, number];
  });

  const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${padding.left + innerW},${padding.top + innerH} L${padding.left},${padding.top + innerH} Z`;

  // Y-axis ticks
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = min + (range * i) / tickCount;
    const y = padding.top + innerH - (i / tickCount) * innerH;
    return { val, y };
  });

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={t.y}
            x2={padding.left + innerW}
            y2={t.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
          <text x={padding.left - 8} y={t.y + 4} textAnchor="end" className="fill-terminal-300" style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
            {formatNum(t.val)}
          </text>
        </g>
      ))}
      <path d={areaD} fill={fillColor} />
      <path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {label && (
        <text x={padding.left} y={14} className="fill-terminal-200" style={{ fontSize: 11, fontWeight: 600 }}>
          {label}
        </text>
      )}
    </svg>
  );
}

interface DrawdownChartProps {
  data: { date?: string; drawdown?: number }[];
  width?: number;
  height?: number;
  className?: string;
}

export function DrawdownChart({ data, width = 800, height = 160, className }: DrawdownChartProps) {
  const values = data.map((d) => d.drawdown ?? 0).filter((v) => typeof v === 'number' && !isNaN(v));
  if (values.length < 2) return null;

  const padding = { top: 16, right: 16, bottom: 28, left: 52 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const min = Math.min(...values, 0);
  const max = 0;
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * innerW;
    const y = padding.top + ((max - v) / range) * innerH;
    return [x, y] as [number, number];
  });

  const pathD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${padding.left + innerW},${padding.top} L${padding.left},${padding.top} Z`;

  const tickCount = 3;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = max - (range * i) / tickCount;
    const y = padding.top + (i / tickCount) * innerH;
    return { val, y };
  });

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padding.left} y1={t.y} x2={padding.left + innerW} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={padding.left - 8} y={t.y + 4} textAnchor="end" className="fill-terminal-300" style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
            {t.val.toFixed(1)}%
          </text>
        </g>
      ))}
      <path d={areaD} fill="rgba(255, 59, 48, 0.08)" />
      <path d={pathD} stroke="#ff3b30" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(0);
}
