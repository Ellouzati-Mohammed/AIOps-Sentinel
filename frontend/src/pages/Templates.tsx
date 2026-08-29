import { Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { templates } from '../mock/templates';

export function TemplatesPage() {
  return (
    <AppLayout title="Templates" subtitle="HDFS event templates and normalization rules">
      <section className="panel">
        <div className="toolbar no-wrap">
          <label className="search-input compact wide">
            <Search size={14} />
            <input placeholder="Search template..." />
          </label>
          <select>
            <option>All</option>
            <option>E5</option>
            <option>E13</option>
            <option>E17</option>
          </select>
        </div>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Template</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((item) => (
                <tr key={item.eventId}>
                  <td>{item.eventId}</td>
                  <td>{item.template}</td>
                  <td>{item.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}
