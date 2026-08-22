from app.services.template_matcher import TemplateMatcher
from pathlib import Path


# ==========================================================
# Chemin du fichier des templates historiques
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "app"
    / "data"
    / "event_templates_drain3.csv"
)


# ==========================================================
# Test TemplateMatcher
# ==========================================================

def test_template_matcher():

    # Charger les templates historiques
    matcher = TemplateMatcher(
        str(TEMPLATE_FILE)
    )

    # Log réel de test
    log = (
        "Receiving block blk_100001 "
        "src: /10.0.9.250:50020 "
        "dest: /10.0.1.219:50030"
    )

    # Chercher le template correspondant
    result = matcher.match(log)

    # Afficher le résultat
    print("\n==============================")
    print("TEST TEMPLATE MATCHER")
    print("==============================")
    print("Log :", log)
    print()
    print("Résultat :", result)
    print("==============================")

    # Le log DOIT être reconnu
    assert result is not None

    # L'EventId doit être E1
    assert result["event_id"] == "E1"

    # Le template doit être celui du CSV
    assert result["event_template"] == (
        "Receiving block <BLOCK_ID> "
        "src: /<IP><:PORT> "
        "dest: /<IP><:PORT>"
    )