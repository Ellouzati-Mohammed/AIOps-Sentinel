import asyncio
from pathlib import Path

from app.services.block_manager import BlockManager


BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "app"
    / "data"
    / "event_templates_drain3.csv"
)


async def run_test():

    manager = BlockManager(
        str(TEMPLATE_FILE)
    )

    print("\n" + "=" * 70)
    print("       TEST BLOCK MANAGER - FONCTIONNEMENT CONTINU")
    print("=" * 70)

    # ==========================================================
    # 1. Créer BLOCK A
    # ==========================================================

    log_a1 = (
        "081109 213809 33 INFO dfs.FSNamesystem: "
        "BLOCK* NameSystem.addStoredBlock: "
        "blockMap updated: 10.251.75.163:50010 "
        "is added to blk_-100001 size 3548529"
    )

    await manager.process_log(log_a1)

    print("\n[TEST] Block A créé")

    # ==========================================================
    # 2. Créer BLOCK B
    # ==========================================================

    log_b1 = (
        "081109 213810 34 INFO dfs.DataNode: "
        "Receiving block blk_-200002 "
        "src: /10.0.0.1:50020 "
        "dest: /10.0.0.2:50030"
    )

    await manager.process_log(log_b1)

    print("[TEST] Block B créé")

    # ==========================================================
    # 3. Vérifier les blocks actifs
    # ==========================================================

    active = manager.get_active_blocks()

    print("\n[TEST] Blocks actifs :")
    print(active)

    assert "blk_-100001" in active
    assert "blk_-200002" in active

    # ==========================================================
    # 4. Attendre 3 secondes
    # ==========================================================

    print("\n[TEST] Attente de 3 secondes...")

    await asyncio.sleep(3)

    # ==========================================================
    # 5. Ajouter un nouveau log au BLOCK A
    # ==========================================================

    log_a2 = (
        "081109 213812 35 WARN dfs.DataNode: "
        "PacketResponder 1 for block blk_-100001 "
        "received exception"
    )

    await manager.process_log(log_a2)

    print("\n[TEST] Nouveau log ajouté au BLOCK A")
    print("[TEST] Timer du BLOCK A réinitialisé")

    # ==========================================================
    # 6. Vérifier les blocks actifs
    # ==========================================================

    active = manager.get_active_blocks()

    print("\n[TEST] Blocks actifs après A2 :")
    print(active)

    assert "blk_-100001" in active
    assert "blk_-200002" in active

    # ==========================================================
    # 7. Attendre 8 secondes
    #
    # B :
    #   création t=0
    #   timeout = 10 sec
    #
    # A :
    #   nouveau log t=3
    #   nouveau timeout = t=13
    #
    # À t=11 :
    #   B terminé
    #   A encore actif
    # ==========================================================

    print("\n[TEST] Attente de 8 secondes...")

    await asyncio.sleep(8)

    active = manager.get_active_blocks()

    print("\n[TEST] Blocks actifs après 11 secondes :")
    print(active)

    assert "blk_-200002" not in active
    assert "blk_-100001" in active

    # ==========================================================
    # 8. Attendre 3 secondes supplémentaires
    #
    # A doit maintenant terminer.
    # ==========================================================

    print("\n[TEST] Attente de 3 secondes supplémentaires...")

    await asyncio.sleep(3)

    active = manager.get_active_blocks()

    print("\n[TEST] Blocks actifs finaux :")
    print(active)

    assert "blk_-100001" not in active

    # ==========================================================
    # 9. Récupérer les blocks terminés
    # ==========================================================

    completed = manager.get_completed_blocks()

    print("\n" + "=" * 70)
    print("              BLOCKS TERMINÉS")
    print("=" * 70)

    for block in completed:

        print("\nJSON DU BLOCK :")
        print(block)

    # ==========================================================
    # 10. Vérifier qu'on a bien 2 blocks
    # ==========================================================

    assert len(completed) == 2

    # ==========================================================
    # 11. Vérifier la structure
    # ==========================================================

    for block in completed:

        assert "block_id" in block
        assert "event_sequence" in block
        assert "num_events" in block
        assert "duration" in block
        assert "num_info" in block
        assert "num_warn" in block

    # ==========================================================
    # 12. Vérifier BLOCK A
    # ==========================================================

    block_a = next(
        block
        for block in completed
        if block["block_id"] == "blk_-100001"
    )

    assert block_a["num_events"] == 2

    assert block_a["event_sequence"] == [
        "E5",
        "E3"
    ]

    assert block_a["num_info"] == 1
    assert block_a["num_warn"] == 1

    # ==========================================================
    # 13. Vérifier BLOCK B
    # ==========================================================

    block_b = next(
        block
        for block in completed
        if block["block_id"] == "blk_-200002"
    )

    assert block_b["num_events"] == 1

    assert block_b["event_sequence"] == [
        "E1"
    ]

    assert block_b["num_info"] == 1
    assert block_b["num_warn"] == 0

    # ==========================================================
    # TEST TERMINÉ
    # ==========================================================

    print("\n" + "=" * 70)
    print("                    TEST RÉUSSI")
    print("=" * 70)


def test_block_manager_continuous():

    asyncio.run(
        run_test()
    )