#!/usr/bin/env python3

from mongoengine import EmbeddedDocument, ObjectIdField, \
    StringField, DictField, ValidationError
from bson.objectid import ObjectId

STATUS = ["not started", "starting",  "started", "exporting", "done", "error"]

_MODEL_CONFIG_KEYS = [
    "generations",
    "population_size",
    "offspring_size",
    "mutation_rate",
    "crossover_rate",
    "scoring",
    "subsample",
    "config_dict",
    "template",
    "early_stop"
]


def _validate_model_config(v: dict):
    if not all(k in _MODEL_CONFIG_KEYS for k in v.keys()):
        raise ValidationError("Invalid keys in model config")


class DatasetModel(EmbeddedDocument):
    id = ObjectIdField(required=True, default=lambda: ObjectId())
    status: str = StringField(choices=STATUS, default="not started")

    model_config: dict = DictField(
        validation=_validate_model_config, default=dict)

    pickled_model_path: str = StringField()
    exported_model_path: str = StringField()
    log_path: str = StringField()

    def to_json(self):
        return {
            "id": str(self.id),
            "status": self.status,
            "model_config": self.model_config
        }
