import asyncio
from typing import Dict, List, Optional

from app.services.log_parser import LogParser
from app.services.template_matcher import TemplateMatcher


BLOCK_TIMEOUT = 60  # secondes


class BlockManager:

    def __init__(self, template_file: str):

        self.parser = LogParser()

        self.matcher = TemplateMatcher(
            template_file
        )

        # block_id -> données du bloc
        self.blocks: Dict[str, dict] = {}

        # block_id -> timer asyncio
        self.timers: Dict[str, asyncio.Task] = {}

        # Blocks terminés
        self.completed_blocks: List[dict] = []

    # ==========================================================
    # TRAITEMENT D'UN BATCH
    # ==========================================================

    async def process_logs(
        self,
        logs: List[str]
    ) -> List[dict]:

        for log in logs:
            await self.process_log(log)

        # Retourner les blocks qui étaient déjà terminés
        return self.get_completed_blocks()

    # ==========================================================
    # TRAITEMENT D'UN LOG
    # ==========================================================

    async def process_log(
        self,
        log: str
    ) -> Optional[dict]:

        # ------------------------------------------------------
        # 1. Parser
        # ------------------------------------------------------

        parsed = self.parser.parse(log)

        if parsed is None:
            print(
                "[BlockManager] Log ignoré : format invalide"
            )
            return None

        block_id = parsed["block_id"]

        if block_id is None:
            print(
                "[BlockManager] Log ignoré : BlockId absent"
            )
            return None

        # ------------------------------------------------------
        # 2. Template matching
        # ------------------------------------------------------

        template_result = self.matcher.match(
            parsed["content"]
        )

        if template_result is None:

            print(
                f"[BlockManager] Template introuvable "
                f"pour {block_id}"
            )

            return None

        event_id = template_result["event_id"]

        # ------------------------------------------------------
        # 3. Créer le block
        # ------------------------------------------------------

        if block_id not in self.blocks:

            self.blocks[block_id] = {

                "event_sequence": [],

                "first_time": parsed["timestamp"],

                "last_time": parsed["timestamp"],

                "num_info": 0,

                "num_warn": 0
            }

            print(
                f"[BlockManager] Nouveau block : {block_id}"
            )

        block = self.blocks[block_id]

        # ------------------------------------------------------
        # 4. Ajouter EventId
        # ------------------------------------------------------

        block["event_sequence"].append(
            event_id
        )

        # ------------------------------------------------------
        # 5. Timestamp
        # ------------------------------------------------------

        timestamp = parsed["timestamp"]

        if timestamp < block["first_time"]:

            block["first_time"] = timestamp

        if timestamp > block["last_time"]:

            block["last_time"] = timestamp

        # ------------------------------------------------------
        # 6. INFO / WARN
        # ------------------------------------------------------

        level = parsed["level"].upper()

        if level == "INFO":

            block["num_info"] += 1

        elif level == "WARN":

            block["num_warn"] += 1

        # ------------------------------------------------------
        # 7. Reset timer
        # ------------------------------------------------------

        self._reset_timer(block_id)

        return None

    # ==========================================================
    # TIMER
    # ==========================================================

    def _reset_timer(
        self,
        block_id: str
    ):

        old_timer = self.timers.get(
            block_id
        )

        if old_timer is not None:

            old_timer.cancel()

        self.timers[block_id] = (
            asyncio.create_task(
                self._finish_after_timeout(
                    block_id
                )
            )
        )

    # ==========================================================
    # FIN DU BLOCK
    # ==========================================================

    async def _finish_after_timeout(
        self,
        block_id: str
    ):

        try:

            await asyncio.sleep(
                BLOCK_TIMEOUT
            )

            block = self.blocks.get(
                block_id
            )

            if block is None:
                return

            # --------------------------------------------------
            # Duration
            # --------------------------------------------------

            duration = (
                block["last_time"]
                - block["first_time"]
            ).total_seconds()

            # --------------------------------------------------
            # JSON FINAL DU BLOCK
            # --------------------------------------------------

            result = {

                "block_id": block_id,

                "event_sequence":
                    block["event_sequence"],

                "num_events":
                    len(block["event_sequence"]),

                "duration":
                    duration,

                "num_info":
                    block["num_info"],

                "num_warn":
                    block["num_warn"]
            }

            # --------------------------------------------------
            # Affichage
            # --------------------------------------------------

            print(
                "\n[BlockManager] BLOCK TERMINÉ"
            )

            print(
                f"BlockId      : {block_id}"
            )

            print(
                f"EventSequence: "
                f"{result['event_sequence']}"
            )

            print(
                f"NumEvents    : "
                f"{result['num_events']}"
            )

            print(
                f"Duration     : "
                f"{result['duration']}"
            )

            print(
                f"NumINFO      : "
                f"{result['num_info']}"
            )

            print(
                f"NumWARN      : "
                f"{result['num_warn']}"
            )

            # --------------------------------------------------
            # Stocker le JSON terminé
            # --------------------------------------------------

            self.completed_blocks.append(
                result
            )

            # --------------------------------------------------
            # Supprimer le block actif
            # --------------------------------------------------

            del self.blocks[block_id]

            self.timers.pop(
                block_id,
                None
            )

        except asyncio.CancelledError:

            # Un nouveau log du même block est arrivé.
            pass

    # ==========================================================
    # RÉCUPÉRER LES BLOCKS TERMINÉS
    # ==========================================================

    def get_completed_blocks(self) -> List[dict]:

        completed = list(
            self.completed_blocks
        )

        # Vider la liste après récupération
        self.completed_blocks.clear()

        return completed

    # ==========================================================
    # BLOCKS ACTIFS
    # ==========================================================

    def get_active_blocks(self):

        return list(
            self.blocks.keys()
        )