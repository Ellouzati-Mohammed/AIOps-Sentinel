import { AppLayout } from '../components/layout/AppLayout';
import { models } from '../mock/models';

export function ModelsPage() {
  return (
    <AppLayout title="Models" subtitle="Machine learning model catalog and status monitor">
      <div className="models-grid">
        {models.map((model) => (
          <section className="panel model-card" key={model.name}>
            <div className="model-card-header">
              <div>
                <h3>{model.name}</h3>
                <p>Version {model.version}</p>
              </div>
              <span className="badge badge-success">{model.status.toUpperCase()}</span>
            </div>

            <div className="model-meta-grid">
              <div>
                <label>Model type</label>
                <strong>{model.type}</strong>
              </div>
              <div>
                <label>Framework</label>
                <strong>{model.framework}</strong>
              </div>
              <div className="wide">
                <label>Input features</label>
                <strong>{model.inputFeatures.join(', ')}</strong>
              </div>
              <div>
                <label>Status</label>
                <strong>{model.status}</strong>
              </div>
              <div>
                <label>Threshold</label>
                <strong>{model.threshold.toFixed(2)}</strong>
              </div>
            </div>

            <button className="primary-button">View model</button>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
