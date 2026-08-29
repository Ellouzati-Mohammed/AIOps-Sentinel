interface ScoreBadgeProps {
  value: number;
}

export function ScoreBadge({ value }: ScoreBadgeProps) {
  const tone = value >= 0.8 ? 'badge badge-danger' : value >= 0.5 ? 'badge badge-warning' : 'badge badge-success';

  return <span className={tone}>{value.toFixed(2)}</span>;
}
