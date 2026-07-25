import pandas as pd

from app.database import SessionLocal
from app.models import HDFSSequence
import ast

# chemin du fichier
FILE_PATH = r"C:\Users\Ellou\Downloads\HDFS_1\Pro\output\hdfs_data\sequences_drain3.csv"

# Lire seulement 10 lignes
df = pd.read_csv(
    FILE_PATH,
    nrows=10
)


db = SessionLocal()


try:

    for _, row in df.iterrows():

        sequence = HDFSSequence(

            block_id=row["BlockId"],

            event_sequence=ast.literal_eval(row["EventSequence"]),

            event_templates=row["EventTemplates"],

            label=row["Label"],

            num_events=row["NumEvents"],

            duration=row["Duration"],

            num_info=row["NumINFO"],

            num_warn=row["NumWARN"],

            num_error=row["NumERROR"]
        )


        db.add(sequence)


    db.commit()

    print("✅ 10 séquences importées")


except Exception as e:

    db.rollback()

    print("❌ Erreur :", e)


finally:

    db.close()