#!/usr/bin/env python3

from __future__ import annotations

from mongoengine import Document, StringField, \
    ListField, EmbeddedDocumentField, DictField
from pathlib import Path
from werkzeug.exceptions import NotFound
import pandas as pd
from bson.objectid import ObjectId
import logging
import math

from .config import DatasetConfig
from .model import DatasetModel
import app.column_mapping as mapping


log = logging.getLogger(__name__)


class DatasetNotFound(NotFound):
    def __init__(self, id):
        super().__init__(f"Dataset not found: {id}")


class ConfigNotFound(NotFound):
    def __init__(self, id):
        super().__init__(f"Dataset config not found: {id}")


class ModelNotFound(NotFound):
    def __init__(self, id):
        super().__init__(f"Model not found: {id}")


class Dataset(Document):
    path: str = StringField(required=True)
    name: str = StringField(required=True, unique=True)
    columns: list[str] = ListField(StringField(), required=True)
    configs: list[DatasetConfig] = ListField(
        EmbeddedDocumentField(DatasetConfig), default=list)

    column_mapping = DictField()

    meta = {"collection": "datasets"}

    @staticmethod
    def create_from_path(path: Path) -> Dataset:
        """Create a dataset object from a csv dataset on disk"""
        df = pd.read_csv(path, sep=None, engine="python")
        column_mapping = mapping.create_column_mapping(df)
        column_mapping = mapping.encode_mapping(column_mapping)
        return Dataset(path=str(path), name=path.name, columns=df.columns,
                       column_mapping=column_mapping)

    @staticmethod
    def from_id(id: str) -> Dataset:
        """Load a dataset from its id"""
        try:
            return next(Dataset.objects(name=id))
        except StopIteration:
            raise DatasetNotFound(id)

    @staticmethod
    def config_from_id(id: str) -> tuple[DatasetConfig, Dataset]:
        """Load a config from its id"""
        try:
            res = next(Dataset.objects.filter(configs__id=id))
            config = next(c for c in res.configs if str(c.id) == id)
            log.info(res)
            log.info(res.configs)
            log.info(config.to_json())
            assert str(config.id) == id
            return config, res
        except (StopIteration, KeyError):
            raise ConfigNotFound(id)

    @staticmethod
    def model_from_id(id: str) -> tuple[DatasetModel, DatasetConfig, Dataset]:
        """Load a model from its id"""
        try:
            res = next(Dataset.objects.filter(configs__models__id=id))
            config, model = next(
                (c, m)
                for c in res.configs
                for m in c.models
                if str(m.id) == id)
            log.debug(res.to_json())
            log.debug([c.to_json() for c in res.configs])
            assert str(model.id) == id
            return model, config, res
        except (StopIteration, KeyError):
            raise ModelNotFound(id)

    def to_json(self):
        return {
            "name": self.name,
            "columns": self.columns,
            # "map_list": self.map_list,
            "configs": [str(c.id) for c in self.configs]
        }

    def repair(self):
        """Repair dangling paths in the Dataset"""

        updated = False
        for config in self.configs:
            for model in config.models:

                def is_dangling(path: str):
                    return path and not Path(path).exists()

                # If the path are not valid anymore, reset them and set
                # the status back to "not started"
                if is_dangling(model.exported_model_path) \
                   or is_dangling(model.pickled_model_path) \
                   or is_dangling(model.confusion_matrix_path) \
                   or is_dangling(model.shap_model_path):
                    model.exported_model_path = None
                    model.pickled_model_path = None
                    model.confusion_matrix_path = None
                    model.shap_model_path = None
                    model.log_path = None
                    model.status = "not started"
                    updated = True

                # If the log file is dangling, reset it, but do not change the
                # status
                if is_dangling(model.log_path):
                    model.log_path = None
                    updated = True

                # If the status is not "not started" or "done", reset it
                if model.status not in ["not started", "done"]:
                    model.status = "not started"
                    updated = True

        # If any property was modified, save the dataset
        if updated:
            self.save()


if __name__ == "__main__":
    obj = Dataset.create_from_path("../../../datasets/titanic.csv")
    print(obj.columns)
