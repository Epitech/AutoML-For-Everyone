#!/usr/bin/env python3

import logging
from tpot import TPOTClassifier
import numpy as np
from dask.distributed import get_client, fire_and_forget, secede, rejoin
from distributed.worker import logger
import dask
import pickle
from pymongo import MongoClient
# import pandas as pd

import app.dataset as dataset


@dask.delayed
def tpot_training(X: np.array, y: np.array) -> TPOTClassifier:
    classifier = TPOTClassifier(
        verbosity=2, generations=10, population_size=10, use_dask=True)
    logger.info("Created classifier")
    classifier.fit(X, y)
    logger.info("Finished training")
    return classifier


@dask.delayed
def save_pipeline(classifier, path):
    pipeline = classifier.fitted_pipeline_
    logger.info(f"Best pipeline : {pipeline}")
    logger.info(f"Saving best pipeline to {path}")
    with open(path, "wb") as f:
        pickle.dump(pipeline, f)
    logger.info("Pipeline saved")


@dask.delayed
def export_pipeline_code(classifier, path):
    logger.info(f"Saving pipeline code to {path}")
    classifier.export(path)
    logger.info("Finished exporting")


def train_model(id, config, directory, mongo_host):
    mongo_client = MongoClient(mongo_host)
    db = mongo_client.datasets

    def set_status(status):
        logger.info(f"Setting status of {id} to: {status}")
        db.datasets.update_one({"name": id}, {"$set": {"status": status}})

    set_status("started")
    dataset_path = directory / id
    X, y = dataset.get_dataset(dataset_path, config)
    logger.info(f"Loaded dataset: {X} {y}")

    # Convert to types TPOT understands
    X = X.to_numpy().astype(np.float64)
    y = y.to_numpy().astype(np.float64)

    # Get the Dask client
    client = get_client()

    # Train the model
    classifier = tpot_training(X, y)

    # Save best pipeline
    save_res = save_pipeline(
        classifier, dataset_path.with_suffix(".pipeline.pickle"))

    # Export best pipeline code
    export_res = export_pipeline_code(
        classifier, dataset_path.with_suffix(".pipeline.py"))

    # Secede from the Thread pool
    # Needed to not block a slot when sending new tasks
    secede()

    # Get the results of the futures
    save_fut = client.compute(save_res)
    export_fut = client.compute(export_res)
    client.gather(save_fut, export_fut)

    # Rejoin the Thread Pool to set the status
    rejoin()

    set_status("done")
