import {
  Activity,
  BarChart3,
  Blocks,
  BrainCircuit,
  Cpu,
  FileCode,
  Gauge,
  LayoutDashboard,
  Radio,
  Settings,
  TriangleAlert,
  ShieldCheck,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    title: 'OBSERVABILITY',
    items: [
      { label: 'Live Logs', to: '/logs', icon: Radio },
      { label: 'Blocks', to: '/blocks', icon: Blocks },
      { label: 'Templates', to: '/templates', icon: FileCode },
      { label: 'System Metrics', to: '/system-metrics', icon: Activity },
    ],
  },
  {
    title: 'AI / DETECTION',
    items: [
      { label: 'Anomalies', to: '/anomalies', icon: TriangleAlert },
      { label: 'Predictions', to: '/predictions', icon: BrainCircuit },
      { label: 'Models', to: '/models', icon: Cpu },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      { label: 'Performance', to: '/performance', icon: Gauge },
    ],
  },
  {
    title: 'SYSTEM',
    items: [{ label: 'Settings', to: '/settings', icon: Settings }],
  },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <ShieldCheck size={18} />
        </div>
        <div>
          <span className="logo-name">AIOps Sentinel</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {navSections.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            <ul>
              {section.items.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                    end={to === '/'}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
