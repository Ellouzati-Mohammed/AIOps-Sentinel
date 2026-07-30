import torch
import torch.nn as nn

from app.services.preprocessing import (
    prepare_sequence,
    prepare_numeric_features
)

from pathlib import Path


# ============================================================
# Configuration
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "ml" / "best_bilstm_model.pth"

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# Architecture identique au notebook
# ============================================================

class BiLSTMClassifier(nn.Module):

    def __init__(
        self,
        vocab_size,
        embedding_dim=64,
        hidden_dim=64,
        num_layers=2,
        numeric_dim=4,
        dropout=0.30
    ):

        super().__init__()

        # Embedding

        self.embedding = nn.Embedding(
            num_embeddings=vocab_size,
            embedding_dim=embedding_dim,
            padding_idx=0
        )


        # BiLSTM

        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout
        )


        # Branche features numériques

        self.numeric_branch = nn.Sequential(

            nn.Linear(
                numeric_dim,
                16
            ),

            nn.ReLU(),

            nn.Dropout(dropout)

        )


        # Classifieur final

        self.classifier = nn.Sequential(

            nn.Linear(
                hidden_dim * 2 + 16,
                64
            ),

            nn.ReLU(),

            nn.Dropout(dropout),


            nn.Linear(
                64,
                32
            ),

            nn.ReLU(),

            nn.Dropout(dropout),


            nn.Linear(
                32,
                1
            )

        )


    def forward(
        self,
        sequence,
        numeric
    ):

        # Embedding

        x = self.embedding(sequence)


        # BiLSTM

        _, (hidden, _) = self.lstm(x)


        # concat forward + backward

        sequence_features = torch.cat(
            (
                hidden[-2],
                hidden[-1]
            ),
            dim=1
        )


        # Features numériques

        numeric_features = self.numeric_branch(
            numeric
        )


        # Fusion

        features = torch.cat(
            (
                sequence_features,
                numeric_features
            ),
            dim=1
        )


        # Classification

        output = self.classifier(
            features
        )


        return output.squeeze(1)



# ============================================================
# Chargement lazy du modèle
# ============================================================

_model = None


def load_model():

    global _model


    if _model is None:

        _model = BiLSTMClassifier(

            vocab_size=48,

            embedding_dim=64,

            hidden_dim=64,

            num_layers=2,

            numeric_dim=4,

            dropout=0.30

        ).to(DEVICE)


        state_dict = torch.load(
            MODEL_PATH,
            map_location=DEVICE
        )


        _model.load_state_dict(
            state_dict
        )


        _model.eval()


    return _model



# ============================================================
# Prediction
# ============================================================

def predict(
    event_sequence,
    num_events,
    duration,
    num_info,
    num_warn
):

    model = load_model()


    # Préparation séquence E1,E2... -> Tensor

    sequence_tensor = prepare_sequence(
        event_sequence
    ).to(DEVICE)


    # Préparation features numériques

    numeric_tensor = prepare_numeric_features(

        num_events,

        duration,

        num_info,

        num_warn

    ).to(DEVICE)


    # Inférence

    with torch.no_grad():

        logits = model(

            sequence_tensor,

            numeric_tensor

        )


        probability = torch.sigmoid(
            logits
        )


        score = probability.item()



    # Décision

    label = (

        "ANOMALY"

        if score >= 0.5

        else "NORMAL"

    )


    return score, label