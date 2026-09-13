import { useEffect, useState } from "react";
import { getSystemMetricsHistory } from "../api/systemMetrics.api";
import type { SystemMetrics } from "../types";

interface UseSystemMetricsHistoryResult {
  data: SystemMetrics[];
  loading: boolean;
  error: string | null;
}

export function useSystemMetricsHistory(
  hours = 24,
  intervalHours = 2,
): UseSystemMetricsHistoryResult {
  const [data, setData] = useState<SystemMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSystemMetricsHistory(hours, intervalHours)
      .then(setData)
      .catch((err) => {
        console.error("[Dashboard API] System metrics history error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch system metrics history");
      })
      .finally(() => setLoading(false));
  }, [hours, intervalHours]);

  return { data, loading, error };
}