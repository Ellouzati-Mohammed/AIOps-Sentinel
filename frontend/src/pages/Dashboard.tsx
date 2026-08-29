import {
  Activity,
  AlertTriangle,
  Blocks,
  Cpu,
  Database,
  FileText,
} from 'lucide-react';
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
import { StatusBadge } from '../components/common/StatusBadge';
import { dashboardMetrics, predictionSeries, throughputData, anomalyRateData, processingPerformanceData, recentAnomalies, systemHealth } from '../mock/dashboard';
import { AppLayout } from '../components/layout/AppLayout';

export function DashboardPage() {
  return (
    <AppLayout title="Dashboard" subtitle="Monitoring & anomaly detection overview">
      <div className="metrics-grid">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            delta={metric.delta}
            deltaPositive={metric.deltaPositive}
            icon={
              metric.title === 'Logs Received' ? <FileText size={16} /> :
              metric.title === 'Logs Processed' ? <Activity size={16} /> :
              metric.title === 'Active Blocks' ? <Blocks size={16} /> :
              metric.title === 'Completed Blocks' ? <Database size={16} /> :
              metric.title === 'Anomalies Detected' ? <AlertTriangle size={16} /> :
              <Cpu size={16} />
            }
            sparkline={metric.sparkline}
          />
        ))}
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

      <div className="lower-grid">
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
                  <th>Detected</th>
                  <th>Status</th>
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
                    <td>{row.detected}</td>
                    <td><StatusBadge status={row.status as 'Detected'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel health-panel">
          <div className="panel-header">
            <h3>System health</h3>
          </div>
          <div className="health-list">
            {systemHealth.map((item) => (
              <div key={item.name} className="health-row">
                <div className="health-name">{item.name}</div>
                <div className="health-status">
                  <span className="status-dot success" />
                  <span>{item.status}</span>
                  {item.value && <small>{item.value}</small>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
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
