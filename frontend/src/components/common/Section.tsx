import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
}

export function Section({
  children,
}: SectionProps) {
  return (
    <section className="dashboard-section kpi-section">
        <div>
        {children}
        </div>
    </section>
  );
}