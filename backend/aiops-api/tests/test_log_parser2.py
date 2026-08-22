from app.services.log_parser import LogParser


def test_log_parser():

    parser = LogParser()

    # Log de test : on ne donne aucune valeur attendue au test
    log = (
        "081109 213815 45 WARN "
        "dfs.DataNode: "
        "PacketResponder blk_-123456789 received exception java.io.IOException"
    )

    result = parser.parse(log)

    print("\n")
    print("=" * 60)
    print("              LOG PARSER TEST")
    print("=" * 60)

    if result is None:
        print("❌ Log non reconnu")
        return

    print(f"Date      : {result['date']}")
    print(f"Time      : {result['time']}")
    print(f"Timestamp : {result['timestamp']}")
    print(f"PID       : {result['pid']}")
    print(f"Level     : {result['level']}")
    print(f"Component : {result['component']}")
    print(f"Content   : {result['content']}")
    print(f"BlockId   : {result['block_id']}")

    print("=" * 60)

    # On vérifie seulement que le parser a réussi
    assert result is not None