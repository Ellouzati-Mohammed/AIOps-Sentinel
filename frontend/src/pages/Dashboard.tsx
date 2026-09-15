import {
  Activity,
  AlertTriangle,
  Blocks,
  BarChart3,
  Cpu,
  Database,
  FileText,
  Gauge,
  ListChecks,
  MessageSquareWarning,
  Timer,
  Clock3,
} from 'lucide-react';
import { useSystemMetrics } from "../hooks/useSystemMetrics";
import { useSystemMetricsHistory } from "../hooks/useSystemMetricsHistory";
import { useRecentAnomalies } from "../hooks/useRecentAnomalies";
import { getAggregatedSystemMetrics, type AggregatedSystemMetrics } from "../api/systemMetrics.api";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '../components/common/ChartCard';
import { MetricCard } from '../components/common/MetricCard';
import { PredictionBadge } from '../components/common/PredictionBadge';
import { AppLayout } from '../components/layout/AppLayout';

function formatMetricTime(timestamp: string): string {
  const utcTimestamp = /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp)
    ? timestamp
    : `${timestamp}Z`;
  const date = new Date(utcTimestamp);

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date).replace(',', '');
}

function getTodayDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

export function DashboardPage() {
  const { data, loading, error } = useSystemMetrics();
  const [selectedDate, setSelectedDate] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [aggregateMetrics, setAggregateMetrics] = useState<AggregatedSystemMetrics | null>(null);
  const [aggregateLoading, setAggregateLoading] = useState(true);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [logsDateInput, setLogsDateInput] = useState(getTodayDate);
  const [logsDate, setLogsDate] = useState('');
  const [predictionsDateInput, setPredictionsDateInput] = useState(getTodayDate);
  const [predictionsDate, setPredictionsDate] = useState('');
  const [anomalyDateInput, setAnomalyDateInput] = useState(getTodayDate);
  const [anomalyDate, setAnomalyDate] = useState('');
  const [durationDateInput, setDurationDateInput] = useState(getTodayDate);
  const [durationDate, setDurationDate] = useState('');
  const logsHistory = useSystemMetricsHistory(24, 2, logsDate || undefined);
  const predictionsHistory = useSystemMetricsHistory(24, 2, predictionsDate || undefined);
  const anomalyHistory = useSystemMetricsHistory(24, 2, anomalyDate || undefined);
  const durationHistory = useSystemMetricsHistory(24, 2, durationDate || undefined);
  const { data: recentAnomalies, loading: anomaliesLoading, error: anomaliesError } = useRecentAnomalies(24, 5);
  useEffect(() => {
    getAggregatedSystemMetrics(appliedDate || undefined)
      .then((result) => {
        setAggregateMetrics(result);
        setAggregateError(null);
      })
      .catch((err) => setAggregateError(err instanceof Error ? err.message : 'Impossible de charger les KPI'))
      .finally(() => setAggregateLoading(false));
  }, [appliedDate]);

  const metrics = aggregateMetrics ?? data[0];
  const logsChartData = logsHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    logs: item.logs_received,
  }));
  const predictionsChartData = predictionsHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    normal: item.normal_predictions,
    anomaly: item.anomaly_predictions,
  }));
  const anomalyChartData = anomalyHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    anomalyRate: item.anomaly_rate,
  }));
  const durationChartData = durationHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    duration: item.avg_block_duration ?? 0,
  }));
  return (
    <AppLayout title="Dashboard" subtitle="Monitoring & anomaly detection overview">
      <section className="dashboard-section kpi-section">
        <div className="section-period-banner">
          <div className="section-period-icon"><Clock3 size={18} /></div>
          <div>
            <p className="section-period-eyebrow">Live snapshot</p>
            <h2>Key Performance Indicators</h2>
            <p>{appliedDate ? `Somme de la journée ${appliedDate}.` : 'Somme de toutes les métriques disponibles.'}</p>
          </div>
          <div className="kpi-date-control">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Choisir une date pour les KPI"
            />
            <button type="button" className="primary-button" onClick={() => setAppliedDate(selectedDate)}>
              Appliquer
            </button>
          </div>
          <span className="section-period-badge">{appliedDate || 'Toutes les dates'}</span>
        </div>

        <div className="metrics-grid">
          {(loading || aggregateLoading) && <p>Chargement des KPI...</p>}
          {(error || aggregateError) && <p role="alert">Impossible de charger les KPI.</p>}
          {!loading && !aggregateLoading && !error && !aggregateError && metrics && (
          <>
          <MetricCard
            title="Logs Received"
            value={metrics.logs_received.toLocaleString()}
            icon={<FileText size={16} />}
          />

          <MetricCard
            title="Completed Blocks"
            value={metrics.blocks_completed.toLocaleString()}
            icon={<Database size={16} />}
          />

          <MetricCard
            title="Anomalies Detected"
            value={metrics.anomaly_predictions.toLocaleString()}
            icon={<AlertTriangle size={16} />}
          />

          <MetricCard
            title="Anomaly Rate"
            value={`${metrics.anomaly_rate.toFixed(2)}%`}
            icon={<Cpu size={16} />}
          />

          <MetricCard
            title="Normal Predictions"
            value={metrics.normal_predictions.toLocaleString()}
            icon={<Activity size={16} />}
          />

          <MetricCard
            title="Total Predictions"
            value={metrics.total_predictions.toLocaleString()}
            icon={<ListChecks size={16} />}
          />

          <MetricCard
            title="Average Score"
            value={metrics.avg_score === null ? 'N/A' : metrics.avg_score.toFixed(2)}
            icon={<Gauge size={16} />}
          />

          <MetricCard
            title="Avg Block Duration"
            value={metrics.avg_block_duration === null ? 'N/A' : `${metrics.avg_block_duration.toFixed(2)} s`}
            icon={<Timer size={16} />}
          />

          <MetricCard
            title="Avg Events / Block"
            value={metrics.avg_events_per_block === null ? 'N/A' : metrics.avg_events_per_block.toFixed(1)}
            icon={<Blocks size={16} />}
          />

          <MetricCard
            title="Warning Logs"
            value={metrics.warn_logs.toLocaleString()}
            icon={<MessageSquareWarning size={16} />}
          />
          </>
        )}
        </div>
      </section>

      <section className="dashboard-section charts-section">
        <div className="section-period-banner">
          <div className="section-period-icon charts-icon"><BarChart3 size={18} /></div>
          <div>
            <p className="section-period-eyebrow">Historical trends</p>
            <h2>System Metrics Over Time</h2>
            <p>Chaque graphique peut afficher les dernières 24 heures ou une journée précise.</p>
          </div>
          <span className="section-period-badge charts-badge">Dates indépendantes</span>
        </div>

        <div className="dashboard-grid">
        <ChartCard title="Log ingestion rate" subtitle="Logs / minute" actions={<ChartDateControl value={logsDateInput} onChange={(date) => { setLogsDateInput(date); setLogsDate(date); }} />}>
          <div className="chart-wrap large">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={logsChartData}>
                <defs>
                  <linearGradient id="ingestionFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" interval={0} minTickGap={0} height={42} tickMargin={2} angle={-30} textAnchor="end" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="logs" stroke="#2563eb" strokeWidth={3} fill="url(#ingestionFill)" name="Logs reçus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Predictions" subtitle="Normal vs anomaly over 24h" actions={<ChartDateControl value={predictionsDateInput} onChange={(date) => { setPredictionsDateInput(date); setPredictionsDate(date); }} />}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={predictionsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" interval={0} minTickGap={0} height={42} tickMargin={2} angle={-30} textAnchor="end" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="normal" stroke="#22c55e" strokeWidth={3} name="Normal" />
                <Line type="monotone" dataKey="anomaly" stroke="#ef4444" strokeWidth={3} name="Anomaly" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Anomaly rate over time" actions={<ChartDateControl value={anomalyDateInput} onChange={(date) => { setAnomalyDateInput(date); setAnomalyDate(date); }} />}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={anomalyChartData}>
                <defs>
                  <linearGradient id="anomalyFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" interval={0} minTickGap={0} height={42} tickMargin={2} angle={-30} textAnchor="end" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="anomalyRate" stroke="#f59e0b" strokeWidth={3} fill="url(#anomalyFill)" name="Taux d'anomalie (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Average block processing time" actions={<ChartDateControl value={durationDateInput} onChange={(date) => { setDurationDateInput(date); setDurationDate(date); }} />}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={230}>
              <LineChartMini data={durationChartData.map(({ name, duration }) => ({ name, value: duration }))} />
            </ResponsiveContainer>
          </div>
        </ChartCard>
        </div>

        {(logsHistory.loading || predictionsHistory.loading || anomalyHistory.loading || durationHistory.loading) && <p className="metrics-period">Chargement de l’historique des graphiques...</p>}
        {(logsHistory.error || predictionsHistory.error || anomalyHistory.error || durationHistory.error) && <p className="metrics-period" role="alert">Impossible de charger les données des graphiques.</p>}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent anomalies</h3>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Block ID</th>
                <th>Prediction</th>
                <th>Score</th>
                <th>Events</th>
                <th>Duration</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {anomaliesLoading && <tr><td colSpan={6}>Chargement des anomalies...</td></tr>}
              {anomaliesError && <tr><td colSpan={6}>Impossible de charger les anomalies.</td></tr>}
              {!anomaliesLoading && !anomaliesError && recentAnomalies.map((row) => (
                <tr key={row.id}>
                  <td className="mono">{row.block_id}</td>
                  <td><PredictionBadge prediction={row.prediction} /></td>
                  <td>{row.score.toFixed(2)}</td>
                  <td>{row.num_events}</td>
                  <td>{row.duration.toFixed(2)}s</td>
                  <td>Model #{row.model_id}</td>
                </tr>
              ))}
              {!anomaliesLoading && !anomaliesError && recentAnomalies.length === 0 && (
                <tr><td colSpan={6}>Aucune anomalie récente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

function ChartDateControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="chart-date-control" title="Choisir la date du graphique">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Choisir la date de ce graphique"
      />
    </label>
  );
}

function LineChartMini({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="miniChart" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="name" interval={0} minTickGap={0} height={42} tickMargin={2} angle={-30} textAnchor="end" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#miniChart)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
