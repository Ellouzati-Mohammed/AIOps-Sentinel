import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Header title={title} subtitle={subtitle} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
