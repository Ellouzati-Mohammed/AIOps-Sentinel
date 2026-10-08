import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/Dashboard';
import { LiveLogsPage } from './pages/LiveLogs';
import { BlocksPage } from './pages/Blocks';
import { PredictionsPage } from './pages/Predictions';
import { AnomaliesPage } from './pages/Anomalies';
import { ModelsPage } from './pages/Models';
import { TemplatesPage } from './pages/Templates';
import { SystemMetricsPage } from './pages/SystemMetrics';
import { SettingsPage } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/logs" element={<LiveLogsPage />} />
        <Route path="/blocks" element={<BlocksPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/system-metrics" element={<SystemMetricsPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/anomalies" element={<AnomaliesPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
