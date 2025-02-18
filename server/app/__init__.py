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
import numpy as np

import app.dataset as dataset
from app.dataset import get_dataset
import app.training as training
import app.linter as linter
from app.model.dataset import Dataset
from app.model.config import DatasetConfig
from app.model.model import DatasetModel
import app.column_mapping as column_mapping


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

    # Repair the database
    dataset.repair_all_datasets()
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
            path = DATASETS_DIRECTORY / filename
            file.save(path)
            Dataset.create_from_path(path).save()
            return {"status": "ok"}, 201
        else:
            abort(400)

    @app.route("/dataset/<id>", methods=["DELETE"])
    def delete_dataset(id):
        dataset = Dataset.from_id(id)
        dataset.delete_data()
        dataset.delete()
        return {}

    @app.route("/dataset/<id>")
    def route_get_dataset(id):
        dataset = Dataset.from_id(id)
        return dataset.to_json()

    def lint_config(config, dataset):
        app.logger.info(
            f"Linting Config: {config} parent {dataset.to_json()} path {dataset.path}")
        try:
            mapping = column_mapping.decode_mapping(dataset.column_mapping)
            df = get_dataset(dataset.path, config, mapping, True)
            app.logger.info(f"Dataset columns: {df.columns}")
            return linter.lint_dataframe(df, config["label"], config['model_type'])
        except KeyError:
            abort(400)

    @app.route("/dataset/<id>/config/lint", methods=["POST"])
    def lint_config_from_request(id):
        config = request.json
        dataset = Dataset.from_id(id)
        return lint_config(config, dataset)

    @app.route("/dataset/<id>/sweetviz")
    def get_dataset_visualization(id):
        d = Dataset.from_id(id)
        path = dataset.get_dataset_visualization(Path(d.path), d)
        return send_file(path)

    @app.route("/dataset/<id>/config", methods=["POST"])
    def set_dataset_config(id):
        result = Dataset.from_id(id)
        columns = request.json.get("columns")
        label = request.json.get("label")
        model_type = request.json.get("model_type")
        config = DatasetConfig(
            columns=columns, label=label, model_type=model_type)
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
    def lint_config_from_db(id):
        config, dataset = Dataset.config_from_id(id)
        return lint_config(config, dataset)

    @app.route("/config/<id>/sweetviz")
    def get_config_visualization(id):
        config, d = Dataset.config_from_id(id)
        path = dataset.get_dataset_visualization(Path(d.path), d, config)
        return send_file(path)

    @app.route("/config/<id>/model", methods=["POST"])
    def create_model(id):
        config, dataset = Dataset.config_from_id(id)
        app.logger.info(f"Creating model with config: {request.json}")
        model = DatasetModel(model_config=request.json)
        config.models.append(model)
        dataset.save()
        return model.to_json(), 201

    @app.route("/config/<id>", methods=["DELETE"])
    def delete_config(id):
        app.logger.info(f"Removing config {id}")
        config, dataset = Dataset.config_from_id(id)
        config.delete_data()
        dataset.configs = [c for c in dataset.configs if c.id != config.id]
        dataset.save()
        return jsonify({})

    @app.route("/model/<id>")
    def get_model(id):
        model, config, dataset = Dataset.model_from_id(id)
        return model.to_json()

    @app.route("/model/<id>/train", methods=["POST"])
    def train_model(id):
        model, config, dataset = Dataset.model_from_id(id)

        # Check if training is already done or in progress
        if model.status == "done":
            return {"error": "Model is already trained"}, 409
        if model.status not in ["not started", "error"]:
            return {"error": "Model is currently training"}, 409

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
        if model.status != "done":
            return {"error": "Model is not trained"}, 409
        return send_file(model.exported_model_path, as_attachment=True)

    @app.route("/model/<id>/pickle")
    def export_pickle(id):
        model, _, _ = Dataset.model_from_id(id)
        if model.status != "done":
            return {"error": "Model is not trained"}, 409
        return send_file(model.pickled_model_path, as_attachment=True)

    @app.route("/model/<id>/confusion_matrix")
    def export_confusion_matrix(id):
        model, _, _ = Dataset.model_from_id(id)
        if model.status != "done":
            return {"error": "Model is not trained"}, 409
        if not model.confusion_matrix_path:
            return {"error": "No confusion matrix available"}, 404
        return send_file(model.confusion_matrix_path, as_attachment=True)

    @app.route("/model/<id>/shap_value")
    def export_shap_value(id):
        model, _, _ = Dataset.model_from_id(id)
        if model.status != "done":
            return {"error": "Model is not trained"}, 409
        app.logger.info(f"ICI : {model.shap_model_path}\n\n\n\n")
        return send_file(model.shap_model_path, as_attachment=True)

    @app.route("/model/<id>/predict", methods=["POST"])
    def predict_result(id):
        dataset: Dataset
        config: DatasetConfig
        model, config, dataset = Dataset.model_from_id(id)

        # Check if model is trained
        if model.status != "done":
            return {"error": "Model is not trained"}, 409

        app.logger.info(f"predicting for dataset {dataset.name}")
        app.logger.info(f"Found configuration {config}")
        data = request.json
        app.logger.info(f"got data {data}")
        mapping = column_mapping.decode_mapping(dataset.column_mapping)
        for line in data:
            for k in line.keys():
                if k in mapping:
                    line[k] = mapping[k][line[k]]
                else:
                    line[k] = float(line[k])
        app.logger.info(f"Decoded data {data}")
        columns_order = [col
                         for col in dataset.columns
                         if col in config.columns
                         and config.columns[col]
                         and col != config.label]
        app.logger.info(f"columns order {columns_order}")
        data = np.array([[
            line[col] for col in columns_order
        ] for line in data])
        app.logger.info(f"sorted data {data}")
        with open(model.pickled_model_path, "rb") as f:
            pipeline = pickle.load(f)
        app.logger.info("loaded pipeline")
        result = pipeline.predict(data).tolist()
        app.logger.info(f"Predicted {result}")

        if config.label in mapping:
            result = [
                column_mapping.reconvert_one_value(
                    config.label, value, mapping)
                for value in result
            ]
        return jsonify([{config.label: value} for value in result])

    @app.route("/model/<id>/status")
    def dataset_status(id):
        model: DatasetModel
        model, _, _ = Dataset.model_from_id(id)

        reply = {"status": model.status}

        if model.log_path:
            try:
                with open(model.log_path) as f:
                    reply["logs"] = f.read()
            except FileNotFoundError:
                pass

        return reply

    @app.route("/model/<id>", methods=["DELETE"])
    def delete_model(id):
        app.logger.info(f"Removing model {id}")
        model, config, dataset = Dataset.model_from_id(id)
        model.delete_data()
        config.models = [m for m in config.models if m.id != model.id]
        dataset.save()
        return jsonify({})

    @app.route("/getimg/<directory>/<filename>", methods=["GET"])
    def get_image(directory, filename):
        return send_from_directory(str(directory), str(filename), as_attachment=True)

    return app
