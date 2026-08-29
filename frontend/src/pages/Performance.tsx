import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';

const performanceData = [
  { name: '00:00', api: 42, logs: 76, blocks: 140, prediction: 18, elastic: 85 },
  { name: '04:00', api: 48, logs: 80, blocks: 155, prediction: 21, elastic: 88 },
  { name: '08:00', api: 45, logs: 78, blocks: 148, prediction: 19, elastic: 82 },
  { name: '12:00', api: 52, logs: 86, blocks: 150, prediction: 20, elastic: 90 },
  { name: '16:00', api: 50, logs: 84, blocks: 162, prediction: 21, elastic: 95 },
  { name: '20:00', api: 46, logs: 79, blocks: 151, prediction: 18, elastic: 87 },
];

export function PerformancePage() {
  return (
    <AppLayout title="Performance" subtitle="System latency and technical monitoring">
      <div className="kpi-summary-grid compact">
        <div className="summary-card">
          <span>API latency</span>
          <strong>42 ms</strong>
        </div>
        <div className="summary-card">
          <span>Prediction latency</span>
          <strong>18 ms</strong>
        </div>
        <div className="summary-card">
          <span>Log processing</span>
          <strong>76 ms</strong>
        </div>
      </div>

      <div className="dashboard-grid compact-grid">
        <section className="panel">
          <div className="panel-header"><h3>API latency</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="api" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Log processing latency</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="logs" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Block processing duration</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="blocks" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Prediction latency</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="prediction" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
