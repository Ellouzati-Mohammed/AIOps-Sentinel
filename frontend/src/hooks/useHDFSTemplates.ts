import { useEffect, useState } from "react";
import { getHDFSTemplates, type HDFSTemplateRecord } from "../api/systemMetrics.api";

interface UseHDFSTemplatesResult {
  data: HDFSTemplateRecord[];
  loading: boolean;
  error: string | null;
}

export function useHDFSTemplates(sortBy = "created_at", sortOrder: "asc" | "desc" = "desc"): UseHDFSTemplatesResult {
  const [data, setData] = useState<HDFSTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHDFSTemplates(sortBy, sortOrder)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch HDFS templates"))
      .finally(() => setLoading(false));
  }, [sortBy, sortOrder]);

  return { data, loading, error };
}