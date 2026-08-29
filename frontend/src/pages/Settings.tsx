import { AppLayout } from '../components/layout/AppLayout';

const generalSettings = [
  { label: 'Anomaly threshold', value: '0.50' },
  { label: 'Auto refresh', value: 'Enabled' },
  { label: 'Refresh interval', value: '5 seconds' },
  { label: 'Notifications', value: 'Enabled' },
];

export function SettingsPage() {
  return (
    <AppLayout title="Settings" subtitle="Operational configuration and detection policies">
      <div className="settings-grid">
        <section className="panel settings-section">
          <div className="panel-header"><h3>General</h3></div>
          <div className="settings-list">
            {generalSettings.map((setting) => (
              <div key={setting.label} className="settings-row">
                <span>{setting.label}</span>
                <strong>{setting.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel-header"><h3>Detection</h3></div>
          <div className="settings-list">
            <div className="settings-row"><span>Minimum confidence</span><strong>0.85</strong></div>
            <div className="settings-row"><span>Auto score calibration</span><strong>Enabled</strong></div>
            <div className="settings-row"><span>Alert suppression</span><strong>2 minutes</strong></div>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel-header"><h3>Notifications</h3></div>
          <div className="settings-list">
            <div className="settings-row"><span>Email alerts</span><strong>Enabled</strong></div>
            <div className="settings-row"><span>Teams webhook</span><strong>Connected</strong></div>
            <div className="settings-row"><span>Pager escalation</span><strong>Medium</strong></div>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel-header"><h3>Appearance</h3></div>
          <div className="settings-list">
            <div className="settings-row"><span>Theme</span><strong>Light</strong></div>
            <div className="settings-row"><span>Density</span><strong>Comfortable</strong></div>
            <div className="settings-row"><span>Timezone</span><strong>UTC</strong></div>
          </div>
        </section>

        <section className="panel settings-section">
          <div className="panel-header"><h3>System</h3></div>
          <div className="settings-list">
            <div className="settings-row"><span>Cluster</span><strong>prod-eu-west-01</strong></div>
            <div className="settings-row"><span>API version</span><strong>v1.8.2</strong></div>
            <div className="settings-row"><span>Last maintenance</span><strong>2 days ago</strong></div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
