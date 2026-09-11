import asyncio
from datetime import datetime
from unittest.mock import patch

import pytest

from app.scheduler.metrics_scheduler import metrics_scheduler


@pytest.mark.asyncio
async def test_metrics_scheduler_calls_snapshot():

    # ============================
    # Heure simulée
    # ============================

    start_time = datetime(2026, 9, 7, 16, 0, 0)
    end_time = datetime(2026, 9, 7, 17, 0, 0)

    # ============================
    # Mock des dépendances
    # ============================

    with patch(
        "app.scheduler.metrics_scheduler.datetime"
    ) as mock_datetime, patch(
        "app.scheduler.metrics_scheduler.save_hourly_snapshot"
    ) as mock_save_snapshot, patch(
        "app.scheduler.metrics_scheduler.asyncio.sleep"
    ) as mock_sleep:

        # Le scheduler pense qu'il est 17:00
        mock_datetime.utcnow.return_value = end_time

        # Après le premier snapshot, on arrête la boucle
        mock_sleep.side_effect = asyncio.CancelledError

        # ============================
        # Exécution du scheduler
        # ============================

        with pytest.raises(asyncio.CancelledError):

            await metrics_scheduler()

        # ============================
        # Vérification
        # ============================

        mock_save_snapshot.assert_called_once_with(
            start_time,
            end_time
        )

