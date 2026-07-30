import torch

from app.services.preprocessing import (
    convert_sequence,
    pad_sequence,
    prepare_numeric_features,
)


def test_convert_sequence():

    sequence = [
        "E1",
        "E2",
        "E10",
        "E25"
    ]

    result = convert_sequence(sequence)

    assert result == [1, 2, 10, 25]


def test_padding_sequence():

    sequence = [1, 2, 3]

    result = pad_sequence(
        sequence,
        max_len=33
    )

    assert len(result) == 33
    assert result[:3] == [1, 2, 3]
    assert result[3:] == [0] * 30


def test_padding_truncation():

    sequence = list(range(50))

    result = pad_sequence(
        sequence,
        max_len=33
    )

    assert len(result) == 33
    assert result == sequence[:33]


def test_prepare_numeric_features():

    result = prepare_numeric_features(
        100,    # NumEvents
        5.0,    # Duration
        80,     # NumINFO
        2       # NumWARN
    )

    assert isinstance(result, torch.FloatTensor)
    assert result.shape == (1, 4)