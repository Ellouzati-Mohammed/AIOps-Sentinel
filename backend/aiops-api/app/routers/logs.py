import os
import logging
from math import ceil

from elasticsearch import Elasticsearch
from fastapi import APIRouter, Query
from pydantic import BaseModel
from pathlib import Path

from app.services.block_manager import BlockManager


router = APIRouter(
    prefix="/api/logs",
    tags=["logs"]
)

logger = logging.getLogger(__name__)


# ==========================================================
# TEMPLATE FILE
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "data"
    / "event_templates_drain3.csv"
)


# ==========================================================
# UNE SEULE INSTANCE DU BLOCK MANAGER
#
# Elle reste active pendant toute la durée
# de fonctionnement de l'application.
# ==========================================================

block_manager = BlockManager(
    str(TEMPLATE_FILE)
)

es = Elasticsearch(
    os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
)
ELASTICSEARCH_INDEX = "hdfs-raw-logs"


def escape_wildcard_value(value: str) -> str:
    """Keep user input literal while using it inside a wildcard query."""
    return value.replace("\\", "\\\\").replace("*", "\\*").replace("?", "\\?")


# ==========================================================
# MODEL D'UN LOG
# ==========================================================

class LogEvent(BaseModel):

    message: str


@router.get("")
def list_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
):
    """Return paginated Elasticsearch logs with only time and message."""
    filters: list[dict] = []
    if search and search.strip():
        search_value = escape_wildcard_value(search.strip())
        filters.append({
            "bool": {
                "should": [
                    {
                        "wildcard": {
                            "message.keyword": {
                                "value": f"*{search_value}*",
                                "case_insensitive": True,
                            }
                        }
                    },
                    {
                        "wildcard": {
                            "event.original.keyword": {
                                "value": f"*{search_value}*",
                                "case_insensitive": True,
                            }
                        }
                    },
                ],
                "minimum_should_match": 1,
            }
        })

    logger.info(
        "[Logs API] search=%r page=%d page_size=%d filters=%s",
        search,
        page,
        page_size,
        filters,
    )

    response = es.search(
        index=ELASTICSEARCH_INDEX,
        from_=(page - 1) * page_size,
        size=page_size,
        query={"bool": {"filter": filters}} if filters else {"match_all": {}},
        sort=[{"@timestamp": {"order": sort_order}}],
    )

    total = response["hits"]["total"]
    total = total["value"] if isinstance(total, dict) else total
    items = []
    for hit in response["hits"]["hits"]:
        source = hit.get("_source", {})
        items.append({
            "time": source.get("@timestamp"),
            "message": source.get("message", ""),
        })

    logger.info(
        "[Logs API] total=%d returned=%d first_message=%r",
        total,
        len(items),
        items[0]["message"] if items else None,
    )

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": ceil(total / page_size) if total else 0,
    }


# ==========================================================
# RECEVOIR LES LOGS
# ==========================================================

@router.post("")
async def receive_logs(
    logs: list[LogEvent]
):

    print(
        "\n========== LOGS REÇUS PAR L'API =========="
    )

    # ------------------------------------------------------
    # Afficher les logs reçus
    # ------------------------------------------------------

    for i, log in enumerate(
        logs,
        start=1
    ):

        print(
            f"[LOG {i}] {log.message}"
        )

    print(
        "==========================================\n"
    )

    # ------------------------------------------------------
    # Transformer les objets Pydantic
    # en simples chaînes
    # ------------------------------------------------------

    raw_logs = [
        log.message
        for log in logs
    ]

    # ------------------------------------------------------
    # Envoyer les logs au BlockManager
    #
    # IMPORTANT :
    # Le BlockManager ne va pas attendre 60 secondes ici.
    #
    # Il crée simplement / met à jour les blocks
    # et lance les timers en arrière-plan.
    # ------------------------------------------------------

    await block_manager.process_logs(
        raw_logs
    )

    # ------------------------------------------------------
    # Vérifier s'il existe des blocks qui étaient
    # déjà terminés avant cette requête
    # ------------------------------------------------------

    completed_blocks = (
        block_manager.get_completed_blocks()
    )

    # ------------------------------------------------------
    # Affichage des blocks terminés
    # ------------------------------------------------------

    print(
        "\n========== BLOCKS TERMINÉS =========="
    )

    if completed_blocks:

        for block in completed_blocks:

            print(
                "\n"
                f"BlockId    : "
                f"{block['block_id']}"
            )

            print(
                f"Prediction : "
                f"{block.get('prediction')}"
            )

            print(
                f"Score      : "
                f"{block.get('score')}"
            )

            print(
                f"Model      : "
                f"{block.get('model')}"
            )

    else:

        print(
            "Aucun block terminé pour le moment."
        )

    print(
        "=====================================\n"
    )

    # ------------------------------------------------------
    # Réponse API
    # ------------------------------------------------------

    return {

        "status": "received",

        "count": len(logs),

        "completed_blocks":
            completed_blocks
    }