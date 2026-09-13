import { useEffect, useState } from "react";
import { getRecentAnomalies, type RecentAnomaly } from "../api/systemMetrics.api";

interface UseRecentAnomaliesResult {
  data: RecentAnomaly[];
  loading: boolean;
  error: string | null;
}

export function useRecentAnomalies(hours = 24, limit = 5): UseRecentAnomaliesResult {
  const [data, setData] = useState<RecentAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecentAnomalies(hours, limit)
      .then(setData)
      .catch((err) => {
        console.error("[Dashboard API] Recent anomalies error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch recent anomalies");
      })
      .finally(() => setLoading(false));
  }, [hours, limit]);

  return { data, loading, error };
}