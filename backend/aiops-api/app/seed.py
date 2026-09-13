"""Reset and seed realistic HDFS data for the AIOps Sentinel dashboard."""

from datetime import datetime, timedelta
import random

from sqlalchemy import delete

from app.database import SessionLocal
from app.models import HDFSSequence, HDFSTemplate, Model, SystemMetrics


RANDOM_SEED = 20260912
HISTORY_DAYS = 7
WINDOW_HOURS = 2

EVENT_TEMPLATES = {
	"E1": "Receiving block blk_{block_id} of size {size}",
	"E2": "Verification succeeded for block blk_{block_id}",
	"E3": "PacketResponder for block blk_{block_id} terminating",
	"E4": "Deleting block blk_{block_id} file",
	"E5": "Unexpected exception while processing block blk_{block_id}",
	"E6": "Block blk_{block_id} is under-replicated",
	"E7": "DataNode reported a checksum mismatch for blk_{block_id}",
	"E8": "Block blk_{block_id} completed successfully",
}


def aligned_window_start(value: datetime) -> datetime:
	"""Return the UTC-naive start of the current two-hour window."""
	return value.replace(
		minute=0,
		second=0,
		microsecond=0,
		hour=value.hour - (value.hour % WINDOW_HOURS),
	)


def reset_database(session) -> None:
	"""Delete rows in foreign-key order while keeping all tables intact."""
	session.execute(delete(HDFSSequence))
	session.execute(delete(SystemMetrics))
	session.execute(delete(HDFSTemplate))
	session.execute(delete(Model))
	session.commit()


def seed_templates(session) -> None:
	session.add_all(
		HDFSTemplate(event_id=event_id, template=template)
		for event_id, template in EVENT_TEMPLATES.items()
	)


def seed_model(session) -> Model:
	model = Model(
		name="BiLSTM-HDFS",
		version="1.0.0",
		description="BiLSTM model trained for HDFS block anomaly detection",
		model_type="sequence_classifier",
		framework="PyTorch",
		model_path="ML/best_bilstm_model.pth",
		input_features=["event_sequence", "num_events", "duration", "num_info", "num_warn"],
		threshold=0.70,
		is_active=True,
	)
	session.add(model)
	session.flush()
	return model


def build_sequence(rng: random.Random, block_number: int, period_start: datetime, model_id: int) -> HDFSSequence:
	is_anomaly = rng.random() < 0.12
	prediction = "ANOMALY" if is_anomaly else "NORMAL"

	if is_anomaly:
		num_events = rng.randint(8, 18)
		score = round(rng.uniform(0.76, 0.99), 4)
		duration = round(rng.uniform(3.5, 10.0), 3)
		num_warn = rng.randint(1, max(2, num_events // 3))
		event_pool = ["E1", "E2", "E5", "E6", "E7", "E8"]
	else:
		num_events = rng.randint(4, 11)
		score = round(rng.uniform(0.01, 0.48), 4)
		duration = round(rng.uniform(0.8, 4.2), 3)
		num_warn = rng.choices([0, 1, 2], weights=[70, 25, 5])[0]
		event_pool = ["E1", "E2", "E3", "E4", "E8"]

	num_info = num_events - num_warn
	event_sequence = [rng.choice(event_pool) for _ in range(num_events)]
	completed_at = period_start + timedelta(
		minutes=rng.randint(5, 115),
		seconds=rng.randint(0, 59),
	)

	return HDFSSequence(
		block_id=f"blk_{block_number:08d}",
		event_sequence=event_sequence,
		num_events=num_events,
		duration=duration,
		num_info=num_info,
		num_warn=num_warn,
		prediction=prediction,
		score=score,
		model_id=model_id,
		completed_at=completed_at,
		created_at=completed_at - timedelta(seconds=rng.randint(1, 30)),
	)


def build_snapshot(period_end: datetime, sequences: list[HDFSSequence]) -> SystemMetrics:
	total_predictions = len(sequences)
	normal_predictions = sum(item.prediction == "NORMAL" for item in sequences)
	anomaly_predictions = total_predictions - normal_predictions
	scores = [item.score for item in sequences]
	durations = [item.duration for item in sequences]
	event_counts = [item.num_events for item in sequences]
	info_logs = sum(item.num_info for item in sequences)
	warn_logs = sum(item.num_warn for item in sequences)

	return SystemMetrics(
		logs_received=info_logs + warn_logs,
		blocks_completed=total_predictions,
		normal_predictions=normal_predictions,
		anomaly_predictions=anomaly_predictions,
		total_predictions=total_predictions,
		anomaly_rate=round(anomaly_predictions / total_predictions * 100, 2),
		normal_rate=round(normal_predictions / total_predictions * 100, 2),
		avg_score=round(sum(scores) / len(scores), 4),
		max_score=max(scores),
		min_score=min(scores),
		avg_block_duration=round(sum(durations) / len(durations), 3),
		max_block_duration=max(durations),
		min_block_duration=min(durations),
		avg_events_per_block=round(sum(event_counts) / len(event_counts), 2),
		max_events_per_block=max(event_counts),
		info_logs=info_logs,
		warn_logs=warn_logs,
		created_at=period_end,
	)


def seed_database() -> None:
	rng = random.Random(RANDOM_SEED)
	session = SessionLocal()

	try:
		# The schema already exists; this intentionally does not call create_all().
		reset_database(session)
		seed_templates(session)
		model = seed_model(session)

		now = datetime.utcnow()
		latest_window_end = aligned_window_start(now)
		first_window_start = latest_window_end - timedelta(days=HISTORY_DAYS)
		block_number = 1
		snapshots = []
		current_start = first_window_start

		while current_start < latest_window_end:
			current_end = current_start + timedelta(hours=WINDOW_HOURS)
			window_sequences = [
				build_sequence(rng, block_number + index, current_start, model.id)
				for index in range(rng.randint(6, 14))
			]
			block_number += len(window_sequences)
			session.add_all(window_sequences)
			snapshots.append(build_snapshot(current_end, window_sequences))
			current_start = current_end

		session.add_all(snapshots)
		session.commit()
		print(
			f"Seed complete: {len(snapshots)} two-hour snapshots, "
			f"{block_number - 1} HDFS blocks, {len(EVENT_TEMPLATES)} templates."
		)
	except Exception:
		session.rollback()
		raise
	finally:
		session.close()


if __name__ == "__main__":
	seed_database()
