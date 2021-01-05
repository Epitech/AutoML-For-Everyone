#!/usr/bin/env python3

from flask import Flask, request, abort, send_from_directory
# from flask_executor import Executor
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from flask.json import jsonify
from pymongo import MongoClient
from pathlib import Path
import logging
import pickle
import shap
from dask.distributed import Client, fire_and_forget

import app.dataset as dataset
import app.training as training


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

    mongo_client = MongoClient(MONGO_HOST)
    db = mongo_client.datasets

    app.logger.info(dask.config.config)

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
        return dataset.get_dataset_visualization(DATASETS_DIRECTORY / id).compute()

    @app.route("/dataset/<id>/config")
    def get_dataset_config(id):
        result = db.datasets.find_one({"name": id})
        app.logger.info(f"Result for dataset {id}: {result}")
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
        app.logger.info(f"Inserting {dataset}")
        db.datasets.replace_one({"name": id}, dataset, upsert=True)
        return ""

    @app.route("/dataset/<id>/train", methods=["POST"])
    def start_training(id):
        app.logger.info(f"Starting training dataset {id}")
        result = db.datasets.find_one({"name": id})
        config = result["config"]
        app.logger.info(f"Found configuration {config}")
        fut = client.submit(training.train_model, id,
                            config, DATASETS_DIRECTORY)
        fire_and_forget(fut)
        return ""

    # explainer = shap.KernelExplainer(classifier.predict_proba, X.to_numpy().astype(np.float64), link="logit")
    # shap_values = explainer.shap_values(X.to_numpy().astype(np.float64), nsamples=100)
    # shap.summary_plot(shap_values, X.to_numpy().astype(np.float64), plot_type="bar", show=False)
    # plt.savefig('save.png')

    @app.route("/dataset/<id>/export")
    def export_result(id):
        code_path = Path(id).with_suffix(".pipeline.py")
        return send_from_directory(str(DATASETS_DIRECTORY),
                                   str(code_path), as_attachment=True)

    @app.route("/dataset/<id>/predict", methods=["POST"])
    def predict_result(id):
        app.logger.info(f"predicting for dataset {id}")
        result = db.datasets.find_one({"name": id})
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

    return app
