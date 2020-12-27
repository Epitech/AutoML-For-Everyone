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


def get_dataset(path: Path, config: dict):
    data = pd.read_csv(path, sep=";")
    columns = [k for k, v in config["columns"].items() if v]
    label = config["label"]
    columns.remove(label)
    print(columns, label)
    X = data[columns]
    y = data[label]
    return X, y
