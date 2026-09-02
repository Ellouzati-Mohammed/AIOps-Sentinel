import pandas as pd
import ast

from app.database import SessionLocal
from app.models import HDFSSequence, HDFSTemplate



TEMPLATE_FILE = r"C:\Users\Ellou\Downloads\HDFS_1\Pro\output\hdfs_data\event_templates_drain3.csv"


SEQUENCE_FILE = r"C:\Users\Ellou\Downloads\HDFS_1\Pro\output\hdfs_data\sequences_drain3.csv"



LIMIT = 10



db = SessionLocal()


try:

    # ===============================
    # 1) Import templates
    # ===============================

    templates_df = pd.read_csv(
        TEMPLATE_FILE
    )


    for _, row in templates_df.iterrows():


        template = HDFSTemplate(

            event_id=row["EventId"],

            template=row["EventTemplate"]

        )


        db.merge(template)



    db.commit()


    print("✅ Templates importés")



    # ===============================
    # 2) Import sequences
    # ===============================

    sequences_df = pd.read_csv(
        SEQUENCE_FILE,
        nrows=LIMIT
    )



    for _, row in sequences_df.iterrows():


        sequence = HDFSSequence(

            block_id=row["BlockId"],


            event_sequence=ast.literal_eval(
                row["EventSequence"]
            ),


            label=row["Label"],


            num_events=row["NumEvents"],


            duration=row["Duration"],


            num_info=row["NumINFO"],


            num_warn=row["NumWARN"],


            num_error=row["NumERROR"]

        )


        db.merge(sequence)


    db.commit()


    print(
        f"✅ {LIMIT} séquences importées"
    )



except Exception as e:


    db.rollback()


    print(
        "❌ Erreur :",
        e
    )


finally:

    db.close()