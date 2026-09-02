import { apiClient } from "./client";
import type { SystemMetrics } from "../types";

export async function getSystemMetrics(): Promise<SystemMetrics[]> {
  const data = await apiClient<SystemMetrics[]>(
    "/api/system-metrics"
  );

  console.log("[Dashboard API] System Metrics:", data);

  return data;
}