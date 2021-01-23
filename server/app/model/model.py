#!/usr/bin/env python3

from mongoengine import EmbeddedDocument, ObjectIdField, IntField, \
    StringField
from bson.objectid import ObjectId

STATUS = ["not started", "starting",  "started", "exporting", "done", "error"]


class DatasetModel(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    generations = IntField(required=True, default=10)
    status = StringField(choices=STATUS, default="not started")

    pickled_model_path = StringField()
    exported_model_path = StringField()

    def to_json(self):
        return {
            "id": str(self.id),
            "generations": self.generations
        }
