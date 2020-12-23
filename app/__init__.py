#!/usr/bin/env python3

from flask import Flask
import os
from flask.json import jsonify

app = Flask(__name__)

DATASETS_DIRECTORY = os.getenv("DATASETS_DIRECTORY")

if not DATASETS_DIRECTORY:
    raise ValueError("Missing environment variable DATASETS_DIRECTORY")


@app.route("/")
def home():
    return "Home"


@app.route("/dataset")
def get_datasets():
    return jsonify(os.listdir(DATASETS_DIRECTORY))
