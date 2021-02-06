#!/usr/bin/env python3

from pathlib import Path
import pandas as pd
import sweetviz as sv
import logging
import dask
import os

from app.model.dataset import Dataset
from app.model.config import DatasetConfig
import app.column_mapping as column_mapping

log = logging.getLogger(__name__)


def repair_all_datasets():
    """Repair dangling paths in all the Datasets"""
    dataset: Dataset
    for dataset in Dataset.objects:
        dataset.repair()


def load_all_datasets(datasets_directory):
    """Load all unknown datasets into the database """
    datasets_already_loaded = [Path(d.path) for d in Dataset.objects]

    for path in map(Path, os.listdir(datasets_directory)):
        path = datasets_directory / path
        if path.suffix == ".csv" and path not in datasets_already_loaded:
            log.info(path)
            d = Dataset.create_from_path(path).save()
            log.info(f"Created entry for dataset {path}: {d.to_json()}")


def create_initial_dataset_config(path: Path):
    """Create a basic configuration for a dataset

    All columns are enabled and the first column of the dataset is selected as
    the label
    """
    # TODO: detect separator once, store it, and give it explicitely
    # It would allow pandas to use the faster C csv engine.
    data = pd.read_csv(path, sep=None)
    return {
        "columns": {
            column: True for column in data.columns
        },
        "label": data.columns[0]
    }


def get_dataset(path: Path, config: dict, mapping={}):
    """Load and configure a dataset from disk"""
    data = pd.read_csv(path, sep=None)
    data = column_mapping.convert_with_column_mapping(data, mapping)
    columns = [k for k, v in config["columns"].items() if v]
    label = config["label"]
    columns.remove(label)
    print(columns, label)
    X = data[columns]
    y = data[label]
    return X, y


@dask.delayed
def get_dataset_visualization(path: Path, config: DatasetConfig = None):
    """Get or generate the SweetViz vizualisation"""
    if config is not None:
        viz_name = f"{path.name}-{config.id}-sweetviz.html"
    else:
        viz_name = f"{path.name}-sweetviz.html"
    viz_path = path.with_name(viz_name)
    log.info(f"Searching viz file {viz_path}")
    if viz_path.exists():
        log.info("Viz found")
        return open(viz_path).read()
    else:
        log.info("Viz not found. Loading dataset")
        data = pd.read_csv(path, sep=None)
        data.drop(data.filter(regex="Unname"), axis=1, inplace=True)
        log.info("Generating viz")
        if config is not None:
            viz = sv.analyze(data, target_feat=config.label,
                             feat_cfg=sv.FeatureConfig(force_num=[config.label]))
        else:
            viz = sv.analyze(data)
        log.info(f"Saving viz to {viz_path}")
        viz.show_html(filepath=viz_path, open_browser=False)
        log.info("Returning viz")
        return open(viz_path).read()
