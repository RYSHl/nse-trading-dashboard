import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout, type Page } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { ScannerPage } from './pages/ScannerPage';
import { StrategyPage } from './pages/StrategyPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [page, setPage] = useState<Page>('overview');

  return (
    <AppProvider>
      <Layout current={page} onNavigate={setPage}>
        {page === 'overview' && <OverviewPage />}
        {page === 'scanner' && <ScannerPage />}
        {page === 'strategy' && <StrategyPage />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'settings' && <SettingsPage />}
      </Layout>
    </AppProvider>
  );
}

export default App;
