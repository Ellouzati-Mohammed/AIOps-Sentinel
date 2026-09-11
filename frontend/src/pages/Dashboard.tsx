import {
  Activity,
  AlertTriangle,
  Blocks,
  Cpu,
  Database,
  FileText,
} from 'lucide-react';
import { useSystemMetrics } from "../hooks/useSystemMetrics";
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
import { predictionSeries, throughputData, anomalyRateData, processingPerformanceData, recentAnomalies } from '../mock/dashboard';
import { AppLayout } from '../components/layout/AppLayout';

export function DashboardPage() {
  const { data, loading, error } = useSystemMetrics();
  const metrics = data[0];
  return (
    <AppLayout title="Dashboard" subtitle="Monitoring & anomaly detection overview">
      <div className="metrics-grid">
       {metrics && (
        <>
          <MetricCard
            title="Logs Received"
            value={metrics.logs_received}
            icon={<FileText size={16} />}
          />

          

          <MetricCard
            title="Completed Blocks"
            value={metrics.blocks_completed}
            icon={<Database size={16} />}
          />

          <MetricCard
            title="Anomalies Detected"
            value={metrics.anomaly_predictions}
            icon={<AlertTriangle size={16} />}
          />

          <MetricCard
            title="Anomaly Rate"
            value={`${metrics.anomaly_rate.toFixed(2)}%`}
            icon={<Cpu size={16} />}
          />
        </>
      )}
      </div>

      <div className="dashboard-grid">
        <ChartCard title="Log ingestion rate" subtitle="Logs / minute">
          <div className="chart-wrap large">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={throughputData}>
                <defs>
                  <linearGradient id="ingestionFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#ingestionFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Predictions" subtitle="Normal vs anomaly over 24h">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={predictionSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} name="Normal" />
                <Line type="monotone" dataKey="secondary" stroke="#ef4444" strokeWidth={3} name="Anomaly" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Anomaly rate over time">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={anomalyRateData}>
                <defs>
                  <linearGradient id="anomalyFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fill="url(#anomalyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Average block processing time">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={230}>
              <LineChartMini data={processingPerformanceData} />
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

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
              {recentAnomalies.map((row) => (
                <tr key={row.blockId}>
                  <td className="mono">{row.blockId}</td>
                  <td><PredictionBadge prediction={row.prediction} /></td>
                  <td>{row.score.toFixed(2)}</td>
                  <td>{row.events}</td>
                  <td>{row.duration}</td>
                  <td>{row.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
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
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#miniChart)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
