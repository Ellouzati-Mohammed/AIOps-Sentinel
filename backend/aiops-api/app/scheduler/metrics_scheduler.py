import asyncio
import logging
from datetime import datetime, timedelta

from app.services.metrics_service import save_hourly_snapshot


logger = logging.getLogger(__name__)


async def metrics_scheduler():
    """
    Exécute la génération des métriques toutes les 60 secondes
    pour les tests.
    """

    while True:
        try:
            now = datetime.utcnow()

            end_time = now
            start_time = end_time - timedelta(seconds=60)

            logger.info(
                f"[Metrics Scheduler] "
                f"Calcul des métriques : {start_time} → {end_time}"
            )

            await asyncio.to_thread(
                save_hourly_snapshot,
                start_time,
                end_time
            )

            logger.info(
                "[Metrics Scheduler] Snapshot sauvegardé."
            )

            await asyncio.sleep(60)

        except Exception as e:
            logger.exception(
                f"[Metrics Scheduler] Erreur : {e}"
            )

            await asyncio.sleep(60)