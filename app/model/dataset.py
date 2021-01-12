#!/usr/bin/env python3

from mongoengine import Document, StringField, DictField
from pathlib import Path
import csv

from werkzeug.exceptions import NotFound


class DatasetNotFound(NotFound):
    def __init__(self, id):
        super().__init__(f"Dataset not found: {id}")


class Dataset(Document):
    path = StringField(required=True)
    name = StringField(required=True, unique=True)
    config = DictField()
    status = StringField(default=None)

    meta = {"collection": "datasets"}

    @staticmethod
    def create_from_path(path: Path):
        with open(path) as f:
            reader = csv.DictReader(f)
            columns = reader.fieldnames
            config = {
                "columns": {
                    column: True for column in columns if column
                },
                "label": next(col for col in columns if col)
            }
        return Dataset(path=str(path), name=path.name, config=config)

    @staticmethod
    def from_id(id: str):
        try:
            return next(Dataset.objects(name=id))
        except StopIteration:
            raise DatasetNotFound(id)
