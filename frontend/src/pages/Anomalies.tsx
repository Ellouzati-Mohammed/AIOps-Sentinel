import { Search } from "lucide-react";
import { useState } from "react";

import { AppLayout } from "../components/layout/AppLayout";
import SystemMetrics from "../components/common/SystemMetrics";
import { useHDFSSequences } from "../hooks/useHDFSSequences";

const pageSize = 10;

export function AnomaliesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("completed_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: anomalies,
    totalPages,
    loading: anomaliesLoading,
    error: anomaliesError,
  } = useHDFSSequences(
    page,
    pageSize,
    search,
    "ANOMALY",
    sortBy,
    sortOrder,
  );

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <AppLayout
      title="Detected anomalies"
      subtitle="High-risk blocks and suspicious event patterns"
    >

      {/* =====================================================
          KPI SECTION
      ====================================================== */}

      <section className="dashboard-section dashboard-kpi-section">
        <div className="dashboard-kpi-container">
           <SystemMetrics
             metrics={[
               "anomaly_predictions",
               "anomaly_rate",
               "avg_score",
               "max_score",
               "avg_block_duration",
             ]}
           />
        </div>
      </section>


      {/* =====================================================
          ANOMALIES TABLE
      ====================================================== */}

      <section className="panel">

        <div className="toolbar no-wrap">

          <label className="search-input compact wide">
            <Search size={14} />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search anomaly block..."
            />
          </label>


          <button
            className="primary-button"
            onClick={handleSearch}
            type="button"
          >
            <Search size={14} />
            Search
          </button>


          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
          >
            <option value="completed_at">
              Sort: Detected
            </option>

            <option value="score">
              Sort: Score
            </option>

            <option value="duration">
              Sort: Duration
            </option>

            <option value="num_events">
              Sort: Events
            </option>
          </select>


          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(
                event.target.value as "asc" | "desc",
              );
              setPage(1);
            }}
          >
            <option value="desc">
              Descending
            </option>

            <option value="asc">
              Ascending
            </option>
          </select>

        </div>


        <div className="table-shell">

          <table>

            <thead>
              <tr>
                <th>Block</th>
                <th>Score</th>
                <th>Events</th>
                <th>Duration</th>
                <th>Detected</th>
                <th>Model</th>
              </tr>
            </thead>


            <tbody>

              {anomaliesLoading && (
                <tr>
                  <td colSpan={6}>
                    Loading anomalies...
                  </td>
                </tr>
              )}


              {anomaliesError && (
                <tr>
                  <td colSpan={6}>
                    Unable to load anomalies.
                  </td>
                </tr>
              )}


              {!anomaliesLoading &&
                !anomaliesError &&
                anomalies.map((item) => (
                  <tr key={item.id}>

                    <td className="mono">
                      {item.block_id}
                    </td>

                    <td>
                      {item.score.toFixed(4)}
                    </td>

                    <td>
                      {item.num_events}
                    </td>

                    <td>
                      {item.duration.toFixed(2)}s
                    </td>

                    <td>
                      {item.completed_at
                        ? new Date(
                            `${item.completed_at}Z`,
                          ).toLocaleString("fr-FR")
                        : "-"}
                    </td>

                    <td>
                      Model #{item.model_id}
                    </td>

                  </tr>
                ))}


              {!anomaliesLoading &&
                !anomaliesError &&
                anomalies.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      No anomalies found.
                    </td>
                  </tr>
                )}

            </tbody>

          </table>

        </div>


        {/* =====================================================
            PAGINATION
        ====================================================== */}

        <div className="pagination">

          <button
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1),
              )
            }
            disabled={page === 1}
          >
            Previous
          </button>


          <span>
            Page {page}{" "}
            {totalPages > 0
              ? `of ${totalPages}`
              : ""}
          </span>


          <button
            onClick={() =>
              setPage((current) => current + 1)
            }
            disabled={
              totalPages === 0 ||
              page >= totalPages
            }
          >
            Next
          </button>

        </div>

      </section>

    </AppLayout>
  );
}