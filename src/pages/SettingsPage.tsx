import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, RefreshCw, Save, Wifi, WifiOff } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/Card';
import { StatusPill } from '../components/Status';
import { useAppContext } from '../context/AppContext';
import { getDefaultApiBaseUrl, getDefaultRefreshInterval } from '../lib/config';

export function SettingsPage() {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    apiStatus,
    apiError,
    lastChecked,
    testConnection,
    refreshInterval,
    setRefreshInterval,
    autoRefresh,
    setAutoRefresh,
  } = useAppContext();

  const [urlInput, setUrlInput] = useState(apiBaseUrl);
  const [intervalInput, setIntervalInput] = useState(refreshInterval);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setUrlInput(apiBaseUrl);
  }, [apiBaseUrl]);

  useEffect(() => {
    setIntervalInput(refreshInterval);
  }, [refreshInterval]);

  const handleSave = () => {
    setApiBaseUrl(urlInput);
    setRefreshInterval(intervalInput);
    setSavedMsg('Settings saved.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleReset = () => {
    setUrlInput(getDefaultApiBaseUrl());
    setIntervalInput(getDefaultRefreshInterval());
    setApiBaseUrl(getDefaultApiBaseUrl());
    setRefreshInterval(getDefaultRefreshInterval());
    setSavedMsg('Reset to defaults.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-terminal-100">Settings</h1>
        <p className="text-sm text-terminal-300 mt-1">
          Configure API connection and data refresh settings.
        </p>
      </div>

      {/* API Connection */}
      <Card>
        <CardHeader
          title="API Connection"
          subtitle="FastAPI backend endpoint"
          icon={<Server className="w-4 h-4" />}
          action={<StatusPill status={apiStatus} />}
        />
        <CardBody className="space-y-4">
          <div>
            <label className="stat-label block mb-2">API Base URL</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-backend.onrender.com"
              className="w-full px-4 py-2.5 bg-terminal-800 border border-terminal-700 rounded-lg text-sm font-mono text-terminal-100 placeholder-terminal-400 focus:outline-none focus:border-accent/50 focus:shadow-glow transition-all"
            />
            <p className="text-xs text-terminal-300 mt-2">
              Default: {getDefaultApiBaseUrl()}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={testConnection}
              disabled={apiStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent/20 transition-all disabled:opacity-50"
            >
              <Wifi className="w-4 h-4" />
              Test Connection
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-bull/10 text-bull border border-bull/30 rounded-lg text-sm font-medium hover:bg-bull/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-terminal-300 border border-terminal-700 rounded-lg text-sm font-medium hover:bg-terminal-800 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            {savedMsg && (
              <span className="text-xs text-bull">{savedMsg}</span>
            )}
          </div>

          {/* Connection details */}
          <div className="rounded-lg bg-terminal-800/40 border border-terminal-700/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-300">Status</span>
              <div className="flex items-center gap-2">
                {apiStatus === 'connected' ? (
                  <Wifi className="w-4 h-4 text-bull" />
                ) : apiStatus === 'error' ? (
                  <WifiOff className="w-4 h-4 text-bear" />
                ) : null}
                <span className={apiStatus === 'connected' ? 'text-bull' : apiStatus === 'error' ? 'text-bear' : 'text-terminal-200'}>
                  {apiStatus === 'connected' ? 'Online' : apiStatus === 'loading' ? 'Checking&hellip;' : apiStatus === 'error' ? 'Offline' : 'Not checked'}
                </span>
              </div>
            </div>
            {lastChecked && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-terminal-300">Last checked</span>
                <span className="font-mono text-terminal-200 text-xs">
                  {lastChecked.toLocaleTimeString()}
                </span>
              </div>
            )}
            {apiError && (
              <div className="text-sm text-bear pt-2 border-t border-terminal-700/30">
                {apiError}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Refresh settings */}
      <Card>
        <CardHeader
          title="Refresh Settings"
          subtitle="Automatic data refresh interval"
          icon={<RefreshCw className="w-4 h-4" />}
        />
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-terminal-100">Auto-refresh</div>
              <div className="text-xs text-terminal-300 mt-0.5">Periodically re-fetch data from the backend</div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative w-12 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-bull/30' : 'bg-terminal-600'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${autoRefresh ? 'translate-x-6 bg-bull' : 'translate-x-0.5 bg-terminal-300'}`}
              />
            </button>
          </div>

          <div>
            <label className="stat-label block mb-2">
              Refresh Interval: {intervalInput}s
            </label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={intervalInput}
              onChange={(e) => setIntervalInput(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-terminal-300 mt-1">
              <span>5s</span>
              <span>Default: {getDefaultRefreshInterval()}s</span>
              <span>120s</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* About / Disclaimer */}
      <Card>
        <CardHeader title="About" subtitle="Research and paper-trading only" icon={<SettingsIcon className="w-4 h-4" />} />
        <CardBody>
          <div className="space-y-2 text-sm text-terminal-300">
            <p>
              This dashboard is a research and paper-trading terminal for NSE equity strategies.
              It connects to a FastAPI backend to fetch market data and run backtests.
            </p>
            <p className="text-warning">
              No real trades are placed. This tool does not request broker credentials or connect to any trading account.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
