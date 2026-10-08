import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "../css/kpidesing.css";

import { AppLayout } from "../components/layout/AppLayout";
import SystemMetrics from "../components/common/SystemMetrics";

import { useSystemMetricsHistory } from "../hooks/useSystemMetricsHistory";
import { Section } from "../components/common/Section";

function formatMetricTime(timestamp: string): string {
  const utcTimestamp =
    /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp)
      ? timestamp
      : `${timestamp}Z`;

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(utcTimestamp));
}

export function SystemMetricsPage() {
  /*
   * ----------------------------------------------------
   * HISTORICAL DATA
   * ----------------------------------------------------
   */

  const {
    data: history,
    loading: historyLoading,
    error: historyError,
  } = useSystemMetricsHistory(24, 2);

  /*
   * ----------------------------------------------------
   * CHART DATA
   * ----------------------------------------------------
   */

  const chartData = history.map((item) => ({
    name: formatMetricTime(item.created_at),

    logs: item.logs_received,

    predictions: item.total_predictions,

    anomalyRate: item.anomaly_rate,

    duration: item.avg_block_duration ?? 0,

    events: item.avg_events_per_block ?? 0,
  }));

  return (
    <AppLayout
      title="System Metrics"
      subtitle="Infrastructure and pipeline telemetry overview"
    >
      <div className="system-metrics-page">

        {/* =====================================================
            KPI SECTION
        ====================================================== */}
      <Section>
        <SystemMetrics
          metrics={[
            "logs_received",
            "blocks_completed",
            "total_predictions",
            "anomaly_rate",
            "normal_rate",
            "avg_score",
            "avg_block_duration",
            "avg_events_per_block",
            "info_logs",
            "warn_logs",
          ]}
          />
        </Section>

        {/* =====================================================
            HISTORICAL TRENDS
        ====================================================== */}

        <section className="charts-section">

          {/* HEADER */}

          <div className="charts-section-header">

            <div className="charts-title">

              <h2>
                Historical Trends
              </h2>

              <p>
                System activity and pipeline performance over time
              </p>

            </div>

            <div className="charts-badge">
              Last 24 hours · Every 2 hours
            </div>

          </div>

          {/* =====================================================
              CHART GRID
          ====================================================== */}

          <div className="dashboard-grid">

            {/* =================================================
                LOG THROUGHPUT
            ================================================== */}

            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Log throughput
                  </h3>

                  <p className="panel-subtitle">
                    Logs received over time
                  </p>

                </div>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <AreaChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="logs"
                      stroke="#2563eb"
                      fill="#dbeafe"
                      strokeWidth={2.5}
                      name="Logs reçus"
                    />

                  </AreaChart>
                </ResponsiveContainer>

              </div>

            </section>

            {/* =================================================
                PREDICTIONS
            ================================================== */}

            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Prediction rate
                  </h3>

                  <p className="panel-subtitle">
                    Predictions processed over time
                  </p>

                </div>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <BarChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="predictions"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                      name="Predictions"
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>

            </section>

            {/* =================================================
                ANOMALY RATE
            ================================================== */}

            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Anomaly rate
                  </h3>

                  <p className="panel-subtitle">
                    Detected anomalies percentage
                  </p>

                </div>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <AreaChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="anomalyRate"
                      stroke="#f59e0b"
                      fill="#fef3c7"
                      strokeWidth={2.5}
                      name="Taux d'anomalie (%)"
                    />

                  </AreaChart>
                </ResponsiveContainer>

              </div>

            </section>

            {/* =================================================
                BLOCK DURATION
            ================================================== */}

            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Block duration
                  </h3>

                  <p className="panel-subtitle">
                    Average processing duration
                  </p>

                </div>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <BarChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="duration"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                      name="Durée moyenne (s)"
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>

            </section>

            {/* =================================================
                EVENTS PER BLOCK
            ================================================== */}

            <section className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Events per block
                  </h3>

                  <p className="panel-subtitle">
                    Average events processed per block
                  </p>

                </div>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer
                  width="100%"
                  height={220}
                >
                  <AreaChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="events"
                      stroke="#0ea5e9"
                      fill="#e0f2fe"
                      strokeWidth={2.5}
                      name="Événements/bloc"
                    />

                  </AreaChart>
                </ResponsiveContainer>

              </div>

            </section>

          </div>

          {/* =====================================================
              LOADING / ERROR
          ====================================================== */}

          {historyLoading && (
            <p className="history-message">
              Loading historical data...
            </p>
          )}

          {historyError && (
            <p
              className="history-error"
              role="alert"
            >
              Unable to load historical data.
            </p>
          )}

        </section>

      </div>
    </AppLayout>
  );
}

export default SystemMetricsPage;