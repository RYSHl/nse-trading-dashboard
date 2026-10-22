import { cn } from '../utils/cn';

type ChangeIndicatorProps = {
  value?: number;
  className?: string;
  showArrow?: boolean;
  prefix?: string;
  suffix?: string;
  unavailable?: boolean;
};

export function ChangeIndicator({
  value,
  className,
  showArrow = true,
  prefix = '',
  suffix = '',
  unavailable = false,
}: ChangeIndicatorProps) {
  if (unavailable || value === undefined || value === null || isNaN(value)) {
    return <span className={cn('text-terminal-300', className)}>--</span>;
  }

  const positive = value >= 0;
  const cls = positive ? 'text-bull' : 'text-bear';

  const arrow = showArrow ? (positive ? '\u2191' : '\u2193') : '';

  return (
    <span className={cn('tabular-nums font-medium', cls, className)}>
      {arrow} {prefix}
      {suffix === '%' ? Math.abs(value).toFixed(2) : value.toFixed(2)}
      {suffix}
    </span>
  );
}
