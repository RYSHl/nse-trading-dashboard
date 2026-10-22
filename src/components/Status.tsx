import { Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';

type StatusType = 'idle' | 'loading' | 'connected' | 'error';

interface StatusPillProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { icon: React.ReactNode; cls: string; defaultLabel: string }> = {
  idle: {
    icon: null,
    cls: 'bg-terminal-700/50 text-terminal-300 border-terminal-600',
    defaultLabel: 'Idle',
  },
  loading: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    cls: 'bg-warning/10 text-warning border-warning/30',
    defaultLabel: 'Connecting\u2026',
  },
  connected: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    cls: 'bg-bull/10 text-bull border-bull/30',
    defaultLabel: 'Connected',
  },
  error: {
    icon: <AlertTriangle className="w-3 h-3" />,
    cls: 'bg-bear/10 text-bear border-bear/30',
    defaultLabel: 'Error',
  },
};

export function StatusPill({ status, label, className }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        config.cls,
        className,
      )}
    >
      {config.icon}
      {label ?? config.defaultLabel}
    </span>
  );
}

export function ErrorBlock({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <XCircle className="w-8 h-8 text-bear" />
      <p className="text-sm text-terminal-200 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function LoadingBlock({ message = 'Loading\u2026', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
      <p className="text-sm text-terminal-300">{message}</p>
    </div>
  );
}

export function UnavailableNotice({ label = 'Data unavailable', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-12 text-center', className)}>
      <AlertTriangle className="w-7 h-7 text-warning/60" />
      <p className="text-sm text-terminal-300">{label}</p>
    </div>
  );
}
