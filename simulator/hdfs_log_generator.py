import random
import time
import os
from datetime import datetime


LOG_FILE = "simulator/logs_hdfs.log"


# ==========================================
# Seulement 2 templates HDFS pour le test
# ==========================================

EVENT_TEMPLATES = [

    "Receiving block {block} src: /{ip}:{port} dest: /{ip2}:{port2}",

    "BLOCK* NameSystem.allocateBlock: <*> {block}",

    "PacketResponder <*> for block {block} <*>",

    "Received block {block} of size {size} from /{ip}",

    "BLOCK* NameSystem.addStoredBlock: blockMap updated: {ip}:{port} is added to {block} size {size}",

    "Received block {block} src: /{ip}:{port} dest: /{ip2}:{port2} of size {size}",

    "{ip}:{port}:Transmitted block {block} to /{ip2}:{port2}",

    "{ip}:{port} Starting thread to transfer block {block} to {ip2}:{port2}, {ip}:{port}",

    "BLOCK* ask {ip}:{port} to replicate {block} to datanode(s) {ip2}:{port2} {ip}:{port}",

    "{ip}:{port} Served block {block} to /{ip}",

    "BLOCK* ask {ip}:{port} to replicate {block} to datanode(s) {ip2}:{port2}",

    "{ip}:{port} Starting thread to transfer block {block} to {ip2}:{port2}",

    "Verification succeeded for {block}",

    "writeBlock {block} received exception {exception}",

    "PacketResponder {block} <*> Exception {exception}",

    "writeBlock {block} received exception java.io.IOException: Could not read from stream",

    "Deleting block {block} file {path}{block}",

    "Receiving empty packet for block {block}",

    "Exception in receiveBlock for block {block} java.io.IOException: Connection reset by peer",

    "writeBlock {block} received exception java.io.IOException: Connection reset by peer",

    "BLOCK* NameSystem.addStoredBlock: Redundant addStoredBlock request received for {block} on {ip}:{port} size {size}",

    "PacketResponder {block} <*> Exception java.net.SocketTimeoutException",

    "PacketResponder {block} <*> Exception java.io.InterruptedIOException",

    "Exception in receiveBlock for block {block} <*>",

    "Changing block file offset of block {block} from 0 to {offset}",

    "{ip}:{port}:Exception writing block {block} to mirror {ip2}:{port2}",

    "Exception in receiveBlock for block {block} java.io.InterruptedIOException",

    "writeBlock {block} received exception java.io.InterruptedIOException",

    "PacketResponder {block} <*> Exception java.io.IOException: Broken pipe",

    "writeBlock {block} received exception java.io.IOException: Block {block} is valid, and cannot be written to.",

    "{ip}:{port}:Failed to transfer {block} to {ip2}:{port2} got java.io.IOException: Connection reset by peer",

    "BLOCK* NameSystem.delete: {block} is added to invalidSet of {ip}:{port}",

    "Unexpected error trying to delete block {block}. BlockInfo not found in volumeMap.",

    "BLOCK* NameSystem.addStoredBlock: addStoredBlock request received for {block} on {ip}:{port} size {size} But it does not belong to any file.",

    "{ip}:{port}:Got exception while serving {block} to /{ip}",

    "PacketResponder {block} <*> Exception java.io.IOException: Connection reset by peer",

    "Exception in receiveBlock for block {block} java.net.SocketTimeoutException",

    "writeBlock {block} received exception java.net.SocketTimeoutException",

    "Reopen Block {block}",

    "BLOCK* Removing block {block} from neededReplications as it does not belong to any file.",

    "PendingReplicationMonitor timed out block {block}",

    "writeBlock {block} received exception java.io.IOException: <*> <*>",

    "PacketResponder {block} 1 Exception java.io.InterruptedIOException",

    "writeBlock {block} received exception java.net.NoRouteToHostException: No route to host",

    "Adding an already existing block {block}",

    "Exception in receiveBlock for block {block} java.io.IOException: Broken pipe",

    "PacketResponder {block} 1 Exception java.io.IOException: The stream is closed"

]


# ==========================================
# Génération IP
# ==========================================


def random_ip():

    return (
        f"10.0.{random.randint(1,10)}."
        f"{random.randint(1,255)}"
    )


# ==========================================
# Création d'un log
# ==========================================

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
        ),

        "offset": random.randint(
            100,
            10000
        ),

        "path": random.choice(
            [
                "/data/",
                "/dfs/data/",
                "/tmp/hdfs/"
            ]
        ),

        "exception": random.choice(
            [
                "java.io.IOException: Broken pipe",
                "java.io.IOException: Connection reset by peer",
                "java.io.IOException: Could not read from stream",
                "java.net.SocketTimeoutException"
            ]
        ),

        "extra": random.randint(
            1,
            10
        )
    }


    message = template.format(
        **values
    )


    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    return (
        f"{timestamp} "
        f"INFO dfs.DataNode: "
        f"{message}\n"
    )


# ==========================================
# Ecriture dans fichier
# ==========================================

def write_log(log):

    with open(
        LOG_FILE,
        "a"
    ) as file:

        file.write(log)

        file.flush()



# ==========================================
# Gestion des blocs
# ==========================================

NEXT_BLOCK_ID = 100000

MAX_ACTIVE_BLOCKS = 6



def create_block():

    global NEXT_BLOCK_ID


    block_id = (
        f"blk_{NEXT_BLOCK_ID}"
    )


    NEXT_BLOCK_ID += 1


    # nombre de logs du bloc

    number_of_logs = random.randint(
        5,
        20
    )


    sequence = random.choices(
        EVENT_TEMPLATES,
        k=number_of_logs
    )


    return block_id, {

        "logs": sequence,

        "total": number_of_logs

    }



def create_blocks():

    blocks = {}


    for _ in range(MAX_ACTIVE_BLOCKS):

        block_id, data = create_block()

        blocks[block_id] = data


    return blocks



# ==========================================
# Affichage état seulement
# ==========================================

def display_status(blocks):

    os.system(
        "cls" if os.name == "nt" else "clear"
    )


    print("=" * 65)

    print(
        "          HDFS REALTIME SIMULATOR"
    )

    print("=" * 65)


    print(
        f"{'Block':<15}"
        f"{'Total':<10}"
        f"{'Restant':<12}"
        f"{'Ecrit':<10}"
    )


    print("-" * 65)


    for block_id, data in blocks.items():


        total = data["total"]

        remaining = len(
            data["logs"]
        )

        written = total - remaining


        print(
            f"{block_id:<15}"
            f"{total:<10}"
            f"{remaining:<12}"
            f"{written:<10}"
        )


    print("-" * 65)



# ==========================================
# Programme principal
# ==========================================

def main():


    print(
        "Starting HDFS simulator..."
    )


    blocks = create_blocks()



    while True:


        display_status(
            blocks
        )


        # choisir un bloc actif

        block_id = random.choice(
            list(blocks.keys())
        )



        # récupérer un événement

        template = blocks[block_id]["logs"].pop(0)



        # créer le log

        log = create_log(
            template,
            block_id
        )



        # écrire dans fichier

        write_log(
            log
        )



        # vérifier fin du bloc

        if len(blocks[block_id]["logs"]) == 0:


            del blocks[block_id]


            new_block, data = create_block()


            blocks[new_block] = data



        # délai temps réel

        time.sleep(
            random.uniform(
                0.5,
                3
            )
        )



if __name__ == "__main__":

    main()