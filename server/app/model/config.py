#!/usr/bin/env python3

from __future__ import annotations

from mongoengine import EmbeddedDocument, MapField, BooleanField, \
    StringField, ObjectIdField, ListField, EmbeddedDocumentField
from bson.objectid import ObjectId
import logging

from .model import DatasetModel

MODEL_TYPES = ["classification", "regression"]

log = logging.getLogger(__name__)


class DatasetConfig(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    columns: dict[str, bool] = MapField(BooleanField(), required=True)
    label: str = StringField(required=True)
    models: list[DatasetModel] = ListField(
        EmbeddedDocumentField(DatasetModel), default=list)

    def to_json(self):
        return {
            "id": str(self.id),
            "columns": self.columns,
            "label": self.label,
            "models": [str(m.id) for m in self.models]
        }
