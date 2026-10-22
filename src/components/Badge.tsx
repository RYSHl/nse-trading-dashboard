import { cn } from '../utils/cn';

type BadgeVariant = 'green' | 'red' | 'neutral' | 'blue' | 'warning' | 'gold';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-bull/10 text-bull border-bull/30',
  red: 'bg-bear/10 text-bear border-bear/30',
  neutral: 'bg-terminal-700/50 text-terminal-200 border-terminal-600/50',
  blue: 'bg-accent/10 text-accent border-accent/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  gold: 'bg-gold/10 text-gold border-gold/30',
};

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border tabular-nums',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
