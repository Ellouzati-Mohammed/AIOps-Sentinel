import { useCallback, useEffect, useState } from "react";
import { getAggregatedSystemMetricsByDateRange } from "../api/systemMetrics.api";
import type { SystemMetrics } from "../types";

interface UseSystemMetricsResult {
  data: SystemMetrics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSystemMetrics(
  startDate?: string,
  endDate?: string,
): UseSystemMetricsResult {
  const [data, setData] = useState<SystemMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log("===== useSystemMetrics START =====");
    console.log("[HOOK] startDate:", startDate);
    console.log("[HOOK] endDate:", endDate);

    try {
      setLoading(true);
      setError(null);

      console.log("[HOOK] Calling API...");

      const result = await getAggregatedSystemMetricsByDateRange(
        startDate,
        endDate,
      );

      console.log("[HOOK] API SUCCESS:", result);

      setData([result]);
    } catch (err) {
      console.error("[HOOK] API ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch system metrics",
      );

      setData([]);
    } finally {
      setLoading(false);
      console.log("===== useSystemMetrics END =====");
    }
  }, [startDate, endDate]);

  useEffect(() => {
    console.log("[HOOK] Dates changed -> fetchData()");
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}