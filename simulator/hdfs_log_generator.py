import time
import random
from datetime import datetime


LOG_FILE = "simulator/logs_hdfs.log"


# ==================================================
# Templates HDFS normaux
# ==================================================

NORMAL_EVENTS = [

    "Receiving block {block} src: /{ip}:{port} dest: /{ip2}:{port2}",

    "Received block {block} of size {size} from /{ip}",

    "PacketResponder {block} for block {block}",

    "BLOCK* NameSystem.addStoredBlock: blockMap updated: {ip}:{port} is added to {block} size {size}",

    "Verification succeeded for {block}",
]


# ==================================================
# Templates HDFS anomalies
# ==================================================

ANOMALY_EVENTS = [

    "writeBlock {block} received exception java.io.IOException: Could not read from stream",

    "PacketResponder {block} Exception java.io.IOException: Broken pipe",

    "Exception in receiveBlock for {block} java.io.IOException: Connection reset by peer",

    "writeBlock {block} received exception java.io.IOException: Connection reset by peer",

    "PacketResponder {block} Exception java.net.SocketTimeoutException",

    "Deleting block {block} file /data/{block}",
]


# ==================================================
# Génération IP aléatoire
# ==================================================

def random_ip():

    return (
        f"10.0.{random.randint(1,10)}."
        f"{random.randint(1,255)}"
    )


# ==================================================
# Création d'une ligne de log
# ==================================================

def create_log(template, block_id):


    values = {

        "block": block_id,

        "ip": random_ip(),

        "ip2": random_ip(),

        "port": random.choice(
            [
                50010,
                50020,
                50030
            ]
        ),

        "port2": random.choice(
            [
                50010,
                50020,
                50030
            ]
        ),

        "size": random.choice(
            [
                67108864,
                134217728,
                268435456
            ]
        )
    }


    message = template.format(
        **values
    )


    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    log = (
        f"{timestamp} "
        f"INFO dfs.DataNode: "
        f"{message}\n"
    )


    return log



# ==================================================
# Ecriture temps réel dans fichier
# ==================================================

def write_log(log):

    with open(
        LOG_FILE,
        "a"
    ) as file:

        file.write(log)

        # force l'écriture immédiate
        file.flush()


    print(
        log.strip()
    )



# ==================================================
# Création des blocs actifs
# ==================================================

def create_blocks():


    blocks = {}


    # entre 3 et 9 blocs simultanés

    number_of_blocks = random.randint(
        3,
        9
    )


    for i in range(
        number_of_blocks
    ):


        block_id = (
            f"blk_{100000+i}"
        )


        # 20% des blocs sont anormaux

        is_anomaly = (
            random.random() < 0.2
        )


        if is_anomaly:

            events = random.sample(
                ANOMALY_EVENTS,
                random.randint(2,4)
            )


        else:

            events = random.sample(
                NORMAL_EVENTS,
                random.randint(3,5)
            )


        blocks[block_id] = events



    return blocks



# ==================================================
# Programme principal
# ==================================================

def main():


    print(
        "HDFS realtime simulator started..."
    )


    blocks = create_blocks()


    print(
        "\nActive blocks:"
    )

    for block in blocks:

        print(
            block
        )


    while True:


        # blocs qui ont encore des événements

        active_blocks = [

            block

            for block in blocks

            if len(blocks[block]) > 0

        ]



        # tous les blocs terminés

        if not active_blocks:


            print(
                "\nCreating new blocks..."
            )


            blocks = create_blocks()


            continue



        # choisir un bloc aléatoire

        block_id = random.choice(
            active_blocks
        )



        # récupérer son prochain événement

        event = blocks[block_id].pop(0)



        log = create_log(
            event,
            block_id
        )



        # ajouter le log

        write_log(
            log
        )



        # délai temps réel

        time.sleep(
            random.uniform(
                0.5,
                3
            )
        )



if __name__ == "__main__":

    main()