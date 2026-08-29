import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { blocks } from '../mock/blocks';
import { PredictionBadge } from '../components/common/PredictionBadge';

export function BlocksPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const visibleBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesSearch = !search || block.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || block.prediction === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <AppLayout title="Blocks" subtitle="HDFS block processing overview">
      <section className="panel">
        <div className="toolbar no-wrap">
          <label className="search-input compact wide">
            <Search size={14} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search block id..." />
          </label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="NORMAL">Normal</option>
            <option value="ANOMALY">Anomaly</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Block ID</th>
                <th>Events</th>
                <th>Duration</th>
                <th>INFO</th>
                <th>WARN</th>
                <th>Prediction</th>
                <th>Score</th>
                <th>Model</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {visibleBlocks.map((block) => (
                <tr key={block.id}>
                  <td><Link className="link-like" to={`/blocks/${block.id}`}>{block.id}</Link></td>
                  <td>{block.events}</td>
                  <td>{block.duration.toFixed(1)}s</td>
                  <td>{block.info}</td>
                  <td>{block.warn}</td>
                  <td><PredictionBadge prediction={block.prediction} /></td>
                  <td>{block.score.toFixed(2)}</td>
                  <td>{block.model}</td>
                  <td>{block.completed ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
