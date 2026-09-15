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
import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { PredictionBadge } from '../components/common/PredictionBadge';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { useHDFSSequences } from '../hooks/useHDFSSequences';
import { usePredictionStats } from '../hooks/usePredictionStats';

const COLORS = ['#22c55e', '#ef4444'];
const predictionPageSize = 10;

export function PredictionsPage() {
  const { data: metricsData, loading: metricsLoading, error: metricsError } = useSystemMetrics();
  const { data: predictionStats, loading: statsLoading, error: statsError } = usePredictionStats();
  const [predictionPage, setPredictionPage] = useState(1);
  const [predictionSortBy, setPredictionSortBy] = useState('completed_at');
  const [predictionSortOrder, setPredictionSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data: recentPredictions, totalPages: predictionTotalPages, loading: predictionsLoading, error: predictionsError } = useHDFSSequences(predictionPage, predictionPageSize, '', 'All', predictionSortBy, predictionSortOrder);
  const metrics = metricsData[0];
  const predictionDistribution = predictionStats
    ? [
        { name: 'NORMAL', value: predictionStats.normal_predictions },
        { name: 'ANOMALY', value: predictionStats.anomaly_predictions },
      ]
    : [];

  return (
    <AppLayout title="Predictions" subtitle="Model output monitoring and anomaly scoring">
      <p className="metrics-period">Statistiques basées sur les données réelles des prédictions HDFS.</p>
      <div className="kpi-summary-grid">
        {(metricsLoading || statsLoading) && <p>Chargement des prédictions...</p>}
        {(metricsError || statsError) && <p role="alert">Impossible de charger les prédictions.</p>}
        {!metricsLoading && !statsLoading && !metricsError && !statsError && metrics && predictionStats && (
          <>
            <div className="summary-card"><span>Total predictions</span><strong>{predictionStats.total_predictions.toLocaleString()}</strong></div>
            <div className="summary-card"><span>Normal</span><strong>{predictionStats.normal_predictions.toLocaleString()}</strong></div>
            <div className="summary-card"><span>Anomalies</span><strong>{predictionStats.anomaly_predictions.toLocaleString()}</strong></div>
            <div className="summary-card"><span>Anomaly rate</span><strong>{metrics.anomaly_rate.toFixed(2)}%</strong></div>
            <div className="summary-card"><span>Average score</span><strong>{metrics.avg_score === null ? 'N/A' : metrics.avg_score.toFixed(4)}</strong></div>
          </>
        )}
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
          <div className="prediction-legend" aria-label="Prediction color legend">
            <span><i className="prediction-legend-dot normal" /> Normal</span>
            <span><i className="prediction-legend-dot anomaly" /> Anomaly</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Score distribution</h3>
          </div>
          <div className="chart-wrap small">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={predictionStats?.score_distribution ?? []}>
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
          <div className="table-sort-controls">
            <select value={predictionSortBy} onChange={(event) => { setPredictionSortBy(event.target.value); setPredictionPage(1); }}>
              <option value="completed_at">Sort: Timestamp</option>
              <option value="score">Sort: Score</option>
              <option value="duration">Sort: Duration</option>
              <option value="block_id">Sort: Block ID</option>
            </select>
            <select value={predictionSortOrder} onChange={(event) => { setPredictionSortOrder(event.target.value as 'asc' | 'desc'); setPredictionPage(1); }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
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
              {predictionsLoading && <tr><td colSpan={5}>Loading predictions...</td></tr>}
              {predictionsError && <tr><td colSpan={5}>Unable to load predictions.</td></tr>}
              {!predictionsLoading && !predictionsError && recentPredictions.map((item) => (
                <tr key={item.id}>
                  <td>{item.completed_at ? new Date(`${item.completed_at}Z`).toLocaleString('fr-FR') : '-'}</td>
                  <td className="mono">{item.block_id}</td>
                  <td><PredictionBadge prediction={item.prediction} /></td>
                  <td>{item.score.toFixed(4)}</td>
                  <td>Model #{item.model_id}</td>
                </tr>
              ))}
              {!predictionsLoading && !predictionsError && recentPredictions.length === 0 && <tr><td colSpan={5}>No predictions found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button onClick={() => setPredictionPage((current) => Math.max(1, current - 1))} disabled={predictionPage === 1}>Previous</button>
          <span>Page {predictionPage} {predictionTotalPages > 0 ? `of ${predictionTotalPages}` : ''}</span>
          <button onClick={() => setPredictionPage((current) => current + 1)} disabled={predictionTotalPages === 0 || predictionPage >= predictionTotalPages}>Next</button>
        </div>
      </section>
    </AppLayout>
  );
}
