import { apiClient } from "./client";
import type { SystemMetrics } from "../types";

export interface LogRecord {
  time: string | null;
  message: string;
}

export interface PaginatedLogs {
  items: LogRecord[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface RecentAnomaly {
  id: number;
  block_id: string;
  prediction: "ANOMALY";
  score: number;
  num_events: number;
  duration: number;
  model_id: number;
  completed_at: string;
}

export interface HDFSSequenceRecord {
  id: number;
  block_id: string;
  event_sequence: string[];
  num_events: number;
  duration: number;
  num_info: number;
  num_warn: number;
  prediction: "NORMAL" | "ANOMALY";
  score: number;
  model_id: number;
  completed_at: string | null;
  created_at: string;
}

export interface PaginatedHDFSSequences {
  items: HDFSSequenceRecord[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PredictionStats {
  total_predictions: number;
  normal_predictions: number;
  anomaly_predictions: number;
  score_distribution: Array<{ name: string; value: number }>;
}

export interface HDFSTemplateRecord {
  id: number;
  event_id: string;
  template: string;
  created_at: string;
}

export interface ModelRecord {
  id: number;
  name: string;
  version: string | null;
  description: string | null;
  model_type: string;
  framework: string | null;
  model_path: string;
  input_features: string[] | null;
  threshold: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AggregatedSystemMetrics extends Omit<SystemMetrics, "id"> {
  id: number | null;
  snapshots_count: number;
  aggregated_date: string | null;
}

export async function getSystemMetrics(): Promise<SystemMetrics[]> {
  const data = await apiClient<SystemMetrics[]>(
    "/api/system-metrics"
  );

  console.log("[Dashboard API] System Metrics:", data);

  return data;
}

export async function getLatestSystemMetrics(): Promise<SystemMetrics> {
  const data = await apiClient<SystemMetrics>("/api/system-metrics/latest");

  console.log("[Dashboard API] Latest system metrics:", data);

  return data;
}

export async function getSystemMetricsHistory(
  hours = 24,
  intervalHours = 2,
  date?: string,
): Promise<SystemMetrics[]> {
  const params = new URLSearchParams({
    hours: String(hours),
    interval_hours: String(intervalHours),
  });
  if (date) params.set("date", date);
  return apiClient<SystemMetrics[]>(
    `/api/system-metrics/history?${params.toString()}`,
  );
}

export async function getRecentAnomalies(hours = 24, limit = 5): Promise<RecentAnomaly[]> {
  return apiClient<RecentAnomaly[]>(
    `/api/hdfs-sequences/anomalies/recent?hours=${hours}&limit=${limit}`,
  );
}

export async function getLogs(
  page = 1,
  pageSize = 20,
  search = "",
  sortOrder: "asc" | "desc" = "desc",
): Promise<PaginatedLogs> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_order: sortOrder,
  });
  if (search.trim()) params.set("search", search.trim());

  const endpoint = `/api/logs?${params.toString()}`;
  console.log("[Live Logs API] request:", { endpoint, page, pageSize, search });

  const data = await apiClient<PaginatedLogs>(endpoint);
  console.log("[Live Logs API] response:", {
    total: data.total,
    totalPages: data.total_pages,
    returned: data.items.length,
    firstMessage: data.items[0]?.message,
  });

  return data;
}

export async function getHDFSSequences(
  page = 1,
  pageSize = 20,
  search = "",
  prediction = "All",
  sortBy = "completed_at",
  sortOrder: "asc" | "desc" = "desc",
): Promise<PaginatedHDFSSequences> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  if (search.trim()) params.set("search", search.trim());
  if (prediction !== "All") params.set("prediction", prediction);

  return apiClient<PaginatedHDFSSequences>(`/api/hdfs-sequences?${params.toString()}`);
}

export async function getPredictionStats(): Promise<PredictionStats> {
  return apiClient<PredictionStats>("/api/hdfs-sequences/prediction-stats");
}

export async function getHDFSTemplates(
  sortBy = "created_at",
  sortOrder: "asc" | "desc" = "desc",
): Promise<HDFSTemplateRecord[]> {
  return apiClient<HDFSTemplateRecord[]>(`/api/hdfs-templates?sort_by=${sortBy}&sort_order=${sortOrder}`);
}

export async function getModels(
  sortBy = "updated_at",
  sortOrder: "asc" | "desc" = "desc",
): Promise<ModelRecord[]> {
  return apiClient<ModelRecord[]>(`/api/models?sort_by=${sortBy}&sort_order=${sortOrder}`);
}

export async function getAggregatedSystemMetrics(date?: string): Promise<AggregatedSystemMetrics> {
  const endpoint = date
    ? `/api/system-metrics/aggregate?date=${encodeURIComponent(date)}`
    : "/api/system-metrics/aggregate";
  return apiClient<AggregatedSystemMetrics>(endpoint);
}