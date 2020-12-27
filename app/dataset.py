#!/usr/bin/env python3

from pathlib import Path
import pandas as pd


def create_initial_dataset_config(path: Path):
    data = pd.read_csv(path, sep=";")
    return {
        "columns": {
            column: True for column in data.columns
        },
        "label": data.columns[0]
    }
