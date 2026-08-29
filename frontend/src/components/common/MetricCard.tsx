import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: ReactNode;
  sparkline?: number[];
}

export function MetricCard({ title, value, delta, deltaPositive, icon, sparkline }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-top-row">
        <div className="metric-icon">{icon}</div>
        <div className={`metric-trend ${deltaPositive ? 'positive' : 'negative'}`}>
          {deltaPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{delta}</span>
        </div>
      </div>

      <div className="metric-body">
        <div className="metric-label">{title}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-subtext">vs previous period</div>
      </div>

      {sparkline && (
        <div className="sparkline" aria-hidden="true">
          {sparkline.map((point, index) => (
            <span
              key={`${title}-${index}`}
              style={{
                height: `${Math.max(18, (point / Math.max(...sparkline, 1)) * 100)}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
