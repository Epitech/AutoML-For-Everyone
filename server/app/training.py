#!/usr/bin/env python3

from tpot import TPOTClassifier, TPOTRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, plot_confusion_matrix
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
    classifier = model(**model_config, verbosity=2,
                       use_dask=True)  # , max_time_mins=1
    logger.info(f"Created {model_type} with config {model_config}")
    if log_file:
        log_file.unlink(missing_ok=True)
        with open(log_file, "w") as f, redirect_stdout(f):
            classifier.fit(X, y)
    else:
        classifier.fit(X, y)
    logger.info("Finished training")

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
def create_confusion_matrix(classifier, X_test, y_test, path):
    logger.info(f"Saving confusion matrix to {path}")
    estimator = classifier.fitted_pipeline_
    plot_confusion_matrix(estimator, X_test, y_test)
    plt.savefig(path, bbox_inches="tight")
    plt.clf()


@dask.delayed
def export_pipeline_code(classifier, path):
    logger.info(f"Saving pipeline code to {path}")
    classifier.export(path)
    logger.info("Finished exporting")


@dask.delayed
def save_shap(classifier, shap_model_path, copy_X, copy_y, mapping):
    plt.clf()
    if copy_X.shape[0] > 200:
        copy_X = copy_X.sample(n=200, replace=False)
    explainer = shap.KernelExplainer(classifier.predict_proba, copy_X)
    shap_values = explainer.shap_values(copy_X, nsamples=100)
    if copy_y.name in mapping:
        shap.summary_plot(shap_values, copy_X, class_names=[*mapping[copy_y.name]])
    else:
        shap.summary_plot(shap_values, copy_X)
    plt.suptitle(f'Impact of each parameters on {copy_y.name} column')
    plt.savefig(shap_model_path, bbox_inches='tight')
    plt.clf()


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
        shap_model_path = model_dir / "save.png"
        confusion_matrix_path = model_dir / "confusion_matrix.png"

        model.log_path = str(log_path)
        set_status("started")

        # Load the dataset
        mapping = column_mapping.decode_mapping(dataset.column_mapping)
        X, y = get_dataset(dataset_path, config, mapping)
        logger.info(f"Loaded dataset: {X} {y}")
        logger.info(f"Mapping: {mapping}")

        # Copy data before column name drop (using it for shap)
        copy_X = X
        copy_y = y

        # Convert to types TPOT understands
        X = X.to_numpy().astype(np.float64)
        y = y.to_numpy().astype(np.float64)

        # Separate training and testing data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2)

        logger.info(config.to_json())

        # Split values
        #X_train, X_test, Y_train, Y_test = train_test_split(X, y, test_size=0.2)

        # Train the model
        classifier = tpot_training(
            X_train, y_train, model.model_config, log_file=log_path,
            model_type=config.model_type)

        # Save best pipeline
        save_res = save_pipeline(classifier, pickled_model_path)

        # Export best pipeline code
        export_res = export_pipeline_code(classifier, exported_model_path)

        # Save shap image
        image_res = save_shap(classifier, shap_model_path, copy_X, copy_y, mapping)

        # Create metrics on the generated pipeline
        analysis_res = analyse_model(
            classifier, X_train, y_train, X_test, y_test)

        # Create the confusion matrix
        matrix_res = create_confusion_matrix(
            classifier, X_test, y_test, confusion_matrix_path)

        # Get the results of the exportation and model saving
        _, _, analysis, _, _ = dask.compute(
            save_res, export_res, analysis_res, image_res, matrix_res)

        # Update the model with the exported paths
        # and set the status as done
        model.pickled_model_path = str(pickled_model_path)
        model.exported_model_path = str(exported_model_path)
        model.confusion_matrix_path = str(confusion_matrix_path)
        model.analysis = analysis
        model.status = "done"
        dataset.save()
    except Exception as e:
        logger.error(f"Got error while training: {e}")
        traceback.print_exc()
        set_status("error")
