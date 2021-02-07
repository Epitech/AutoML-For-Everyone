#!/usr/bin/env python3

from tpot import TPOTClassifier, TPOTRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score
import numpy as np
from distributed.worker import logger
import dask
import pickle
from pathlib import Path
from contextlib import redirect_stdout
from pathlib import Path
import traceback
# import pandas as pd
import sys

from app.dataset import get_dataset
from app.model.dataset import Dataset
import app.column_mapping as column_mapping
from app.model.model import ModelAnalysis

import shap
import matplotlib.pyplot as plt


@dask.delayed
def tpot_training(X: np.array, y: np.array, model_config: dict,
                  *, log_file: Path = None, model_type="classification"):
    # Select the model based on model type
    model = TPOTClassifier if model_type == "classification" else TPOTRegressor

    # Create the model
    classifier = model(**model_config, verbosity=2, use_dask=True) #, max_time_mins=1
    logger.info(f"Created {model_type} with config {model_config}")
    if log_file:
        log_file.unlink(missing_ok=True)
        with open(log_file, "w") as f, redirect_stdout(f):
            classifier.fit(X, y)
    else:
        classifier.fit(X, y)
    logger.info("Finished training")

    # sys.stderr.write("DEBUT SHAP\n")
    # explainer = shap.KernelExplainer(classifier.predict_proba, X_train, link="logit")
    # shap_values = explainer.shap_values(X_test, nsamples=100)
    # shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
    # plt.savefig('save.png')
    # sys.stderr.write("FIN SHAP\n")

    return classifier


@dask.delayed
def save_pipeline(classifier, path):
    """
    Pickle the best pipeline found by TPOT and save it

    The saved pipeline is used to make predictions after training
    """
    pipeline = classifier.fitted_pipeline_
    logger.info(f"Best pipeline : {pipeline}")
    logger.info(f"Saving best pipeline to {path}")
    with open(path, "wb") as f:
        pickle.dump(pipeline, f)
    logger.info("Pipeline saved")


@dask.delayed
def analyse_model(model, X_train, y_train, X_test, y_test) -> ModelAnalysis:
    y_test_pred = model.predict(X_test)
    logger.info(f"y: {y_test}, pred: {y_test_pred}")
    f1 = f1_score(y_test, y_test_pred, average="macro")
    logger.info(f"F1 score: {f1}")

    train_accurary = model.score(X_train, y_train)
    logger.info(f"train accuracy: {train_accurary}")
    test_accurary = model.score(X_test, y_test)
    logger.info(f"test accuracy: {test_accurary}")

    return ModelAnalysis(training_accurary=train_accurary,
                         testing_accuracy=test_accurary,
                         f1_score=f1)


@dask.delayed
def export_pipeline_code(classifier, path):
    logger.info(f"Saving pipeline code to {path}")
    classifier.export(path)
    logger.info("Finished exporting")


def train_model(model_id):
    model, config, dataset = Dataset.model_from_id(model_id)

    def set_status(status):
        logger.info(f"Setting status of {model.id} to: {status}")
        model.status = status
        dataset.save()

    try:
        # Create the different assets path
        dataset_path = Path(dataset.path)
        model_dir = dataset_path.parent / \
            f"{dataset.name}-model-{str(model.id)}"
        model_dir.mkdir(exist_ok=True)
        log_path = model_dir / "training.log"
        pickled_model_path = model_dir / "pipeline.pickle"
        exported_model_path = model_dir / "pipeline.py"

        model.log_path = str(log_path)
        set_status("started")

        # Load the dataset
        mapping = column_mapping.decode_mapping(dataset.column_mapping)
        X, y = get_dataset(dataset_path, config, mapping)
        logger.info(f"Loaded dataset: {X} {y}")
        logger.info(f"Mapping: {mapping}")

        # Convert to types TPOT understands
        X = X.to_numpy().astype(np.float64)
        y = y.to_numpy().astype(np.float64)

        # Separate training and testing data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2)

        logger.info(config.to_json())

        # Train the model
        classifier = tpot_training(
            X_train, y_train, model.model_config, log_file=log_path,
            model_type=config.model_type)

        # Save best pipeline
        save_res = save_pipeline(classifier, pickled_model_path)

        # Export best pipeline code
        export_res = export_pipeline_code(classifier, exported_model_path)

        # Create metrics on the generated pipeline
        analysis_res = analyse_model(
            classifier, X_train, y_train, X_test, y_test)

        # Get the results of the exportation and model saving
        _, _, analysis = dask.compute(save_res, export_res, analysis_res)

        # Update the model with the exported paths
        # and set the status as done
        model.pickled_model_path = str(pickled_model_path)
        model.exported_model_path = str(exported_model_path)
        model.analysis = analysis
        model.status = "done"
        dataset.save()
    except Exception as e:
        logger.error(f"Got error while training: {e}")
        traceback.print_exc()
        set_status("error")
