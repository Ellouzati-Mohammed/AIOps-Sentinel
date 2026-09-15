import { useEffect, useState } from "react";
import { getModels, type ModelRecord } from "../api/systemMetrics.api";

interface UseModelsResult {
  data: ModelRecord[];
  loading: boolean;
  error: string | null;
}

export function useModels(sortBy = "updated_at", sortOrder: "asc" | "desc" = "desc"): UseModelsResult {
  const [data, setData] = useState<ModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModels(sortBy, sortOrder)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch models"))
      .finally(() => setLoading(false));
  }, [sortBy, sortOrder]);

  return { data, loading, error };
}