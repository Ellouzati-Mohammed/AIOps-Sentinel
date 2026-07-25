from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)



# ==========================================
# Test GET all models
# ==========================================

def test_get_models():

    response = client.get(
        "/api/models"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier que le résultat est une liste

    assert isinstance(data, list)



# ==========================================
# Test register new model
# ==========================================

def test_register_model():

    response = client.post(
        "/api/models/register",
        params={
            "name": "BiLSTM-HDFS",
            "version": "1.0",
            "algorithm": "Bidirectional LSTM",
            "f1_score": 0.9617
        }
    )


    assert response.status_code == 200


    data = response.json()


    assert data["message"] == "Model registered"

    assert data["model"]["name"] == "BiLSTM-HDFS"

    assert data["model"]["version"] == "1.0"



# ==========================================
# Test GET model by id
# ==========================================

def test_get_model_by_id():

    response = client.get(
        "/api/models/1"
    )


    assert response.status_code == 200


    data = response.json()


    assert "name" in data

    assert "algorithm" in data

    assert "f1_score" in data



# ==========================================
# Test model inexistant
# ==========================================

def test_model_not_found():

    response = client.get(
        "/api/models/99999"
    )


    assert response.status_code == 404