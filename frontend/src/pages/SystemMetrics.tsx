import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { useSystemMetricsHistory } from '../hooks/useSystemMetricsHistory';

function formatMetricTime(timestamp: string): string {
  const utcTimestamp = /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp) ? timestamp : `${timestamp}Z`;
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(utcTimestamp));
}

export function SystemMetricsPage() {
  const { data, loading, error } = useSystemMetrics();
  const { data: history, loading: historyLoading, error: historyError } = useSystemMetricsHistory(24, 2);
  const metrics = data[0];
  const chartData = history.map((item) => ({
    name: formatMetricTime(item.created_at),
    logs: item.logs_received,
    predictions: item.total_predictions,
    anomalyRate: item.anomaly_rate,
    duration: item.avg_block_duration ?? 0,
    events: item.avg_events_per_block ?? 0,
  }));

  return (
    <AppLayout title="System Metrics" subtitle="Infrastructure and pipeline telemetry overview">
      <p className="metrics-period">KPI : dernier snapshot disponible. Graphiques : dernières 24 heures, un point toutes les 2 heures.</p>
      <div className="metrics-kpi-grid">
        {loading && <p>Chargement des métriques...</p>}
        {error && <p role="alert">Impossible de charger les métriques.</p>}
        {!loading && !error && metrics && (
          <>
            <div className="kpi-tile"><span>Logs received</span><strong>{metrics.logs_received.toLocaleString()}</strong></div>
            <div className="kpi-tile"><span>Completed blocks</span><strong>{metrics.blocks_completed.toLocaleString()}</strong></div>
            <div className="kpi-tile"><span>Total predictions</span><strong>{metrics.total_predictions.toLocaleString()}</strong></div>
            <div className="kpi-tile"><span>Anomaly rate</span><strong>{metrics.anomaly_rate.toFixed(2)}%</strong></div>
            <div className="kpi-tile"><span>Average score</span><strong>{metrics.avg_score === null ? 'N/A' : metrics.avg_score.toFixed(4)}</strong></div>
            <div className="kpi-tile"><span>Average block duration</span><strong>{metrics.avg_block_duration === null ? 'N/A' : `${metrics.avg_block_duration.toFixed(2)}s`}</strong></div>
            <div className="kpi-tile"><span>Average events/block</span><strong>{metrics.avg_events_per_block === null ? 'N/A' : metrics.avg_events_per_block.toFixed(2)}</strong></div>
            <div className="kpi-tile"><span>INFO logs</span><strong>{metrics.info_logs.toLocaleString()}</strong></div>
            <div className="kpi-tile"><span>WARN logs</span><strong>{metrics.warn_logs.toLocaleString()}</strong></div>
          </>
        )}
      </div>

      <div className="dashboard-grid compact-grid">
        <section className="panel">
          <div className="panel-header"><h3>Log throughput</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="logs" stroke="#2563eb" fill="#dbeafe" strokeWidth={3} name="Logs reçus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Prediction rate</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="predictions" fill="#22c55e" radius={[8, 8, 0, 0]} name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Anomaly rate</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="anomalyRate" stroke="#f59e0b" fill="#fef3c7" strokeWidth={3} name="Taux d'anomalie (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Block duration</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="duration" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Durée moyenne (s)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Events per block</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="events" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={3} name="Événements/bloc" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      {historyLoading && <p className="metrics-period">Chargement de l'historique...</p>}
      {historyError && <p className="metrics-period" role="alert">Impossible de charger l'historique.</p>}
    </AppLayout>
  );
}
