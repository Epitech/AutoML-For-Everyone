#!/usr/bin/env python3

from flask import Flask, request, abort, send_from_directory
# from flask_executor import Executor
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask.json import jsonify
from pathlib import Path
import logging
import pickle
from dask.distributed import Client, fire_and_forget
import pandas as pd
import mongoengine

import app.dataset as dataset
import app.training as training
import app.linter as linter
from app.model.dataset import Dataset
from app.model.config import DatasetConfig


def create_app():
    def getenv(key) -> str:
        value = os.getenv(key)
        if value is None:
            raise ValueError(f"Missing environment variable {key}")
        return value

    client = Client(getenv("DASK_SCHEDULER_HOST"))

    app = Flask(__name__)
    # app.config['EXECUTOR_PROPAGATE_EXCEPTIONS'] = True
    # executor = Executor(app)
    CORS(app)
    logging.basicConfig(level=logging.INFO)

    DATASETS_DIRECTORY = Path(getenv("DATASETS_DIRECTORY"))
    MONGO_HOST = getenv("MONGO_HOST")

    # mongo_client = MongoClient(MONGO_HOST)
    # db = mongo_client.datasets

    mongoengine.connect("datasets", host=MONGO_HOST)

    # Initializa the database with all datasets that can be found
    dataset.load_all_datasets(DATASETS_DIRECTORY)

    @app.route("/")
    def home():
        return "Home"

    @app.route("/dataset")
    def get_datasets():
        return jsonify([d.name for d in Dataset.objects])

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

    @app.route("/dataset/<id>")
    def get_dataset(id):
        dataset = Dataset.from_id(id)
        return dataset.to_json()

    @app.route("/dataset/<id>/sweetviz")
    def get_dataset_visualization(id):
        return dataset.get_dataset_visualization(DATASETS_DIRECTORY / id).compute()

    @app.route("/dataset/<id>/config")
    def get_dataset_config_list(id):
        result = Dataset.from_id(id)
        return jsonify([str(c.id) for c in result.configs])

    @app.route("/dataset/<id>/config", methods=["POST"])
    def set_dataset_config(id):
        result = Dataset.from_id(id)
        columns = request.json["columns"]
        label = request.json["label"]
        config = DatasetConfig(columns=columns, label=label)
        result.configs.append(config)
        app.logger.info(f"Inserting config {request.json}")
        app.logger.info(result.configs)
        result.save()
        return config.to_json()

    @app.route("/config/<id>")
    def get_dataset_config(id):
        config, _ = Dataset.config_from_id(id)
        return config.to_json()

    @app.route("/config/<id>/lint", methods=["GET"])
    def lint_config(id):
        config, dataset = Dataset.config_from_id(id)
        app.logger.info(f"Config: {config} parent {dataset.to_json()} path {dataset.path}")
        df = pd.read_csv(dataset.path, sep=None)
        df = df[[k for k, v in config["columns"].items() if v]]
        app.logger.info(f"Dataset columns: {df.columns}")
        return linter.lint_dataframe(df)

    @app.route("/config/<id>/train", methods=["POST"])
    def start_training(id):
        result = Dataset.from_id(id)
        app.logger.info(f"Starting training dataset {id} {result}")
        config = result["config"]
        app.logger.info(f"Found configuration {config}")
        fut = client.submit(training.train_model, id,
                            config, DATASETS_DIRECTORY, MONGO_HOST)
        fire_and_forget(fut)
        return {"status": result.status}

    @app.route("/dataset/<id>/export")
    def export_result(id):
        code_path = Path(id).with_suffix(".pipeline.py")
        return send_from_directory(str(DATASETS_DIRECTORY),
                                   str(code_path), as_attachment=True)

    @app.route("/dataset/<id>/predict", methods=["POST"])
    def predict_result(id):
        app.logger.info(f"predicting for dataset {id}")
        result = Dataset.from_id(id)
        config = result["config"]
        app.logger.info(f"Found configuration {config}")
        data = request.json
        app.logger.info(f"got data {data}")
        data = [float(data[k])
                for k in sorted(data.keys())
                if k in config["columns"]
                and config["columns"][k]
                and config["label"] != k]
        app.logger.info(f"sorted data {data}")
        code_path = DATASETS_DIRECTORY / \
            Path(id).with_suffix(".pipeline.pickle")
        with open(code_path, "rb") as f:
            pipeline = pickle.load(f)
        app.logger.info("loaded pipeline")
        result = pipeline.predict([data])
        app.logger.info(f"Predicted {result}")
        return jsonify(result[0])

    @app.route("/dataset/<id>/status")
    def dataset_status(id):
        dataset = Dataset.from_id(id)
        return jsonify({"status": dataset.status})

    @app.route("/dataset/pic")
    def export_explaination():
        return send_from_directory(str("/datasets"), str("save.png"), as_attachment=True)

    return app

#####TODO : PROBLEME AU NIVEAU DE LA DATA####
#explainer = shap.KernelExplainer(classifier.predict_proba, X.to_numpy().astype(np.float64), link="logit")
#shap_values = explainer.shap_values(X.to_numpy().astype(np.float64), nsamples=100)
#shap.summary_plot(shap_values, X.to_numpy().astype(np.float64), plot_type="bar", show=False)
# plt.savefig('datasets/save.png')
