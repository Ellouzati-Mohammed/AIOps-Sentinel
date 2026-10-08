import re
import json
import joblib
import numpy as np
import torch


# ============================================================
# Configuration modèle
# ============================================================

MAX_SEQ_LEN = 33

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent.parent

SCALER_PATH = BASE_DIR / "ML" / "scaler.joblib"


# ============================================================
# Chargement du scaler
# ============================================================

scaler = joblib.load(
    SCALER_PATH
)


# ============================================================
# Conversion EventSequence
# ["E1","E2"] -> [1,2]
# ============================================================

def convert_sequence(sequence):

    return [
        int(re.sub(r"\D", "", event))
        for event in sequence
    ]


# ============================================================
# Padding identique au notebook
# ============================================================

def pad_sequence(
    sequence,
    max_len=MAX_SEQ_LEN
):

    if len(sequence) >= max_len:

        return sequence[:max_len]

    else:

        return sequence + [0] * (
            max_len - len(sequence)
        )


# ============================================================
# Préparation séquence pour BiLSTM
# ============================================================

def prepare_sequence(event_sequence):

    sequence = convert_sequence(
        event_sequence
    )

    sequence = pad_sequence(
        sequence
    )

    return torch.LongTensor(
        [sequence]
    )


# ============================================================
# Préparation features numériques
#
# Ordre identique entraînement:
# NumEvents
# Duration
# NumINFO
# NumWARN
# ============================================================

def prepare_numeric_features(
    num_events,
    duration,
    num_info,
    num_warn
):

    duration = np.log1p(
        duration
    )

    features = np.array(
        [[
            num_events,
            duration,
            num_info,
            num_warn
        ]],
        dtype=np.float32
    )


    features = scaler.transform(
        features
    )


    return torch.FloatTensor(
        features
    )