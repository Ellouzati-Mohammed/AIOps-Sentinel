import { RefreshCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { getLogs, type LogRecord } from '../api/systemMetrics.api';

export function LiveLogsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);
    getLogs(page, pageSize, query, sortOrder)
      .then((result) => {
        setLogs(result.items);
        setTotalPages(result.total_pages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch logs'))
      .finally(() => setLoading(false));
  }, [page, query, sortOrder]);

  const handleSearch = () => {
    const nextQuery = searchInput.trim();
    setQuery(nextQuery);
    setPage(1);
  };

  return (
    <AppLayout title="Live Logs" subtitle="Real-time stream of operational events">
      <section className="panel panel-logs">
        <div className="toolbar">
          <div className="toolbar-left">
            <label className="search-input compact">
              <Search size={14} />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
                placeholder="Search logs..."
              />
            </label>
            <button className="primary-button" onClick={handleSearch} type="button">
              <Search size={14} /> Search
            </button>
            <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as 'asc' | 'desc'); setPage(1); }}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="secondary-button" onClick={() => { setSearchInput(''); setQuery(''); setPage(1); }}><RefreshCcw size={14} /> Refresh</button>
          </div>
        </div>

        <div className="table-shell logs-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={2}>Chargement des logs...</td></tr>}
              {error && <tr><td colSpan={2}>Impossible de charger les logs.</td></tr>}
              {!loading && !error && logs.map((entry, index) => (
                <tr key={`${entry.time}-${index}-${entry.message}`}>
                  <td>{entry.time ? new Date(entry.time).toLocaleTimeString('fr-FR') : '-'}</td>
                  <td>{entry.message}</td>
                </tr>
              ))}
              {!loading && !error && logs.length === 0 && <tr><td colSpan={2}>Aucun log trouvé.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
          <span>Page {page}</span>
          <button onClick={() => setPage((current) => current + 1)} disabled={totalPages === 0 || page >= totalPages}>Next</button>
        </div>
      </section>
    </AppLayout>
  );
}
