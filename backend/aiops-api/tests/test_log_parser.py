from app.services.log_parser import LogParser


def test_log_parser():

    parser = LogParser()

    # Vrai format d'une ligne HDFS
    log = "081109 213809 33 INFO dfs.FSNamesystem: BLOCK* NameSystem.addStoredBlock: blockMap updated: 10.251.75.163:50010 is added to blk_-8989557726141890652 size 3548529"

    result = parser.parse(log)

    # ======================================================
    # Affichage
    # ======================================================

    print("\n--- LOG PARSER TEST ---")

    print(f"Date      : {result['date']}")
    print(f"Time      : {result['time']}")
    print(f"Timestamp : {result['timestamp']}")
    print(f"PID       : {result['pid']}")
    print(f"Level     : {result['level']}")
    print(f"Component : {result['component']}")
    print(f"Content   : {result['content']}")
    print(f"BlockId   : {result['block_id']}")

    # ======================================================
    # Vérifications
    # ======================================================

    assert result is not None

    assert result["date"] == "081109"
    assert result["time"] == "213809"

    assert result["pid"] == "33"

    assert result["level"] == "INFO"

    assert result["component"] == "dfs.FSNamesystem"

    assert result["block_id"] == (
        "blk_-8989557726141890652"
    )

    assert result["content"] == (
        "BLOCK* NameSystem.addStoredBlock: "
        "blockMap updated: "
        "10.251.75.163:50010 "
        "is added to "
        "blk_-8989557726141890652 "
        "size 3548529"
    )