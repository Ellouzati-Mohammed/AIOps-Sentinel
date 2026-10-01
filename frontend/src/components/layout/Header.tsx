import { Bell} from 'lucide-react';

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
