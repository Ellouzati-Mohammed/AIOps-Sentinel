from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)



# ==========================================
# Test création d'une prédiction
# ==========================================

def test_predict_hdfs_sequence():

    block_id = "blk_-1608999687919862906"


    response = client.post(
        f"/api/predictions/predict?block_id={block_id}"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier le résultat

    assert "block_id" in data

    assert "prediction" in data

    assert "score" in data

    assert "model" in data



    # Vérifier les valeurs possibles

    assert data["prediction"] in [
        "NORMAL",
        "ANOMALY"
    ]



# ==========================================
# Test récupération historique
# ==========================================

def test_get_predictions():

    response = client.get(
        "/api/predictions"
    )


    assert response.status_code == 200


    data = response.json()


    assert isinstance(data, list)



# ==========================================
# Test récupération prédiction par block
# ==========================================

def test_get_prediction_by_block():

    block_id = "blk_-1608999687919862906"


    response = client.get(
        f"/api/predictions/{block_id}"
    )


    assert response.status_code == 200


    data = response.json()


    assert "prediction" in data

    assert "anomaly_score" in data



# ==========================================
# Test block sans prédiction
# ==========================================

def test_prediction_not_found():

    response = client.get(
        "/api/predictions/unknown_block"
    )


    assert response.status_code == 404