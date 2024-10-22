#!/usr/bin/env python3

from __future__ import annotations

from mongoengine import EmbeddedDocument, MapField, BooleanField, \
    StringField, ObjectIdField, ListField, EmbeddedDocumentField
from bson.objectid import ObjectId
import logging
from pathlib import Path

from .model import DatasetModel

MODEL_TYPES = ["classification", "regression"]

log = logging.getLogger(__name__)


class DatasetConfig(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    columns: dict[str, bool] = MapField(BooleanField(), required=True)
    label: str = StringField(required=True)
    models: list[DatasetModel] = ListField(
        EmbeddedDocumentField(DatasetModel), default=list)
    model_type: str = StringField(
        required=True, choices=MODEL_TYPES, default=MODEL_TYPES[0])

    visualization_path: str = StringField()

    def to_json(self):
        return {
            "id": str(self.id),
            "columns": self.columns,
            "label": self.label,
            "models": [str(m.id) for m in self.models],
            "model_type": self.model_type
        }

    def delete_data(self):
        if self.visualization_path:
            Path(self.visualization_path).unlink(missing_ok=True)
        for model in self.models:
            model.delete_data()
