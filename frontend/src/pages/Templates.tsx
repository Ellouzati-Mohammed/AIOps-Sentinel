import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { DataTable } from "../components/common/DataTable";
import { useHDFSTemplates } from "../hooks/useHDFSTemplates";

function formatDate(value: string): string {
  return new Date(`${value}Z`).toLocaleString("fr-FR");
}

export function TemplatesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: templates,
    loading,
    error,
  } = useHDFSTemplates(sortBy, sortOrder);

  const eventIds = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          templates.map((item) => item.event_id),
        ),
      ).sort(),
    ],
    [templates],
  );

  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((item) => {
      const matchesSearch =
        !query ||
        item.event_id.toLowerCase().includes(query) ||
        item.template.toLowerCase().includes(query);

      const matchesEvent =
        eventId === "All" ||
        item.event_id === eventId;

      return matchesSearch && matchesEvent;
    });
  }, [eventId, search, templates]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  return (
    <AppLayout
      title="Templates"
      subtitle="HDFS event templates and normalization rules"
    >
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
              placeholder="Search template..."
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
            value={eventId}
            onChange={(event) =>
              setEventId(event.target.value)
            }
          >
            {eventIds.map((id) => (
              <option
                key={id}
                value={id}
              >
                {id}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="created_at">
              Sort: Created
            </option>

            <option value="event_id">
              Sort: Event ID
            </option>

            <option value="id">
              Sort: ID
            </option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value as "asc" | "desc",
              )
            }
          >
            <option value="desc">
              Descending
            </option>

            <option value="asc">
              Ascending
            </option>
          </select>

        </div>

        <DataTable>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Event ID</th>
                <th>Template</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan={4}>
                    Loading templates...
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={4}>
                    Unable to load templates.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                visibleTemplates.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.event_id}</td>
                    <td>{item.template}</td>
                    <td>
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}

              {!loading &&
                !error &&
                visibleTemplates.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      No templates found.
                    </td>
                  </tr>
                )}

            </tbody>
          </table>
        </DataTable>

      </section>
    </AppLayout>
  );
}