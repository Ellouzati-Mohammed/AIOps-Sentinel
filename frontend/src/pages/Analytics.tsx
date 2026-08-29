import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';

const detectionOverview = [
  { name: 'Mon', normal: 3200, anomaly: 90 },
  { name: 'Tue', normal: 3500, anomaly: 110 },
  { name: 'Wed', normal: 3650, anomaly: 125 },
  { name: 'Thu', normal: 3400, anomaly: 108 },
  { name: 'Fri', normal: 3820, anomaly: 136 },
  { name: 'Sat', normal: 4050, anomaly: 145 },
  { name: 'Sun', normal: 3990, anomaly: 142 },
];

const logActivity = [
  { name: '00:00', value: 850 },
  { name: '04:00', value: 920 },
  { name: '08:00', value: 1180 },
  { name: '12:00', value: 1260 },
  { name: '16:00', value: 1340 },
  { name: '20:00', value: 1210 },
];

const blockBehavior = [
  { name: '0-3s', value: 42 },
  { name: '3-6s', value: 31 },
  { name: '6-9s', value: 18 },
  { name: '9s+', value: 9 },
];

const modelActivity = [
  { name: 'BiLSTM-HDFS', value: 18492 },
  { name: 'IsolationForest', value: 4250 },
  { name: 'XGBoost', value: 1680 },
];

const COLORS = ['#2563eb', '#22c55e', '#f59e0b'];

export function AnalyticsPage() {
  return (
    <AppLayout title="Analytics" subtitle="Behavioral analysis and detection trends">
      <div className="dashboard-grid compact-grid">
        <section className="panel">
          <div className="panel-header"><h3>Detection overview</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={detectionOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="normal" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
                <Area type="monotone" dataKey="anomaly" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Processing performance</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={detectionOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="anomaly" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Log activity</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={logActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Block behavior</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={blockBehavior} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {blockBehavior.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header"><h3>Model activity</h3></div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={modelActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
