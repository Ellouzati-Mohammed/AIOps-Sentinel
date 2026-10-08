import { useState } from "react";
import "../../css/kpidesing.css";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";

export type SystemMetricKey =
  | "logs_received"
  | "blocks_completed"
  | "normal_predictions"
  | "anomaly_predictions"
  | "total_predictions"
  | "anomaly_rate"
  | "normal_rate"
  | "avg_score"
  | "max_score"
  | "min_score"
  | "avg_block_duration"
  | "max_block_duration"
  | "min_block_duration"
  | "avg_events_per_block"
  | "max_events_per_block"
  | "info_logs"
  | "warn_logs";

interface SystemMetricsProps {
  metrics?: SystemMetricKey[];
}

const DEFAULT_METRICS: SystemMetricKey[] = [
  "logs_received",
  "blocks_completed",
  "normal_predictions",
  "anomaly_predictions",
  "total_predictions",
  "anomaly_rate",
  "normal_rate",
  "avg_score",
  "max_score",
  "min_score",
  "avg_block_duration",
  "max_block_duration",
  "min_block_duration",
  "avg_events_per_block",
  "max_events_per_block",
  "info_logs",
  "warn_logs",
];

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDisplayDate(date?: string): string {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function SystemMetrics({
  metrics: selectedMetrics = DEFAULT_METRICS,
}: SystemMetricsProps) {
  /*
   * ----------------------------------------------------
   * DATE FILTER
   * ----------------------------------------------------
   */

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedStartDate, setAppliedStartDate] = useState<
    string | undefined
  >(undefined);

  const [appliedEndDate, setAppliedEndDate] = useState<
    string | undefined
  >(undefined);

  /*
   * ----------------------------------------------------
   * DATA
   * ----------------------------------------------------
   */

  const {
    data,
    loading,
    error,
  } = useSystemMetrics(
    appliedStartDate,
    appliedEndDate,
  );

  const metrics = data[0];

  /*
   * ----------------------------------------------------
   * DATE ACTIONS
   * ----------------------------------------------------
   */

  const handleApplyDates = () => {
    if (
      startDate &&
      endDate &&
      new Date(startDate) > new Date(endDate)
    ) {
      return;
    }

    setAppliedStartDate(
      startDate || undefined,
    );

    setAppliedEndDate(
      endDate || undefined,
    );
  };

  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");

    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
  };

  /*
   * ----------------------------------------------------
   * RENDER
   * ----------------------------------------------------
   */

  return (<>
    

      {/* =====================================================
          KPI HEADER + DATE FILTER
      ====================================================== */}

      <div className="kpi-section-header">

        <div className="kpi-heading">

          <h2>
            KPI Overview
          </h2>

          <p>
            Key performance indicators for the selected period
          </p>

        </div>

        <div className="kpi-date-filter">

          {/* START DATE */}

          <div className="date-field">

            <label htmlFor="kpi-start-date">
              Start date
            </label>

            <div className="date-input-container">

              <span className="date-input-icon">
                📅
              </span>

              <input
                id="kpi-start-date"
                type="date"
                className="date-input"
                value={startDate}
                max={endDate || getToday()}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
              />

            </div>

          </div>

          {/* ARROW */}

          <div className="date-arrow">
            →
          </div>

          {/* END DATE */}

          <div className="date-field">

            <label htmlFor="kpi-end-date">
              End date
            </label>

            <div className="date-input-container">

              <span className="date-input-icon">
                📅
              </span>

              <input
                id="kpi-end-date"
                type="date"
                className="date-input"
                value={endDate}
                min={startDate || undefined}
                max={getToday()}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
              />

            </div>

          </div>

          {/* RESET */}

          <button
            type="button"
            className="kpi-button reset-button"
            onClick={handleResetDates}
          >
            Reset
          </button>

          {/* APPLY */}

          <button
            type="button"
            className="kpi-button apply-button"
            onClick={handleApplyDates}
          >
            Apply
          </button>

        </div>

      </div>

      {/* =====================================================
          SELECTED PERIOD
      ====================================================== */}

      <div className="kpi-period-bar">

        <span className="kpi-period-indicator" />

        <span className="kpi-period-text">

          KPI period:{" "}

          {appliedStartDate || appliedEndDate ? (
            <>
              <strong>
                {formatDisplayDate(appliedStartDate)}
              </strong>

              {" → "}

              <strong>
                {formatDisplayDate(appliedEndDate)}
              </strong>
            </>
          ) : (
            <strong>
              All available data
            </strong>
          )}

        </span>

      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="metrics-kpi-grid">

        {/* LOADING */}

        {loading && (
          <div className="kpi-message">
            Loading metrics...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className="kpi-error"
            role="alert"
          >
            Unable to load system metrics.
          </div>
        )}

        {/* NO DATA */}

        {!loading &&
          !error &&
          !metrics && (
            <div className="kpi-message">
              No system metrics available.
            </div>
          )}

        {/* DATA */}

        {!loading &&
          !error &&
          metrics && (
            <>

              {/* LOGS RECEIVED */}

              {selectedMetrics.includes("logs_received") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Logs received
                  </span>

                  <strong className="kpi-value">
                    {metrics.logs_received.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* COMPLETED BLOCKS */}

              {selectedMetrics.includes("blocks_completed") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Completed blocks
                  </span>

                  <strong className="kpi-value">
                    {metrics.blocks_completed.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* NORMAL PREDICTIONS */}

              {selectedMetrics.includes("normal_predictions") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Normal predictions
                  </span>

                  <strong className="kpi-value">
                    {metrics.normal_predictions.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* ANOMALY PREDICTIONS */}

              {selectedMetrics.includes("anomaly_predictions") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Anomaly predictions
                  </span>

                  <strong className="kpi-value">
                    {metrics.anomaly_predictions.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* TOTAL PREDICTIONS */}

              {selectedMetrics.includes("total_predictions") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Total predictions
                  </span>

                  <strong className="kpi-value">
                    {metrics.total_predictions.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* ANOMALY RATE */}

              {selectedMetrics.includes("anomaly_rate") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Anomaly rate
                  </span>

                  <strong className="kpi-value">
                    {metrics.anomaly_rate.toFixed(2)}

                    <span className="kpi-unit">
                      %
                    </span>
                  </strong>
                </div>
              )}

              {/* NORMAL RATE */}

              {selectedMetrics.includes("normal_rate") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Normal rate
                  </span>

                  <strong className="kpi-value">
                    {metrics.normal_rate.toFixed(2)}

                    <span className="kpi-unit">
                      %
                    </span>
                  </strong>
                </div>
              )}

              {/* AVERAGE SCORE */}

              {selectedMetrics.includes("avg_score") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Average score
                  </span>

                  <strong className="kpi-value">
                    {metrics.avg_score === null
                      ? "N/A"
                      : metrics.avg_score.toFixed(4)}
                  </strong>
                </div>
              )}

              {/* MAX SCORE */}

              {selectedMetrics.includes("max_score") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Maximum score
                  </span>

                  <strong className="kpi-value">
                    {metrics.max_score === null
                      ? "N/A"
                      : metrics.max_score.toFixed(4)}
                  </strong>
                </div>
              )}

              {/* MIN SCORE */}

              {selectedMetrics.includes("min_score") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Minimum score
                  </span>

                  <strong className="kpi-value">
                    {metrics.min_score === null
                      ? "N/A"
                      : metrics.min_score.toFixed(4)}
                  </strong>
                </div>
              )}

              {/* AVERAGE BLOCK DURATION */}

              {selectedMetrics.includes("avg_block_duration") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Average block duration
                  </span>

                  <strong className="kpi-value">
                    {metrics.avg_block_duration === null ? (
                      "N/A"
                    ) : (
                      <>
                        {metrics.avg_block_duration.toFixed(2)}

                        <span className="kpi-unit">
                          s
                        </span>
                      </>
                    )}
                  </strong>
                </div>
              )}

              {/* MAX BLOCK DURATION */}

              {selectedMetrics.includes("max_block_duration") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Maximum block duration
                  </span>

                  <strong className="kpi-value">
                    {metrics.max_block_duration === null
                      ? "N/A"
                      : `${metrics.max_block_duration.toFixed(2)} s`}
                  </strong>
                </div>
              )}

              {/* MIN BLOCK DURATION */}

              {selectedMetrics.includes("min_block_duration") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Minimum block duration
                  </span>

                  <strong className="kpi-value">
                    {metrics.min_block_duration === null
                      ? "N/A"
                      : `${metrics.min_block_duration.toFixed(2)} s`}
                  </strong>
                </div>
              )}

              {/* AVERAGE EVENTS / BLOCK */}

              {selectedMetrics.includes("avg_events_per_block") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Average events / block
                  </span>

                  <strong className="kpi-value">
                    {metrics.avg_events_per_block === null
                      ? "N/A"
                      : metrics.avg_events_per_block.toFixed(2)}
                  </strong>
                </div>
              )}

              {/* MAX EVENTS / BLOCK */}

              {selectedMetrics.includes("max_events_per_block") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    Maximum events / block
                  </span>

                  <strong className="kpi-value">
                    {metrics.max_events_per_block === null
                      ? "N/A"
                      : metrics.max_events_per_block.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* INFO LOGS */}

              {selectedMetrics.includes("info_logs") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    INFO logs
                  </span>

                  <strong className="kpi-value">
                    {metrics.info_logs.toLocaleString()}
                  </strong>
                </div>
              )}

              {/* WARN LOGS */}

              {selectedMetrics.includes("warn_logs") && (
                <div className="kpi-tile">
                  <span className="kpi-label">
                    WARN logs
                  </span>

                  <strong className="kpi-value">
                    {metrics.warn_logs.toLocaleString()}
                  </strong>
                </div>
              )}

            </>
          )}

      </div>

  </>);
}

export default SystemMetrics;