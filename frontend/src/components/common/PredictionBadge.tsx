interface PredictionBadgeProps {
  prediction: 'NORMAL' | 'ANOMALY';
}

export function PredictionBadge({ prediction }: PredictionBadgeProps) {
  return (
    <span className={prediction === 'ANOMALY' ? 'badge badge-danger' : 'badge badge-success'}>
      {prediction}
    </span>
  );
}
