#!/usr/bin/env python3

import logging
from tpot import TPOTClassifier
import numpy as np
from dask.distributed import get_client, fire_and_forget
import pickle
# import pandas as pd

import app.dataset as dataset

log = logging.getLogger(__name__)


def tpot_training(X: np.array, y: np.array) -> TPOTClassifier:
    classifier = TPOTClassifier(
        verbosity=2, generations=10, population_size=10, use_dask=True)
    log.info("Created classifier")
    classifier.fit(X, y)
    log.info("Finished training")
    return classifier


def save_pipeline(classifier, path):
    pipeline = classifier.fitted_pipeline_
    log.info(f"Best pipeline : {pipeline}")
    log.info(f"Saving best pipeline to {path}")
    with open(path, "wb") as f:
        pickle.dump(pipeline, f)
    log.info("Pipeline saved")


def export_pipeline_code(classifier, path):
    log.info(f"Saving pipeline code to {path}")
    classifier.export(path)
    log.info("Finished exporting")


def train_model(id, config, directory):
    log.error(f"Starting training on dataset {id}")
    dataset_path = directory / id
    X, y = dataset.get_dataset(dataset_path, config)
    log.error(f"Loaded dataset: {X} {y}")

    # Convert to types TPOT understands
    X = X.to_numpy().astype(np.float64)
    y = y.to_numpy().astype(np.float64)

    # Get the Dask client
    client = get_client()

    # Train the model
    classifier = client.submit(tpot_training, X, y)

    # Save best pipeline
    fire_and_forget(client.submit(
        save_pipeline,
        classifier,
        dataset_path.with_suffix(".pipeline.pickle")))

    # Export best pipeline code
    fire_and_forget(client.submit(
        export_pipeline_code,
        classifier,
        dataset_path.with_suffix(".pipeline.py")))
