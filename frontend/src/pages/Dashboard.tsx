import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock3,
  Layers3,
 
  TimerReset,
} from "lucide-react";
import { useRealtime } from "../hooks/useRealtime";
import { useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "../components/common/ChartCard";
import SystemMetrics from "../components/common/SystemMetrics";
import { PredictionBadge } from "../components/common/PredictionBadge";
import { AppLayout } from "../components/layout/AppLayout";

import { useSystemMetricsHistory } from "../hooks/useSystemMetricsHistory";
import { useRecentAnomalies } from "../hooks/useRecentAnomalies";

import { Section } from "../components/common/Section";


function formatMetricTime(timestamp: string): string {
  const utcTimestamp =
    /(?:Z|[+-]\d{2}:?\d{2})$/.test(timestamp)
      ? timestamp
      : `${timestamp}Z`;

  const date = new Date(utcTimestamp);

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "");
}


function getTodayDate(): string {
  const today = new Date();

  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

export function DashboardPage() {
  /*
   * =====================================================
   * HISTORICAL DATA
   * =====================================================
   */
  const {
    connected,
    logs,
    activeBlocks,
    predictions,
    anomalies,
    logActivity,
    lastUpdate,
  } = useRealtime();
  const [logsDateInput, setLogsDateInput] = useState(getTodayDate);
  const [logsDate, setLogsDate] = useState("");

  const [predictionsDateInput, setPredictionsDateInput] =
    useState(getTodayDate);
  const [predictionsDate, setPredictionsDate] = useState("");

  const [anomalyDateInput, setAnomalyDateInput] =
    useState(getTodayDate);
  const [anomalyDate, setAnomalyDate] = useState("");

  const [durationDateInput, setDurationDateInput] =
    useState(getTodayDate);
  const [durationDate, setDurationDate] = useState("");


  const logsHistory = useSystemMetricsHistory(
    24,
    2,
    logsDate || undefined,
  );

  const predictionsHistory = useSystemMetricsHistory(
    24,
    2,
    predictionsDate || undefined,
  );

  const anomalyHistory = useSystemMetricsHistory(
    24,
    2,
    anomalyDate || undefined,
  );

  const durationHistory = useSystemMetricsHistory(
    24,
    2,
    durationDate || undefined,
  );


  const {
    data: recentAnomalies,
    loading: anomaliesLoading,
    error: anomaliesError,
  } = useRecentAnomalies(24, 5);


  /*
   * =====================================================
   * CHART DATA
   * =====================================================
   */

  const logsChartData = logsHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    logs: item.logs_received,
  }));


  const predictionsChartData = predictionsHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    normal: item.normal_predictions,
    anomaly: item.anomaly_predictions,
  }));


  const anomalyChartData = anomalyHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    anomalyRate: item.anomaly_rate,
  }));


  const durationChartData = durationHistory.data.map((item) => ({
    name: formatMetricTime(item.created_at),
    duration: item.avg_block_duration ?? 0,
  }));


  return (
    <AppLayout
      title="Dashboard"
      subtitle="Monitoring & anomaly detection overview"
    >

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
              "avg_score",
              "avg_block_duration",
            ]}
          />
       
      </Section>


      {/* =====================================================
          REAL-TIME MONITORING
      ====================================================== */}

      <Section>
  <header className="realtime-console-header">
    <div className="realtime-console-heading">
      <div>
        <div className="realtime-console-eyebrow">
          <span className="realtime-live-dot" />
          REAL-TIME MONITORING
        </div>

        <h2 id="realtime-console-title">
          HDFS observability console
        </h2>

        <p>
          HDFS logs <span>→</span> active blocks{" "}
          <span>→</span> predictions <span>→</span>{" "}
          anomalies
        </p>
      </div>
    </div>

    <div className="realtime-console-status">
      <span
        className={`realtime-live-badge ${
          connected ? "connected" : "disconnected"
        }`}
      >
        {connected ? "LIVE" : "OFFLINE"}
      </span>

      <span className="realtime-update-time">
        <Clock3 size={14} />

        Updated{" "}
        {lastUpdate
          ? lastUpdate.toLocaleTimeString()
          : "--:--:--"}
      </span>
    </div>
  </header>


  {/* =====================================================
      LIVE LOG ACTIVITY
      ===================================================== */}

  <article className="realtime-chart-surface">
    <div className="realtime-surface-heading">
      <div>
        <span className="realtime-surface-label">
          ACTIVITY STREAM
        </span>

        <h3>Live Log Activity</h3>

        <p>
          INFO and WARN events received during the
          latest window
        </p>
      </div>

      <Activity size={18} />
    </div>

    <div className="realtime-live-chart">
      <ResponsiveContainer
        width="100%"
        height={250}
      >
        <LineChart data={logActivity}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 10,
            }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "#64748b",
              fontSize: 10,
            }}
          />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="info"
            name="INFO"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={900}
          />

          <Line
            type="monotone"
            dataKey="warn"
            name="WARN"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </article>

  {/* =====================================================
      EVENT STREAM + ACTIVE BLOCKS
      ===================================================== */}

  <div className="realtime-console-grid">
    {/* ---------------------------------------------------
        LIVE EVENT FEED
        --------------------------------------------------- */}

    <article className="realtime-console-card realtime-feed-card">
      <div className="realtime-surface-heading compact">
        <div>
          <span className="realtime-surface-label">
            EVENT STREAM
          </span>

          <h3>Live Event Feed</h3>
        </div>

        <Activity size={17} />
      </div>

      <div className="realtime-event-feed">
        {logs.length === 0 ? (
          <div className="realtime-empty-state">
            Waiting for HDFS events...
          </div>
        ) : (
          logs.map((event) => (
            <div
              className={`realtime-event-row ${event.level.toLowerCase()}`}
              key={event.id}
            >
              <span className="realtime-event-time">
                {event.timestamp}
              </span>

              <span className="realtime-event-level">
                {event.level}
              </span>

              <div className="realtime-event-copy">
                <strong>
                  {event.blockId}
                </strong>

                <span>
                  {event.eventId} ·{" "}
                  {event.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </article>

    {/* ---------------------------------------------------
        ACTIVE BLOCKS
        --------------------------------------------------- */}

    <article className="realtime-console-card">
      <div className="realtime-surface-heading compact">
        <div>
          <span className="realtime-surface-label">
            BLOCK MANAGER
          </span>

          <h3>Active Blocks</h3>
        </div>

        <Layers3 size={17} />
      </div>

      <div className="realtime-active-list">
        {activeBlocks.length === 0 ? (
          <div className="realtime-empty-state">
            No active blocks
          </div>
        ) : (
          activeBlocks.map((block) => (
            <div
              className="realtime-active-row"
              key={block.blockId}
            >
              <span className="realtime-block-state-dot" />

              <div className="realtime-active-block-copy">
                <strong>
                  {block.blockId}
                </strong>

                <span>
                  {block.events} events · last
                  activity{" "}
                  {block.lastActivity}
                </span>
              </div>

              <span className="realtime-active-state">
                {block.status}
              </span>
            </div>
          ))
        )}
      </div>
    </article>
  </div>

  {/* =====================================================
      PREDICTIONS + ANOMALIES
      ===================================================== */}

  <div className="realtime-console-grid lower">
    {/* ---------------------------------------------------
        PREDICTION ACTIVITY
        --------------------------------------------------- */}

    <article className="realtime-console-card">
      <div className="realtime-surface-heading compact">
        <div>
          <span className="realtime-surface-label">
            MODEL OUTPUT
          </span>

          <h3>Prediction Activity</h3>
        </div>

        <TimerReset size={17} />
      </div>

      <div className="realtime-prediction-feed">
        {predictions.length === 0 ? (
          <div className="realtime-empty-state">
            Waiting for model predictions...
          </div>
        ) : (
          predictions.map((prediction) => (
            <div
              className="realtime-prediction-row"
              key={prediction.id}
            >
              <span
                className={`realtime-prediction-dot ${prediction.prediction.toLowerCase()}`}
              />

              <span className="realtime-prediction-time">
                {prediction.timestamp}
              </span>

              <div className="realtime-prediction-copy">
                <strong>
                  {prediction.blockId}
                </strong>

                <span>
                  {prediction.model} · score{" "}
                  {prediction.score.toFixed(2)}
                </span>
              </div>

              <PredictionBadge
                prediction={
                  prediction.prediction
                }
              />
            </div>
          ))
        )}
      </div>
    </article>

    {/* ---------------------------------------------------
        RECENT ANOMALIES
        --------------------------------------------------- */}

    <article className="realtime-console-card anomaly-card">
      <div className="realtime-surface-heading compact">
        <div>
          <span className="realtime-surface-label">
            ATTENTION REQUIRED
          </span>

          <h3>Recent Anomalies</h3>
        </div>

        <AlertTriangle size={17} />
      </div>

      <div className="realtime-anomaly-list">
        {anomalies.length === 0 ? (
          <div className="realtime-empty-state">
            No anomalies detected
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div
              className="realtime-anomaly-row"
              key={anomaly.id}
            >
              <span className="realtime-anomaly-icon">
                <AlertTriangle size={14} />
              </span>

              <div>
                <strong>
                  {anomaly.blockId}
                </strong>

                <span>
                  {anomaly.timestamp}
                </span>
              </div>

              <div className="realtime-anomaly-score">
                <span>ANOMALY</span>

                <strong>
                  {anomaly.score.toFixed(2)}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </article>
  </div>
</Section>


      {/* =====================================================
          HISTORICAL TRENDS
      ====================================================== */}

      <section className="dashboard-section charts-section">

        <div className="section-period-banner">

          <div className="section-period-icon charts-icon">
            <BarChart3 size={18} />
          </div>

          <div>
            <p className="section-period-eyebrow">
              Historical trends
            </p>

            <h2>
              System Metrics Over Time
            </h2>

            <p>
              Chaque graphique peut afficher les dernières
              24 heures ou une journée précise.
            </p>
          </div>

          <span className="section-period-badge charts-badge">
            Dates indépendantes
          </span>

        </div>


        <div className="dashboard-grid">

          {/* =================================================
              LOG INGESTION
          ================================================== */}

          <ChartCard
            title="Log ingestion rate"
            subtitle="Logs / minute"
            actions={
              <ChartDateControl
                value={logsDateInput}
                onChange={(date) => {
                  setLogsDateInput(date);
                  setLogsDate(date);
                }}
              />
            }
          >

            <div className="chart-wrap large">

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <AreaChart data={logsChartData}>

                  <defs>
                    <linearGradient
                      id="ingestionFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.2}
                      />

                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="name"
                    interval={0}
                    minTickGap={0}
                    height={42}
                    tickMargin={2}
                    angle={-30}
                    textAnchor="end"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                  />


                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />


                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#ingestionFill)"
                    name="Logs reçus"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </ChartCard>


          {/* =================================================
              PREDICTIONS
          ================================================== */}

          <ChartCard
            title="Predictions"
            subtitle="Normal vs anomaly over 24h"
            actions={
              <ChartDateControl
                value={predictionsDateInput}
                onChange={(date) => {
                  setPredictionsDateInput(date);
                  setPredictionsDate(date);
                }}
              />
            }
          >

            <div className="chart-wrap">

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <ComposedChart data={predictionsChartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="name"
                    interval={0}
                    minTickGap={0}
                    height={42}
                    tickMargin={2}
                    angle={-30}
                    textAnchor="end"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                  />


                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />


                  <Tooltip />

                  <Legend />


                  <Line
                    type="monotone"
                    dataKey="normal"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Normal"
                  />


                  <Line
                    type="monotone"
                    dataKey="anomaly"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Anomaly"
                  />

                </ComposedChart>

              </ResponsiveContainer>

            </div>

          </ChartCard>


          {/* =================================================
              ANOMALY RATE
          ================================================== */}

          <ChartCard
            title="Anomaly rate over time"
            actions={
              <ChartDateControl
                value={anomalyDateInput}
                onChange={(date) => {
                  setAnomalyDateInput(date);
                  setAnomalyDate(date);
                }}
              />
            }
          >

            <div className="chart-wrap">

              <ResponsiveContainer
                width="100%"
                height={230}
              >

                <AreaChart data={anomalyChartData}>

                  <defs>
                    <linearGradient
                      id="anomalyFill"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.2}
                      />

                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={0.03}
                      />

                    </linearGradient>
                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="name"
                    interval={0}
                    minTickGap={0}
                    height={42}
                    tickMargin={2}
                    angle={-30}
                    textAnchor="end"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 9,
                    }}
                  />


                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />


                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="anomalyRate"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fill="url(#anomalyFill)"
                    name="Taux d'anomalie (%)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </ChartCard>


          {/* =================================================
              BLOCK DURATION
          ================================================== */}

          <ChartCard
            title="Average block processing time"
            actions={
              <ChartDateControl
                value={durationDateInput}
                onChange={(date) => {
                  setDurationDateInput(date);
                  setDurationDate(date);
                }}
              />
            }
          >

            <div className="chart-wrap">

              <ResponsiveContainer
                width="100%"
                height={230}
              >

                <LineChartMini
                  data={durationChartData.map(
                    ({ name, duration }) => ({
                      name,
                      value: duration,
                    }),
                  )}
                />

              </ResponsiveContainer>

            </div>

          </ChartCard>

        </div>


        {(logsHistory.loading ||
          predictionsHistory.loading ||
          anomalyHistory.loading ||
          durationHistory.loading) && (

          <p className="metrics-period">
            Chargement de l’historique des graphiques...
          </p>

        )}


        {(logsHistory.error ||
          predictionsHistory.error ||
          anomalyHistory.error ||
          durationHistory.error) && (

          <p
            className="metrics-period"
            role="alert"
          >
            Impossible de charger les données des graphiques.
          </p>

        )}

      </section>


      {/* =====================================================
          RECENT ANOMALIES
      ====================================================== */}

      <section className="panel">

        <div className="panel-header">

          <h3>
            Recent anomalies
          </h3>

        </div>


        <div className="table-shell">

          <table>

            <thead>

              <tr>
                <th>Block ID</th>
                <th>Prediction</th>
                <th>Score</th>
                <th>Events</th>
                <th>Duration</th>
                <th>Model</th>
              </tr>

            </thead>


            <tbody>

              {anomaliesLoading && (
                <tr>
                  <td colSpan={6}>
                    Chargement des anomalies...
                  </td>
                </tr>
              )}


              {anomaliesError && (
                <tr>
                  <td colSpan={6}>
                    Impossible de charger les anomalies.
                  </td>
                </tr>
              )}


              {!anomaliesLoading &&
                !anomaliesError &&
                recentAnomalies.map((row) => (

                  <tr key={row.id}>

                    <td className="mono">
                      {row.block_id}
                    </td>

                    <td>
                      <PredictionBadge
                        prediction={row.prediction}
                      />
                    </td>

                    <td>
                      {row.score.toFixed(2)}
                    </td>

                    <td>
                      {row.num_events}
                    </td>

                    <td>
                      {row.duration.toFixed(2)}s
                    </td>

                    <td>
                      Model #{row.model_id}
                    </td>

                  </tr>

                ))}


              {!anomaliesLoading &&
                !anomaliesError &&
                recentAnomalies.length === 0 && (

                  <tr>
                    <td colSpan={6}>
                      Aucune anomalie récente.
                    </td>
                  </tr>

                )}

            </tbody>

          </table>

        </div>

      </section>

    </AppLayout>
  );
}


function ChartDateControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="chart-date-control"
      title="Choisir la date du graphique"
    >

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label="Choisir la date de ce graphique"
      />

    </label>
  );
}


function LineChartMini({
  data,
}: {
  data: {
    name: string;
    value: number;
  }[];
}) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >

      <AreaChart data={data}>

        <defs>

          <linearGradient
            id="miniChart"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >

            <stop
              offset="5%"
              stopColor="#2563eb"
              stopOpacity={0.2}
            />

            <stop
              offset="95%"
              stopColor="#2563eb"
              stopOpacity={0.03}
            />

          </linearGradient>

        </defs>


        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          vertical={false}
        />


        <XAxis
          dataKey="name"
          interval={0}
          minTickGap={0}
          height={42}
          tickMargin={2}
          angle={-30}
          textAnchor="end"
          tickLine={false}
          axisLine={false}
          tick={{
            fill: "#64748b",
            fontSize: 9,
          }}
        />


        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{
            fill: "#64748b",
            fontSize: 12,
          }}
        />


        <Tooltip />


        <Area
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={3}
          fill="url(#miniChart)"
        />

      </AreaChart>

    </ResponsiveContainer>
  );
}
