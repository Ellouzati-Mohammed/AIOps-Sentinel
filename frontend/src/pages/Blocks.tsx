import { useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { PredictionBadge } from '../components/common/PredictionBadge';
import { useHDFSSequences } from '../hooks/useHDFSSequences';

const pageSize = 20;

function formatDate(value: string | null): string {
  return value ? new Date(`${value}Z`).toLocaleString('fr-FR') : '-';
}

export function BlocksPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('completed_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data: blocks, totalPages, loading, error } = useHDFSSequences(page, pageSize, search, filter, sortBy, sortOrder);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleFilter = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <AppLayout title="Blocks" subtitle="HDFS block processing overview">
      <section className="panel">
        <div className="toolbar no-wrap">
          <label className="search-input compact wide">
            <Search size={14} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }}
              placeholder="Search block id..."
            />
          </label>
          <button className="primary-button" onClick={handleSearch} type="button"><Search size={14} /> Search</button>
          <select value={filter} onChange={(event) => handleFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="NORMAL">Normal</option>
            <option value="ANOMALY">Anomaly</option>
          </select>
          <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
            <option value="completed_at">Sort: Completed</option>
            <option value="created_at">Sort: Created</option>
            <option value="score">Sort: Score</option>
            <option value="duration">Sort: Duration</option>
            <option value="num_events">Sort: Events</option>
            <option value="block_id">Sort: Block ID</option>
          </select>
          <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as 'asc' | 'desc'); setPage(1); }}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Block ID</th>
                <th>Event Sequence</th>
                <th>Events</th>
                <th>Duration</th>
                <th>INFO</th>
                <th>WARN</th>
                <th>Prediction</th>
                <th>Score</th>
                <th>Model ID</th>
                <th>Completed At</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={12}>Loading blocks...</td></tr>}
              {error && <tr><td colSpan={12}>Unable to load blocks.</td></tr>}
              {!loading && !error && blocks.map((block) => (
                <tr key={block.id}>
                  <td>{block.id}</td>
                  <td><Link className="link-like" to={`/blocks/${block.block_id}`}>{block.block_id}</Link></td>
                  <td className="mono">{block.event_sequence.join(', ')}</td>
                  <td>{block.num_events}</td>
                  <td>{block.duration.toFixed(2)}s</td>
                  <td>{block.num_info}</td>
                  <td>{block.num_warn}</td>
                  <td><PredictionBadge prediction={block.prediction} /></td>
                  <td>{block.score.toFixed(4)}</td>
                  <td>{block.model_id}</td>
                  <td>{formatDate(block.completed_at)}</td>
                  <td>{formatDate(block.created_at)}</td>
                </tr>
              ))}
              {!loading && !error && blocks.length === 0 && <tr><td colSpan={12}>No blocks found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
          <span>Page {page} {totalPages > 0 ? `of ${totalPages}` : ''}</span>
          <button onClick={() => setPage((current) => current + 1)} disabled={totalPages === 0 || page >= totalPages}>Next</button>
        </div>
      </section>
    </AppLayout>
  );
}
