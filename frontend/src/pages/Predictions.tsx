import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { anomalyPredictions, averagePredictionScore, normalPredictions, predictionDistribution, recentPredictions, totalPredictions, scoreDistribution } from '../mock/predictions';
import { PredictionBadge } from '../components/common/PredictionBadge';

const COLORS = ['#22c55e', '#ef4444'];

export function PredictionsPage() {
  return (
    <AppLayout title="Predictions" subtitle="Model output monitoring and anomaly scoring">
      <div className="kpi-summary-grid">
        <div className="summary-card">
          <span>Total predictions</span>
          <strong>{totalPredictions.toLocaleString()}</strong>
        </div>
        <div className="summary-card">
          <span>Normal</span>
          <strong>{normalPredictions.toLocaleString()}</strong>
        </div>
        <div className="summary-card">
          <span>Anomalies</span>
          <strong>{anomalyPredictions.toLocaleString()}</strong>
        </div>
        <div className="summary-card">
          <span>Anomaly rate</span>
          <strong>1.77%</strong>
        </div>
        <div className="summary-card">
          <span>Average score</span>
          <strong>{averagePredictionScore.toFixed(2)}</strong>
        </div>
      </div>

      <div className="dashboard-grid compact-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Prediction distribution</h3>
          </div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={predictionDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {predictionDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Score distribution</h3>
          </div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Recent predictions</h3>
        </div>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Block ID</th>
                <th>Prediction</th>
                <th>Score</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {recentPredictions.map((item) => (
                <tr key={`${item.blockId}-${item.timestamp}`}>
                  <td>{item.timestamp}</td>
                  <td className="mono">{item.blockId}</td>
                  <td><PredictionBadge prediction={item.prediction} /></td>
                  <td>{item.score.toFixed(2)}</td>
                  <td>{item.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
