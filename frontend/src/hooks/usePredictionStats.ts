import { useEffect, useState } from "react";
import { getPredictionStats, type PredictionStats } from "../api/systemMetrics.api";

interface UsePredictionStatsResult {
  data: PredictionStats | null;
  loading: boolean;
  error: string | null;
}

export function usePredictionStats(): UsePredictionStatsResult {
  const [data, setData] = useState<PredictionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPredictionStats()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch prediction statistics"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}