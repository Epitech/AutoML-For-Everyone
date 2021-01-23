#!/usr/bin/env python3

from flask import Flask, request, abort, send_file, send_from_directory
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
from app.model.model import DatasetModel


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
            return {"status": "ok"}, 201
        else:
            abort(400)

    @app.route("/dataset/<id>")
    def get_dataset(id):
        dataset = Dataset.from_id(id)
        return dataset.to_json()

    @app.route("/dataset/<id>/sweetviz")
    def get_dataset_visualization(id):
        return dataset.get_dataset_visualization(DATASETS_DIRECTORY / id).compute()

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
        return config.to_json(), 201

    @app.route("/config/<id>")
    def get_dataset_config(id):
        config, _ = Dataset.config_from_id(id)
        return config.to_json()

    @app.route("/config/<id>/lint", methods=["GET"])
    def lint_config(id):
        config, dataset = Dataset.config_from_id(id)
        app.logger.info(
            f"Config: {config} parent {dataset.to_json()} path {dataset.path}")
        df = pd.read_csv(dataset.path, sep=None)
        df = df[[k for k, v in config["columns"].items() if v]]
        app.logger.info(f"Dataset columns: {df.columns}")
        return linter.lint_dataframe(df, config["label"])

    @app.route("/config/<id>/model", methods=["POST"])
    def create_model(id):
        config, dataset = Dataset.config_from_id(id)
        accepted_keys = ["generations"]
        model_kwargs = {k: v for k, v in request.json.items()
                        for k in accepted_keys}
        app.logger.info(f"Creating model with config: {model_kwargs}")
        model = DatasetModel(**model_kwargs)
        config.models.append(model)
        dataset.save()
        return model.to_json(), 201

    @app.route("/model/<id>")
    def get_model(id):
        model, config, dataset = Dataset.model_from_id(id)
        return model.to_json()

    @app.route("/model/<id>/train", methods=["POST"])
    def train_model(id):
        model, config, dataset = Dataset.model_from_id(id)
        app.logger.info(f"Starting training dataset {dataset.name}")
        app.logger.info(f"config: {config.to_json()}")
        app.logger.info(f"model: {model.to_json()}")
        app.logger.info(f"Found configuration {config}")

        # update status
        model.status = "starting"
        dataset.save()

        fut = client.submit(training.train_model, id)
        fire_and_forget(fut)
        return {"status": model.status}, 202

    @app.route("/model/<id>/export")
    def export_result(id):
        model, _, _ = Dataset.model_from_id(id)
        return send_file(model.exported_model_path, as_attachment=True)

    @app.route("/model/<id>/predict", methods=["POST"])
    def predict_result(id):
        model, config, dataset = Dataset.model_from_id(id)
        app.logger.info(f"predicting for dataset {dataset.name}")
        app.logger.info(f"Found configuration {config}")
        data = request.json
        app.logger.info(f"got data {data}")
        data = [float(data[k])
                for k in sorted(data.keys())
                if k in config.columns
                and config.columns[k]
                and config.label != k]
        app.logger.info(f"sorted data {data}")
        with open(model.pickled_model_path, "rb") as f:
            pipeline = pickle.load(f)
        app.logger.info("loaded pipeline")
        result = pipeline.predict([data])
        app.logger.info(f"Predicted {result}")
        return jsonify(result[0])

    @app.route("/model/<id>/status")
    def dataset_status(id):
        model, _, _ = Dataset.model_from_id(id)
        return jsonify({"status": model.status})

    @app.route("/dataset/pic")
    def export_explaination():
        return send_from_directory(str("/datasets"), str("save.png"), as_attachment=True)

    return app

#####TODO : PROBLEME AU NIVEAU DE LA DATA####
#explainer = shap.KernelExplainer(classifier.predict_proba, X.to_numpy().astype(np.float64), link="logit")
#shap_values = explainer.shap_values(X.to_numpy().astype(np.float64), nsamples=100)
#shap.summary_plot(shap_values, X.to_numpy().astype(np.float64), plot_type="bar", show=False)
# plt.savefig('datasets/save.png')
