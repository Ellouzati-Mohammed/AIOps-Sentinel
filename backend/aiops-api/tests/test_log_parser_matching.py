from pathlib import Path

from app.services.log_parser import LogParser
from app.services.template_matcher import TemplateMatcher


BASE_DIR = Path(__file__).resolve().parent.parent

TEMPLATE_FILE = (
    BASE_DIR
    / "app"
    / "data"
    / "event_templates_drain3.csv"
)


def test_log_parser_and_template_matcher():

    parser = LogParser()

    matcher = TemplateMatcher(
        str(TEMPLATE_FILE)
    )

    # Log brut : on ne connaît pas à l'avance son EventId
    log = (
        "081109 213810 13 INFO dfs.DataBlockScanner: Verification succeeded for blk_-2720440255756584048"
    )

    # 1. Parser le log
    parsed = parser.parse(log)

    # 2. Afficher les informations extraites
    print("\n")
    print("=" * 60)
    print("LOG PARSER + TEMPLATE MATCHER")
    print("=" * 60)

    print(f"Date      : {parsed['date']}")
    print(f"Time      : {parsed['time']}")
    print(f"Timestamp : {parsed['timestamp']}")
    print(f"PID       : {parsed['pid']}")
    print(f"Level     : {parsed['level']}")
    print(f"Component : {parsed['component']}")
    print(f"Content   : {parsed['content']}")
    print(f"BlockId   : {parsed['block_id']}")

    # 3. Chercher le template
    template_result = matcher.match(
        parsed["content"]
    )

    # 4. Afficher le résultat du matching
    print("-" * 60)

    if template_result:

        print(f"EventId      : {template_result['event_id']}")
        print(
            f"EventTemplate: "
            f"{template_result['event_template']}"
        )

    else:

        print("EventId      : Aucun template trouvé")

    print("=" * 60)

    # Le parser doit fonctionner
    assert parsed is not None

    # Le template doit être trouvé
    assert template_result is not None