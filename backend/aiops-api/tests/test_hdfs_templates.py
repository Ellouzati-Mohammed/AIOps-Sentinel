from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)



# ==========================================
# Test GET all templates
# ==========================================

def test_get_templates():

    response = client.get(
        "/api/hdfs/templates"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier que le retour est une liste

    assert isinstance(data, list)


    # Vérifier qu'il y a des templates

    assert len(data) > 0



# ==========================================
# Test GET template by event_id
# ==========================================

def test_get_template_by_event_id():

    event_id = "E1"


    response = client.get(
        f"/api/hdfs/templates/event/{event_id}"
    )


    assert response.status_code == 200


    data = response.json()


    # Vérifier les champs

    assert data["event_id"] == event_id

    assert "template" in data



# ==========================================
# Test GET template by id
# ==========================================
def test_get_template_by_id():

    response = client.get(
        "/api/hdfs/templates/1"
    )

    assert response.status_code == 200

    data = response.json()

    # Vérifier les champs
    assert data["id"] == 1
    assert "template" in data

# ==========================================
# Test template inexistant
# ==========================================

def test_get_template_not_found():

    response = client.get(
        "/api/hdfs/templates/event/E999"
    )


    assert response.status_code == 404