from fastapi.testclient import TestClient

from app.main import app


# Client de test FastAPI
client = TestClient(app)



# ==========================================
# Test API Health
# ==========================================

def test_health():

    response = client.get(
        "/health"
    )


    # Vérifier HTTP 200

    assert response.status_code == 200


    # Vérifier le contenu

    data = response.json()


    assert data["status"] == "ok"



# ==========================================
# Test connexion Database
# ==========================================

def test_health_db():

    response = client.get(
        "/health/db"
    )


    # Vérifier HTTP 200

    assert response.status_code == 200


    data = response.json()


    assert data["database"] == "connected"