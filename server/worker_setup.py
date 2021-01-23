#!/usr/bin/env python3

import mongoengine
import os


def getenv(key) -> str:
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Missing environment variable {key}")
    return value


MONGO_HOST = getenv("MONGO_HOST")
mongoengine.connect("datasets", host=MONGO_HOST)
