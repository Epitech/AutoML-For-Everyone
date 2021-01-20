#!/usr/bin/env python3

from mongoengine import EmbeddedDocument, MapField, BooleanField, \
    StringField, ObjectIdField, ListField, EmbeddedDocumentField
from bson.objectid import ObjectId
import logging

from .model import DatasetModel

MODEL_TYPES = ["classification", "regression"]

log = logging.getLogger(__name__)


class DatasetConfig(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    columns = MapField(BooleanField(), required=True)
    label = StringField(required=True)
    models = ListField(EmbeddedDocumentField(DatasetModel), default=list)

    def to_json(self):
        return {
            "id": str(self.id),
            "columns": self.columns,
            "label": self.label,
            "models": [str(m.id) for m in self.models]
        }
