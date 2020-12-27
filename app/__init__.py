#!/usr/bin/env python3

from flask import Flask, request, abort
from flask_executor import Executor
from flask_cors import CORS
import os
from flask.json import jsonify
from pymongo import MongoClient
from pathlib import Path
from tpot import TPOTClassifier

import app.dataset as dataset

app = Flask(__name__)
executor = Executor(app)
CORS(app)


def getenv(key) -> str:
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Missing environment variable {key}")
    return value


DATASETS_DIRECTORY = getenv("DATASETS_DIRECTORY")
MONGO_HOST = getenv("MONGO_HOST")

client = MongoClient(MONGO_HOST)
db = client.datasets


@app.route("/")
def home():
    return "Home"


@app.route("/dataset")
def get_datasets():
    return jsonify(os.listdir(DATASETS_DIRECTORY))


@app.route("/dataset/<id>/config")
def get_dataset_config(id):
    result = db.datasets.find_one({"name": id})
    app.logger.debug(f"Result for dataset {id}: {result}")
    if not result:
        return dataset.create_initial_dataset_config(
            Path(DATASETS_DIRECTORY) / id)
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
    app.logger.debug(f"Starting training on dataset {id}")
    classifier = TPOTClassifier()
    X, y = dataset.get_dataset(Path(DATASETS_DIRETORY) / id, config)
    classifier.fit(X, y)
