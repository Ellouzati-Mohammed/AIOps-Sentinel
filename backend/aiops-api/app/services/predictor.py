import torch
import torch.nn as nn

from app.services.preprocessor import (
    prepare_sequence,
    prepare_numeric_features
)


# ============================================================
# Configuration
# ============================================================

MODEL_PATH = "app/ml/best_bilstm_model.pth"

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


        self.embedding = nn.Embedding(
            num_embeddings=vocab_size,
            embedding_dim=embedding_dim,
            padding_idx=0
        )


        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout
        )


        self.numeric_branch = nn.Sequential(

            nn.Linear(
                numeric_dim,
                16
            ),

            nn.ReLU(),

            nn.Dropout(dropout)

        )


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

        x = self.embedding(
            sequence
        )


        _, (hidden, _) = self.lstm(
            x
        )


        sequence_features = torch.cat(
            (
                hidden[-2],
                hidden[-1]
            ),
            dim=1
        )


        numeric_features = self.numeric_branch(
            numeric
        )


        features = torch.cat(
            (
                sequence_features,
                numeric_features
            ),
            dim=1
        )


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

def predict(sequence):


    model = load_model()


    sequence_tensor = prepare_sequence(
        sequence.event_sequence
    ).to(DEVICE)



    numeric_tensor = prepare_numeric_features(

        sequence.num_events,

        sequence.duration,

        sequence.num_info,

        sequence.num_warn

    ).to(DEVICE)



    with torch.no_grad():


        logits = model(

            sequence_tensor,

            numeric_tensor

        )


        probability = torch.sigmoid(
            logits
        )


        score = probability.item()



    label = (
        "ANOMALY"
        if score >= 0.5
        else "NORMAL"
    )


    return score, label