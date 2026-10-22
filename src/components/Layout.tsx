import { useState } from 'react';
import { Activity, ScanLine, FlaskConical, BarChart3, Settings, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppContext } from '../context/AppContext';
import { StatusPill } from './Status';

export type Page = 'overview' | 'scanner' | 'strategy' | 'analytics' | 'settings';

interface LayoutProps {
  current: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-[18px] h-[18px]" /> },
  { id: 'scanner', label: 'Stock Scanner', icon: <ScanLine className="w-[18px] h-[18px]" /> },
  { id: 'strategy', label: 'Strategy Lab', icon: <FlaskConical className="w-[18px] h-[18px]" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-[18px] h-[18px]" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-[18px] h-[18px]" /> },
];

export function Layout({ current, onNavigate, children }: LayoutProps) {
  const { apiStatus } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-terminal-950 text-terminal-100">
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-terminal-900 border-r border-terminal-700/50 flex-col z-50',
          'transition-transform duration-300',
          mobileOpen ? 'flex translate-x-0' : 'hidden lg:flex -translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-terminal-700/50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-glow">
            <Activity className="w-5 h-5 text-terminal-950" />
          </div>
          <div>
            <div className="text-sm font-bold text-terminal-100 leading-tight">NSE Algo</div>
            <div className="text-[10px] text-terminal-300 uppercase tracking-widest">Research Terminal</div>
          </div>
          <button
            className="ml-auto lg:hidden text-terminal-300 hover:text-terminal-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                current === item.id
                  ? 'bg-accent/10 text-accent border border-accent/20 shadow-glow'
                  : 'text-terminal-300 hover:bg-terminal-800 hover:text-terminal-100 border border-transparent',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-terminal-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-terminal-300">API Status</span>
            <StatusPill status={apiStatus} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-terminal-800/50 border border-terminal-700/30">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] text-terminal-300 leading-tight">
              Paper Trading Only
              <br />
              No real orders placed
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-terminal-900 border-b border-terminal-700/50 sticky top-0 z-30">
          <button
            className="text-terminal-300 hover:text-terminal-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold">NSE Algo</span>
          </div>
          <StatusPill status={apiStatus} />
        </header>

        <main className="flex-1 grid-bg">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
