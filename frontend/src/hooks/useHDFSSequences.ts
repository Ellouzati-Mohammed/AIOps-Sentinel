import { useEffect, useState } from "react";
import { getHDFSSequences, type HDFSSequenceRecord } from "../api/systemMetrics.api";

interface UseHDFSSequencesResult {
  data: HDFSSequenceRecord[];
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export function useHDFSSequences(
  page: number,
  pageSize: number,
  search: string,
  prediction: string,
  sortBy = "completed_at",
  sortOrder: "asc" | "desc" = "desc",
): UseHDFSSequencesResult {
  const [data, setData] = useState<HDFSSequenceRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getHDFSSequences(page, pageSize, search, prediction, sortBy, sortOrder)
      .then((result) => {
        setData(result.items);
        setTotalPages(result.total_pages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch HDFS blocks"))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, prediction, sortBy, sortOrder]);

  return { data, totalPages, loading, error };
}