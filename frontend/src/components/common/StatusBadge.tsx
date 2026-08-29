interface StatusBadgeProps {
  status: 'Operational' | 'Detected' | 'Warning' | 'Normal' | 'Active';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    Operational: 'badge badge-success',
    Detected: 'badge badge-danger',
    Warning: 'badge badge-warning',
    Normal: 'badge badge-neutral',
    Active: 'badge badge-success',
  };

  return <span className={variants[status] ?? 'badge'}>{status}</span>;
}
