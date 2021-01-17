#!/usr/bin/env python3

from mongoengine import EmbeddedDocument, MapField, BooleanField, \
    StringField, ObjectIdField
from bson.objectid import ObjectId
import logging

MODEL_TYPES = ["classification", "regression"]

log = logging.getLogger(__name__)


class DatasetConfig(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    columns = MapField(BooleanField(), required=True)
    label = StringField(required=True)
    # model = StringField(required=True, choices=MODEL_TYPES)

    def to_json(self):
        return {
            "id": str(self.id),
            "columns": self.columns,
            "label": self.label
        }
