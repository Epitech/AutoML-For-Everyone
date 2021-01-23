#!/usr/bin/env python3

from __future__ import annotations

from mongoengine import Document, StringField, \
    ListField, EmbeddedDocumentField
from pathlib import Path
from werkzeug.exceptions import NotFound
import pandas as pd
from bson.objectid import ObjectId
import logging

from .config import DatasetConfig
from .model import DatasetModel


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

    meta = {"collection": "datasets"}

    @staticmethod
    def create_from_path(path: Path):
        """Create a dataset object from a csv dataset on disk"""
        df = pd.read_csv(path, sep=None, engine="python")
        return Dataset(path=str(path), name=path.name, columns=df.columns)

    @staticmethod
    def from_id(id: str) -> Dataset:
        """Load a dataset from its id"""
        try:
            return next(Dataset.objects(name=id))
        except StopIteration:
            raise DatasetNotFound(id)

    @staticmethod
    def config_from_id(id: str) -> (DatasetConfig, Dataset):
        """Load a config from its id"""
        try:
            res = next(Dataset.objects
                       .filter(configs__id=id)
                       .fields(path=1, name=1, columns=1,
                               configs={"$elemMatch": {"id": ObjectId(id)}}))
            log.debug(res)
            assert str(res.configs[0].id) == id
            return res.configs[0], res
        except (StopIteration, KeyError):
            raise ConfigNotFound(id)

    @staticmethod
    def model_from_id(id: str) -> (DatasetModel, DatasetConfig, Dataset):
        """Load a model from its id"""
        try:
            res = next(Dataset.objects
                       .filter(configs__models__id=id)
                       .fields(path=1, name=1, columns=1,
                               configs={"$elemMatch": {"models.id": ObjectId(id)}}))
            log.debug(res.to_json())
            log.debug([c.to_json() for c in res.configs])
            assert str(res.configs[0].models[0].id) == id
            return res.configs[0].models[0], res.configs[0], res
        except (StopIteration, KeyError):
            raise ModelNotFound(id)

    def to_json(self):
        return {
            "name": self.name,
            "columns": self.columns,
            "configs": [str(c.id) for c in self.configs]
        }

    def repair(self):
        """Repair dangling paths in the Dataset"""

        updated = False
        for config in self.configs:
            for model in config.models:
                # If path exist, check that they are still valid
                if model.exported_model_path and model.pickled_model_path:
                    if not Path(model.exported_model_path).exists() \
                       or not Path(model.pickled_model_path).exists():
                        # If the path are not valid anymore, reset them and set
                        # the status back to "not started"
                        model.exported_model_path = None
                        model.pickled_model_path = None
                        model.status = "not started"
                        updated = True

        # If any property was modified, save the dataset
        if updated:
            self.save()
