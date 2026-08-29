import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="chart-card">
      <div className="chart-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}
