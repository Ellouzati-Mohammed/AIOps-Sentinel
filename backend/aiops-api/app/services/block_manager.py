import asyncio
from typing import Dict, List, Optional
from app.database import SessionLocal
from app.models import HDFSSequence
from app.services.log_parser import LogParser
from app.services.template_matcher import TemplateMatcher
from app.services.predictor import predict as predict_anomaly
from app.models import HDFSSequence, Model
from datetime import datetime

# ==========================================================
# CONFIGURATION
# ==========================================================

BLOCK_TIMEOUT = 30  # secondes après le dernier log


class BlockManager:

    def __init__(self, template_file: str):

        # ------------------------------------------------------
        # Services
        # ------------------------------------------------------

        self.parser = LogParser()

        self.matcher = TemplateMatcher(
            template_file
        )

        # ------------------------------------------------------
        # Blocks actifs
        #
        # block_id -> données du block
        # ------------------------------------------------------

        self.blocks: Dict[str, dict] = {}

        # ------------------------------------------------------
        # Timers
        #
        # block_id -> asyncio.Task
        # ------------------------------------------------------

        self.timers: Dict[str, asyncio.Task] = {}

        # ------------------------------------------------------
        # Blocks terminés
        # ------------------------------------------------------

        self.completed_blocks: List[dict] = []

    # ==========================================================
    # TRAITEMENT D'UN BATCH DE LOGS
    # ==========================================================

    async def process_logs(
        self,
        logs: List[str]
    ) -> None:

        """
        Traite les logs reçus par l'API.

        Important :
        cette fonction ne bloque PAS pendant BLOCK_TIMEOUT.

        Chaque block possède son propre timer.
        """
        print(
            f"\n[BlockManager] BATCH REÇU (nvlign) : {len(logs)} logs"
        )

        for log in logs:

            await self.process_log(log)

    # ==========================================================
    # TRAITEMENT D'UN LOG
    # ==========================================================

    async def process_log(
        self,
        log: str
    ) -> Optional[dict]:

        # ------------------------------------------------------
        # 1. PARSING
        # ------------------------------------------------------

        parsed = self.parser.parse(log)

        if parsed is None:

            print(
                "[BlockManager] "
                "Log ignoré : format invalide"
            )

            return None

        # ------------------------------------------------------
        # 2. RÉCUPÉRER LE BLOCK ID
        # ------------------------------------------------------

        block_id = parsed.get("block_id")

        if block_id is None:

            print(
                "[BlockManager] "
                "Log ignoré : BlockId absent"
            )

            return None

        # ------------------------------------------------------
        # 3. TEMPLATE MATCHING
        # ------------------------------------------------------

        template_result = self.matcher.match(
            parsed["content"]
        )

        if template_result is None:

            print(
                "[BlockManager] "
                f"Template introuvable pour {block_id}"
            )

            return None

        # ------------------------------------------------------
        # 4. EVENT ID
        # ------------------------------------------------------

        event_id = template_result["event_id"]

        # ------------------------------------------------------
        # 5. CRÉER LE BLOCK S'IL N'EXISTE PAS
        # ------------------------------------------------------

        if block_id not in self.blocks:

            self.blocks[block_id] = {

                "event_sequence": [],

                "first_time":
                    parsed["timestamp"],

                "last_time":
                    parsed["timestamp"],

                "num_info": 0,

                "num_warn": 0
            }

            print(
                f"[BlockManager] "
                f"Nouveau block : {block_id}"
            )

        # ------------------------------------------------------
        # 6. RÉCUPÉRER LE BLOCK
        # ------------------------------------------------------

        block = self.blocks[block_id]

        # ------------------------------------------------------
        # 7. AJOUTER EVENT ID
        # ------------------------------------------------------

        block["event_sequence"].append(
            event_id
        )
        

        # ------------------------------------------------------
        # 8. METTRE À JOUR LES TIMESTAMPS
        # ------------------------------------------------------

        timestamp = parsed["timestamp"]

        if timestamp < block["first_time"]:

            block["first_time"] = timestamp

        if timestamp > block["last_time"]:

            block["last_time"] = timestamp

        # ------------------------------------------------------
        # 9. COMPTER INFO / WARN
        # ------------------------------------------------------

        level = parsed["level"].upper()

        if level == "INFO":

            block["num_info"] += 1

        elif level == "WARN":

            block["num_warn"] += 1

        # ------------------------------------------------------
        # 10. RESET DU TIMER
        # ------------------------------------------------------

        self._reset_timer(
            block_id
        )

        return None

    # ==========================================================
    # TIMER DU BLOCK
    # ==========================================================

    def _reset_timer(
        self,
        block_id: str
    ):

        # ------------------------------------------------------
        # Annuler l'ancien timer
        # ------------------------------------------------------

        old_timer = self.timers.get(
            block_id
        )

        if old_timer is not None:

            old_timer.cancel()

        # ------------------------------------------------------
        # Créer un nouveau timer
        # ------------------------------------------------------

        self.timers[block_id] = (
            asyncio.create_task(
                self._finish_after_timeout(
                    block_id
                )
            )
        )

    # ==========================================================
    # TERMINER LE BLOCK
    # ==========================================================

    async def _finish_after_timeout(
        self,
        block_id: str
    ):

        try:

            # --------------------------------------------------
            # Attendre 60 secondes depuis le dernier log
            # --------------------------------------------------

            print(
                f"[DEBUG] TIMER START "
                f"| block={block_id} "
                f"| logs={len(self.blocks[block_id]['event_sequence'])} "
                f"| heure={datetime.now().strftime('%H:%M:%S')} "
                f"| attente={BLOCK_TIMEOUT}s"
            )

            await asyncio.sleep(BLOCK_TIMEOUT)

            print(
                f"[DEBUG] TIMEOUT EXPIRE "
                f"| block={block_id} "
                f"| heure={datetime.now().strftime('%H:%M:%S')}"
            )
            
            # --------------------------------------------------
            # Récupérer le block
            # --------------------------------------------------

            block = self.blocks.get(
                block_id
            )

            if block is None:

                return

            # --------------------------------------------------
            # CALCUL DE LA DURÉE DU BLOCK
            # --------------------------------------------------

            duration = (
                block["last_time"]
                -
                block["first_time"]
            ).total_seconds()

            # --------------------------------------------------
            # CONSTRUIRE LE JSON DU BLOCK
            # --------------------------------------------------

            result = {

                "block_id":
                    block_id,

                "event_sequence":
                    list(
                        block["event_sequence"]
                    ),

                "num_events":
                    len(
                        block["event_sequence"]
                    ),

                "duration":
                    duration,

                "num_info":
                    block["num_info"],

                "num_warn":
                    block["num_warn"]
            }

            # ==================================================
            # PREDICTION
            # ==================================================

            print(
                "\n[BlockManager] "
                "Lancement de la prédiction..."
            )

            try:

                anomaly_score, prediction = (
                    predict_anomaly(

                        result[
                            "event_sequence"
                        ],

                        result[
                            "num_events"
                        ],

                        result[
                            "duration"
                        ],

                        result[
                            "num_info"
                        ],

                        result[
                            "num_warn"
                        ]
                    )
                )

                # ----------------------------------------------
                # Ajouter les informations de prédiction
                # ----------------------------------------------

                result["prediction"] = prediction

                result["score"] = float(
                    anomaly_score
                )

                result["model"] = (
                    "BiLSTM-HDFS"
                )

                print(
                    "[BlockManager] "
                    "Prédiction terminée"
                )

                print(
                    f"Prediction : "
                    f"{prediction}"
                )

                print(
                    f"Score      : "
                    f"{anomaly_score}"
                )

            except Exception as prediction_error:

                # ----------------------------------------------
                # Une erreur ML ne doit pas faire planter
                # le BlockManager
                # ----------------------------------------------

                print(
                    "[BlockManager] "
                    "Erreur pendant la prédiction : "
                    f"{prediction_error}"
                )

                result["prediction"] = None

                result["score"] = None

                result["model"] = (
                    "BiLSTM-HDFS"
                )

                result["prediction_error"] = (
                    str(prediction_error)
                )

            # ==================================================
            # AFFICHAGE DU BLOCK TERMINÉ
            # ==================================================

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

            print(
                f"BlockId      : "
                f"{result['block_id']}"
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

            print(
                f"Prediction   : "
                f"{result['prediction']}"
            )

            print(
                f"Score        : "
                f"{result['score']}"
            )

            print(
                f"Model        : "
                f"{result['model']}"
            )

            print(
                "=" * 70
            )
            # ==================================================
            # STOCKER LE BLOCK DANS POSTGRESQL
            # ==================================================

            db = SessionLocal()

            try:
                model = (
                    db.query(Model)
                    .filter(Model.name == "BiLSTM-HDFS")
                    .first()
                )
                if model is None:
                    raise Exception(
                        "Le modèle BiLSTM-HDFS n'existe pas dans la table models"
                    )

                sequence = HDFSSequence(
                    block_id=result["block_id"],
                    event_sequence=result["event_sequence"],
                    num_events=result["num_events"],
                    duration=result["duration"],
                    num_info=result["num_info"],
                    num_warn=result["num_warn"],
                    prediction=result["prediction"],
                    score=result["score"],
                    model_id=model.id,
                    completed_at=datetime.utcnow()
                )

                db.add(sequence)
                db.commit()
                db.refresh(sequence)

                print(
                    f"[BlockManager] "
                    f"Block {block_id} sauvegardé dans PostgreSQL "
                    f"(id={sequence.id})"
                )

            except Exception as db_error:

                db.rollback()

                print(
                    "[BlockManager] "
                    f"Erreur sauvegarde PostgreSQL : {db_error}"
                )

            finally:

                db.close()
            # ==================================================
            # STOCKER LE BLOCK TERMINÉ
            # ==================================================

            self.completed_blocks.append(
                result
            )

            # ==================================================
            # SUPPRIMER LE BLOCK ACTIF
            # ==================================================

            del self.blocks[
                block_id
            ]

            self.timers.pop(
                block_id,
                None
            )

        # ------------------------------------------------------
        # Timer annulé
        # ------------------------------------------------------

        except asyncio.CancelledError:

            # Un nouveau log du même block est arrivé.
            # Le timer sera recréé par _reset_timer().
            pass

    # ==========================================================
    # RÉCUPÉRER LES BLOCKS TERMINÉS
    # ==========================================================

    def get_completed_blocks(
        self
    ) -> List[dict]:

        completed = list(
            self.completed_blocks
        )

        # Vider la liste après récupération
        self.completed_blocks.clear()

        return completed

    # ==========================================================
    # RÉCUPÉRER LES BLOCKS ACTIFS
    # ==========================================================

    def get_active_blocks(
        self
    ) -> List[str]:

        return list(
            self.blocks.keys()
        )