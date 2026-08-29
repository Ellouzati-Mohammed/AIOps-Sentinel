import { Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { anomalies, averageAnomalyScore, highConfidenceAnomalies, latestAnomaly, totalAnomalies } from '../mock/anomalies';

export function AnomaliesPage() {
  return (
    <AppLayout title="Detected anomalies" subtitle="High-risk blocks and suspicious event patterns">
      <div className="kpi-summary-grid">
        <div className="summary-card">
          <span>Total anomalies</span>
          <strong>{totalAnomalies}</strong>
        </div>
        <div className="summary-card">
          <span>High confidence</span>
          <strong>{highConfidenceAnomalies}</strong>
        </div>
        <div className="summary-card">
          <span>Average score</span>
          <strong>{averageAnomalyScore.toFixed(2)}</strong>
        </div>
        <div className="summary-card">
          <span>Latest anomaly</span>
          <strong>{latestAnomaly}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="toolbar no-wrap">
          <label className="search-input compact wide">
            <Search size={14} />
            <input placeholder="Search anomaly block..." />
          </label>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Block</th>
                <th>Score</th>
                <th>Events</th>
                <th>Duration</th>
                <th>Detected</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((item) => (
                <tr key={item.blockId}>
                  <td className="mono">{item.blockId}</td>
                  <td>{item.score.toFixed(2)}</td>
                  <td>{item.events}</td>
                  <td>{item.duration.toFixed(1)}s</td>
                  <td>{item.detected}</td>
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
