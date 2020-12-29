#!/usr/bin/env python3

from pathlib import Path
import pandas as pd
import sweetviz as sv
import logging

log = logging.getLogger(__name__)


def create_initial_dataset_config(path: Path):
    data = pd.read_csv(path, sep=",")
    return {
        "columns": {
            column: True for column in data.columns
        },
        "label": data.columns[0]
    }


def get_dataset(path: Path, config: dict):
    data = pd.read_csv(path, sep=",")
    columns = [k for k, v in config["columns"].items() if v]
    label = config["label"]
    columns.remove(label)
    print(columns, label)
    X = data[columns]
    y = data[label]
    return X, y


def get_dataset_visualization(path: Path):
    viz_path = path.with_suffix(".sweetviz.html")
    log.debug(f"Searching viz file {viz_path}")
    if viz_path.exists():
        log.debug("Viz found")
        return open(viz_path).read()
    else:
        log.debug("Viz not found. Loading dataset")
        data = pd.read_csv(path, sep=",")
        data.drop(data.filter(regex="Unname"), axis=1, inplace=True)
        log.debug("Generating viz")
        viz = sv.analyze(data)
        log.debug(f"Saving viz to {viz_path}")
        viz.show_html(filepath=viz_path, open_browser=False)
        log.debug("Returning viz")
        return open(viz_path).read()
