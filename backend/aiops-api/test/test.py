from app.database import engine

try:
    with engine.connect() as connection:
        print("✅ PostgreSQL connecté avec succès")
except Exception as e:
    print("❌ Erreur connexion PostgreSQL")
    print(e)