import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useModels } from '../hooks/useModels';

export function ModelsPage() {
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const modelState = useModels(sortBy, sortOrder);

  return (
    <AppLayout title="Models" subtitle="Machine learning model catalog and status monitor">
      <div className="toolbar no-wrap">
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="updated_at">Sort: Updated</option>
          <option value="created_at">Sort: Created</option>
          <option value="name">Sort: Name</option>
          <option value="threshold">Sort: Threshold</option>
        </select>
        <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      <div className="models-grid">
        {modelState.loading && <p>Loading models...</p>}
        {modelState.error && <p role="alert">Unable to load models.</p>}
        {modelState.data.map((model) => (
          <section className="panel model-card" key={model.name}>
            <div className="model-card-header">
              <div>
                <h3>{model.name}</h3>
                <p>Version {model.version ?? 'N/A'}</p>
              </div>
              <span className={`badge ${model.is_active ? 'badge-success' : 'badge-danger'}`}>
                {model.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <div className="model-meta-grid">
              <div>
                <label>Model type</label>
                <strong>{model.model_type}</strong>
              </div>
              <div>
                <label>Framework</label>
                <strong>{model.framework}</strong>
              </div>
              <div className="wide">
                <label>Input features</label>
                <strong>{model.input_features?.join(', ') || 'N/A'}</strong>
              </div>
              <div>
                <label>Status</label>
                <strong>{model.is_active ? 'Active' : 'Inactive'}</strong>
              </div>
              <div>
                <label>Threshold</label>
                <strong>{model.threshold === null ? 'N/A' : model.threshold.toFixed(2)}</strong>
              </div>
              <div className="wide">
                <label>Model path</label>
                <strong>{model.model_path}</strong>
              </div>
              <div className="wide">
                <label>Updated at</label>
                <strong>{new Date(`${model.updated_at}Z`).toLocaleString('fr-FR')}</strong>
              </div>
            </div>

            <button className="primary-button">View model</button>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
