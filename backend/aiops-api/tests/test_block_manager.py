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


def test_block_manager():

    manager = BlockManager(
        str(TEMPLATE_FILE)
    )

    logs = [

        # =====================================================
        # BLOCK 1
        # =====================================================

        "081109 213809 33 INFO dfs.FSNamesystem: BLOCK* NameSystem.addStoredBlock: blockMap updated: 10.251.75.163:50010 is added to blk_-100001 size 3548529",

        "081109 213810 34 INFO dfs.DataNode: Receiving block blk_-100001 src: /10.0.0.1:50020 dest: /10.0.0.2:50030",

        "081109 213812 35 WARN dfs.DataNode: PacketResponder blk_-100001 received exception java.io.IOException",


        # =====================================================
        # BLOCK 2
        # =====================================================

        "081109 213815 40 INFO dfs.FSNamesystem: BLOCK* NameSystem.addStoredBlock: blockMap updated: 10.251.75.164:50010 is added to blk_-200002 size 123456",

        "081109 213817 41 INFO dfs.DataNode: Receiving block blk_-200002 src: /10.0.0.3:50020 dest: /10.0.0.4:50030",
    ]


    async def run_test():

        print("\n")
        print("=" * 70)
        print("                  BLOCK MANAGER TEST")
        print("=" * 70)

        # -----------------------------------------------------
        # Envoi des logs au BlockManager
        # -----------------------------------------------------

        print("\nEnvoi des logs...")

        await manager.process_logs(logs)

        # -----------------------------------------------------
        # Afficher les blocks actuellement actifs
        # -----------------------------------------------------

        print("\nBlocks actifs :")

        for block_id in manager.get_active_blocks():
            print(f"  - {block_id}")

        # -----------------------------------------------------
        # Attendre le timeout
        # -----------------------------------------------------

        print("\nAttente de 11 secondes...")
        print("(Timeout du BlockManager = 10 secondes)")

        await asyncio.sleep(11)

        # -----------------------------------------------------
        # Vérifier les blocks
        # -----------------------------------------------------

        print("\nBlocks actifs après timeout :")

        active_blocks = manager.get_active_blocks()

        for block_id in active_blocks:
            print(f"  - {block_id}")

        if not active_blocks:
            print("  Aucun block actif")

        print("\n")
        print("=" * 70)
        print("                       FIN TEST")
        print("=" * 70)


    asyncio.run(run_test())