from app.services.predictor import (
    load_model,
    predict
)


def test_model_loading():

    model = load_model()

    assert model is not None



def test_prediction_output():

    event_sequence = [
        "E1",
        "E2",
        "E3",
        "E4",
        "E5"
    ]


    score, label = predict(

        event_sequence,

        5,       # NumEvents

        1.5,     # Duration

        20,      # NumINFO

        0        # NumWARN

    )


    assert isinstance(score, float)

    assert 0 <= score <= 1


    assert label in [
        "NORMAL",
        "ANOMALY"
    ]