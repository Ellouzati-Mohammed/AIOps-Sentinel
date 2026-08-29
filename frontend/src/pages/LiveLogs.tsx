import { Pause, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { logEntries } from '../mock/logs';

const levels = ['All', 'INFO', 'WARN', 'ERROR'];
const sources = ['All', 'api', 'filebeat', 'logstash', 'database', 'ml'];

export function LiveLogsPage() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const [source, setSource] = useState('All');
  const [block, setBlock] = useState('');
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return logEntries.filter((entry) => {
      const queryMatch = !query || entry.message.toLowerCase().includes(query.toLowerCase()) || entry.blockId.toLowerCase().includes(query.toLowerCase());
      const levelMatch = level === 'All' || entry.level === level;
      const sourceMatch = source === 'All' || entry.source === source;
      const blockMatch = !block || entry.blockId.toLowerCase().includes(block.toLowerCase());
      return queryMatch && levelMatch && sourceMatch && blockMatch;
    });
  }, [query, level, source, block]);

  const paginatedLogs = filteredLogs.slice((page - 1) * 8, page * 8);

  return (
    <AppLayout title="Live Logs" subtitle="Real-time stream of operational events">
      <section className="panel panel-logs">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="live-pill"><span className="live-dot" /> Live</div>
            <label className="search-input compact">
              <Search size={14} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search logs..." />
            </label>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="All">Level</option>
              {levels.filter((option) => option !== 'All').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="All">Source</option>
              {sources.filter((option) => option !== 'All').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input value={block} onChange={(event) => setBlock(event.target.value)} placeholder="Block ID" />
          </div>
          <div className="toolbar-right">
            <button className="secondary-button"><Pause size={14} /> Pause live stream</button>
            <button className="secondary-button"><Trash2 size={14} /> Clear</button>
            <button className="secondary-button"><RefreshCcw size={14} /> Refresh</button>
          </div>
        </div>

        <div className="table-shell logs-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Block</th>
                <th>Source</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((entry) => (
                <tr key={`${entry.timestamp}-${entry.blockId}-${entry.message}`}>
                  <td>{entry.timestamp}</td>
                  <td><span className={`log-level ${entry.level.toLowerCase()}`}>{entry.level}</span></td>
                  <td className="mono">{entry.blockId}</td>
                  <td>{entry.source}</td>
                  <td>{entry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
          <span>Page {page}</span>
          <button onClick={() => setPage((current) => current + 1)} disabled={page * 8 >= filteredLogs.length}>Next</button>
        </div>
      </section>
    </AppLayout>
  );
}
