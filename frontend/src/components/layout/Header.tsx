import { Bell, Clock3, RefreshCcw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="top-header">
      <div className="header-main">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>

        <div className="header-actions">
          <div className="time-range">
            <Clock3 size={14} />
            <select defaultValue="24h" aria-label="Time range selector">
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>

          <button className="icon-button" aria-label="Refresh dashboard">
            <RefreshCcw size={16} />
          </button>

          <div className="system-status">
            <span className="status-dot" />
            <span>System Operational</span>
          </div>

          <button className="icon-button" aria-label="Notifications">
            <Bell size={16} />
          </button>

          <div className="user-avatar">
            <span>AS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
