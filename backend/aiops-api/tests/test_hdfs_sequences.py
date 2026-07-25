from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)



# ==========================================
# Test GET all HDFS sequences
# ==========================================

def test_get_sequences():

    response = client.get(
        "/api/hdfs/sequences"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier que le résultat est une liste

    assert isinstance(data, list)



# ==========================================
# Test GET sequence by id
# ==========================================

def test_get_sequence_by_id():

    response = client.get(
        "/api/hdfs/sequences/1"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier les champs importants

    assert "block_id" in data

    assert "event_sequence" in data

    assert "label" in data



# ==========================================
# Test GET sequence by block_id
# ==========================================

def test_get_sequence_by_block_id():

    block_id = "blk_-1608999687919862906"


    response = client.get(
        f"/api/hdfs/sequences/block/{block_id}"
    )


    assert response.status_code == 200


    data = response.json()


    assert data["block_id"] == block_id


    assert "event_sequence" in data



# ==========================================
# Test block inexistant
# ==========================================

def test_get_sequence_not_found():

    response = client.get(
        "/api/hdfs/sequences/block/unknown_block"
    )


    assert response.status_code == 404