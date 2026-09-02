import { useEffect, useState } from "react";
import { getSystemMetrics } from "../api/systemMetrics.api";
import type { SystemMetrics } from "../types";

interface UseSystemMetricsResult {
  data: SystemMetrics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSystemMetrics(): UseSystemMetricsResult {
  const [data, setData] = useState<SystemMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getSystemMetrics();

      setData(result);
    } catch (err) {
      console.error(
        "[Dashboard API] System Metrics Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch system metrics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSystemMetrics()
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(
          "[Dashboard API] System Metrics Error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch system metrics"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}