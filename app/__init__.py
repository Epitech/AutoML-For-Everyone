#!/usr/bin/env python3

from flask import Flask, request, abort, send_from_directory
from flask_executor import Executor
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask.json import jsonify
from pymongo import MongoClient
from pathlib import Path
from tpot import TPOTClassifier
import logging
import numpy as np
import pickle
import shap

import app.dataset as dataset

app = Flask(__name__)
app.config['EXECUTOR_PROPAGATE_EXCEPTIONS'] = True
executor = Executor(app)
CORS(app)
logging.basicConfig(level=logging.DEBUG)


def getenv(key) -> str:
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Missing environment variable {key}")
    return value


DATASETS_DIRECTORY = Path(getenv("DATASETS_DIRECTORY"))
MONGO_HOST = getenv("MONGO_HOST")

client = MongoClient(MONGO_HOST)
db = client.datasets


@app.route("/")
def home():
    return "Home"


@app.route("/dataset")
def get_datasets():
    return jsonify([d for d in os.listdir(DATASETS_DIRECTORY)
                    if Path(d).suffix == ".csv"])


@app.route("/dataset", methods=["POST"])
def upload_dataset():
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            abort(400)
        filename = secure_filename(file.filename)
        file.save(DATASETS_DIRECTORY / filename)
        return {"status": "ok"}
    else:
        abort(400)


@app.route("/dataset/<id>/sweetviz")
def get_dataset_visualization(id):
    return dataset.get_dataset_visualization(DATASETS_DIRECTORY / id)


@app.route("/dataset/<id>/config")
def get_dataset_config(id):
    result = db.datasets.find_one({"name": id})
    app.logger.debug(f"Result for dataset {id}: {result}")
    if not result:
        return dataset.create_initial_dataset_config(
            DATASETS_DIRECTORY / id)
    return jsonify(result["config"])


@app.route("/dataset/<id>/config", methods=["PUT"])
def set_dataset_config(id):
    dataset = {
        "name": id,
        "config": request.json
    }
    app.logger.debug(f"Inserting {dataset}")
    db.datasets.replace_one({"name": id}, dataset, upsert=True)
    return ""


@app.route("/dataset/<id>/train", methods=["POST"])
def start_training(id):
    app.logger.debug(f"Starting training dataset {id}")
    result = db.datasets.find_one({"name": id})
    config = result["config"]
    app.logger.debug(f"Found configuration {config}")
    executor.submit(train_model, id, config)
    return ""


def train_model(id, config):
    dataset_path = DATASETS_DIRECTORY / id
    app.logger.debug(f"Starting training on dataset {id}")
    classifier = TPOTClassifier(
        verbosity=2, generations=10, population_size=10)
    app.logger.debug("Created classifier")
    X, y = dataset.get_dataset(dataset_path, config)
    app.logger.debug(f"Loaded dataset: {X} {y}")
    classifier.fit(X.to_numpy().astype(np.float64),
                   y.to_numpy().astype(np.float64))

    #explainer = shap.KernelExplainer(classifier.predict_proba, X.to_numpy().astype(np.float64), link="logit")
    #shap_values = explainer.shap_values(X.to_numpy().astype(np.float64), nsamples=100)
    #shap.summary_plot(shap_values, X.to_numpy().astype(np.float64), plot_type="bar", show=False)
    #plt.savefig('save.png')

    app.logger.debug("Finished training")
    pipeline_path = dataset_path.with_suffix(".pipeline.pickle")
    app.logger.debug(f"Best pipeline : {classifier.fitted_pipeline_}")
    app.logger.debug(f"Saving best pipeline to {pipeline_path}")
    with open(pipeline_path, "wb") as f:
        pickle.dump(classifier.fitted_pipeline_, f)
    code_path = dataset_path.with_suffix(".pipeline.py")
    app.logger.debug(f"Saving pipeline code to {code_path}")
    classifier.export(code_path)
    app.logger.debug("Finished exporting")


@app.route("/dataset/<id>/export")
def export_result(id):
    code_path = Path(id).with_suffix(".pipeline.py")
    return send_from_directory(str(DATASETS_DIRECTORY),
                               str(code_path), as_attachment=True)
