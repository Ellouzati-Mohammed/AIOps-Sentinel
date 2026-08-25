from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path

from app.services.block_manager import BlockManager


router = APIRouter(
    prefix="/api/logs",
    tags=["logs"]
)


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


# ==========================================================
# MODEL D'UN LOG
# ==========================================================

class LogEvent(BaseModel):

    message: str


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