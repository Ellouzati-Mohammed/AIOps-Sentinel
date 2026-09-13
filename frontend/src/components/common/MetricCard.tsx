import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: ReactNode;
  sparkline?: number[];
  subtext?: string;
}

export function MetricCard({ title, value, delta, deltaPositive = true, icon, sparkline, subtext = 'Dernières 2 heures' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-top-row">
        <div className="metric-icon">{icon}</div>
        {delta && (
          <div className={`metric-trend ${deltaPositive ? 'positive' : 'negative'}`}>
            {deltaPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{delta}</span>
          </div>
        )}
      </div>

      <div className="metric-body">
        <div className="metric-label">{title}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-subtext">{subtext}</div>
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
