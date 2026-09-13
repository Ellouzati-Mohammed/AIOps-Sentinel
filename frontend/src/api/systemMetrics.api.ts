import { apiClient } from "./client";
import type { SystemMetrics } from "../types";

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
): Promise<SystemMetrics[]> {
  return apiClient<SystemMetrics[]>(
    `/api/system-metrics/history?hours=${hours}&interval_hours=${intervalHours}`,
  );
}

export async function getRecentAnomalies(hours = 24, limit = 5): Promise<RecentAnomaly[]> {
  return apiClient<RecentAnomaly[]>(
    `/api/hdfs-sequences/anomalies/recent?hours=${hours}&limit=${limit}`,
  );
}