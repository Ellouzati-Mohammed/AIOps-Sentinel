import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { blocks } from '../mock/blocks';
import { PredictionBadge } from '../components/common/PredictionBadge';

export function BlockDetailsPage() {
  const { blockId } = useParams();

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === blockId) ?? blocks[0],
    [blockId],
  );

  return (
    <AppLayout title={`Block ${selectedBlock.id}`} subtitle="Detailed block analysis">
      <section className="panel">
        <div className="detail-grid">
          <div className="detail-card">
            <label>Prediction</label>
            <div><PredictionBadge prediction={selectedBlock.prediction} /></div>
          </div>
          <div className="detail-card">
            <label>Score</label>
            <div>{selectedBlock.score.toFixed(2)}</div>
          </div>
          <div className="detail-card">
            <label>Model</label>
            <div>{selectedBlock.model}</div>
          </div>
          <div className="detail-card">
            <label>Duration</label>
            <div>{selectedBlock.duration.toFixed(1)} seconds</div>
          </div>
          <div className="detail-card">
            <label>Number of events</label>
            <div>{selectedBlock.events}</div>
          </div>
          <div className="detail-card">
            <label>INFO</label>
            <div>{selectedBlock.info}</div>
          </div>
          <div className="detail-card">
            <label>WARN</label>
            <div>{selectedBlock.warn}</div>
          </div>
        </div>

        <div className="timeline-block">
          <h3>Event sequence</h3>
          <div className="timeline">
            {selectedBlock.eventSequence.map((event, index) => (
              <div key={`${event}-${index}`} className="timeline-item">
                <span className="timeline-node" />
                <span>{event}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
