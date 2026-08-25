import asyncio
from pathlib import Path

from app.services.block_manager import BlockManager
import app.services.block_manager as block_manager_module


# ==========================================================
# CONFIGURATION
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "app"
    / "data"
    / "event_templates_drain3.csv"
)


# ==========================================================
# TEST
# ==========================================================

async def run_test():

    # ------------------------------------------------------
    # Pour le test uniquement :
    # 60 secondes -> 3 secondes
    # ------------------------------------------------------

    block_manager_module.BLOCK_TIMEOUT = 3

    manager = BlockManager(
        str(TEMPLATE_FILE)
    )

    print("\n")
    print("=" * 70)
    print("       TEST BLOCK MANAGER + PREDICTION")
    print("=" * 70)

    # ======================================================
    # 1. LOGS DU BLOCK
    # ======================================================

    logs = [

        (
            "081109 213809 33 INFO dfs.FSNamesystem: "
            "BLOCK* NameSystem.addStoredBlock: "
            "blockMap updated: 10.251.75.163:50010 "
            "is added to blk_-001 size 3548529"
        ),

        (
            "081109 213810 34 INFO dfs.DataBlockScanner: "
            "Verification succeeded for blk_-001"
        ),

        (
            "081109 213811 35 WARN dfs.DataNode: "
            "PacketResponder 1 for block blk_-001 "
            "received exception"
        )
    ]

    # ======================================================
    # 2. ENVOYER LES LOGS AU BLOCK MANAGER
    # ======================================================

    print("\n[TEST] Envoi des logs...")

    await manager.process_logs(
        logs
    )

    # ======================================================
    # 3. VÉRIFIER QUE LE BLOCK EST ACTIF
    # ======================================================

    active_blocks = (
        manager.get_active_blocks()
    )

    print(
        "\n[TEST] Blocks actifs :"
    )

    print(
        active_blocks
    )

    assert (
        "blk_-001"
        in active_blocks
    )

    print(
        "[OK] Le block a été créé."
    )

    # ======================================================
    # 4. IMMÉDIATEMENT APRÈS LES LOGS
    # ======================================================

    completed = (
        manager.get_completed_blocks()
    )

    print(
        "\n[TEST] Blocks terminés immédiatement :"
    )

    print(
        completed
    )

    assert completed == []

    print(
        "[OK] Aucun block terminé immédiatement."
    )

    # ======================================================
    # 5. ATTENDRE LE TIMEOUT
    # ======================================================

    print(
        "\n[TEST] Attente de 4 secondes..."
    )

    await asyncio.sleep(
        4
    )

    # ======================================================
    # 6. LE BLOCK DOIT ÊTRE TERMINÉ
    # ======================================================

    active_blocks = (
        manager.get_active_blocks()
    )

    print(
        "\n[TEST] Blocks actifs après timeout :"
    )

    print(
        active_blocks
    )

    assert (
        "blk_-001"
        not in active_blocks
    )

    print(
        "[OK] Le block est terminé."
    )

    # ======================================================
    # 7. RÉCUPÉRER LE BLOCK TERMINÉ
    # ======================================================

    completed = (
        manager.get_completed_blocks()
    )

    print(
        "\n"
        + "=" * 70
    )

    print(
        "              BLOCK TERMINÉ"
    )

    print(
        "=" * 70
    )

    for block in completed:

        print(
            "\nJSON :"
        )

        print(
            block
        )

    # ======================================================
    # 8. VÉRIFIER QU'IL Y A UN BLOCK
    # ======================================================

    assert len(completed) == 1

    block = completed[0]

    # ======================================================
    # 9. VÉRIFIER LES CHAMPS DU BLOCK
    # ======================================================

    assert (
        "block_id"
        in block
    )

    assert (
        "event_sequence"
        in block
    )

    assert (
        "num_events"
        in block
    )

    assert (
        "duration"
        in block
    )

    assert (
        "num_info"
        in block
    )

    assert (
        "num_warn"
        in block
    )

    # ======================================================
    # 10. VÉRIFIER LES CHAMPS DE PRÉDICTION
    # ======================================================

    assert (
        "prediction"
        in block
    )

    assert (
        "score"
        in block
    )

    assert (
        "model"
        in block
    )

    print(
        "\n[OK] Champs de prédiction présents."
    )

    # ======================================================
    # 11. AFFICHER LA PRÉDICTION
    # ======================================================

    print(
        "\nPrediction :"
    )

    print(
        block["prediction"]
    )

    print(
        "\nScore :"
    )

    print(
        block["score"]
    )

    print(
        "\nModel :"
    )

    print(
        block["model"]
    )

    # ======================================================
    # 12. VÉRIFICATIONS SUPPLÉMENTAIRES
    # ======================================================

    assert (
        block["block_id"]
        == "blk_-001"
    )

    assert (
        block["num_events"]
        == len(
            block["event_sequence"]
        )
    )

    assert (
        block["num_info"]
        == 2
    )

    assert (
        block["num_warn"]
        == 1
    )

    assert (
        block["model"]
        == "BiLSTM-HDFS"
    )

    # ======================================================
    # FIN
    # ======================================================

    print(
        "\n"
        + "=" * 70
    )

    print(
        "          TEST RÉUSSI"
    )

    print(
        "=" * 70
    )


# ==========================================================
# PYTEST
# ==========================================================

def test_block_manager_prediction():

    asyncio.run(
        run_test()
    )