// Shared TypeScript types for the NSE Algo Trading dashboard

export type ApiStatus = 'idle' | 'loading' | 'connected' | 'error';

export interface HealthResponse {
  status?: string;
  [key: string]: unknown;
}

export interface WatchlistSymbol {
  symbol: string;
  name?: string;
  sector?: string;
}

export interface WatchlistResponse {
  symbols?: string[];
  watchlist?: string[];
  [key: string]: unknown;
}

export interface ScannerResult {
  symbol: string;
  price?: number | null;
  change_percent?: number | null;
  sma20?: number | null;
  sma50?: number | null;
  rsi14?: number | null;
  signal?: string | null;
  data_date?: string | null;
  [key: string]: unknown;
}

export interface ScannerResponse {
  count?: number;
  source?: string;
  data_type?: string;
  results?: ScannerResult[];
  [key: string]: unknown;
}

export interface MarketSummary {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  available: boolean;
}

export interface Signal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  strategy: string;
  price?: number;
  timestamp?: string;
  confidence?: number;
  available: boolean;
}

export interface BacktestResult {
  available: boolean;
  totalReturn?: number;
  winRate?: number;
  maxDrawdown?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  profitFactor?: number;
  avgWin?: number;
  avgLoss?: number;
  equityCurve?: { date: string; equity: number }[];
  drawdownCurve?: { date: string; drawdown: number }[];
  trades?: Trade[];
}

export interface Trade {
  entryDate?: string;
  exitDate?: string;
  entryPrice?: number;
  exitPrice?: number;
  type?: 'LONG' | 'SHORT';
  pnl?: number;
  pnlPercent?: number;
  returnPercent?: number;
  bars?: number;
}

export interface PortfolioHolding {
  symbol: string;
  quantity?: number;
  avgPrice?: number;
  currentPrice?: number;
  value?: number;
  pnl?: number;
  pnlPercent?: number;
  available: boolean;
}

export interface RiskMetrics {
  available: boolean;
  sharpeRatio?: number;
  sortinoRatio?: number;
  maxDrawdown?: number;
  volatility?: number;
  beta?: number;
  alpha?: number;
  var95?: number;
  cvar95?: number;
  calmarRatio?: number;
  avgReturn?: number;
  totalReturn?: number;
  winRate?: number;
}
