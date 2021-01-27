#!/usr/bin/env python3

import pandas as pd
from base64 import b64encode, b64decode


def create_column_mapping(df: pd.DataFrame):
    map_list = {}
    for idx in range(0, len(df.columns)):
        if df.dtypes[idx] == object:
            tmp_value, tmp_map = map_column(df[df.columns.values[idx]])
            map_list[df.columns[idx]] = tmp_map
    return map_list


def map_column(column: pd.Series):
    d = {}
    column = column.fillna("")
    new_values = column.astype('category').cat.rename_categories(
        range(1, column.nunique() + 1))
    for idx in range(0, len(new_values)):
        d[column[idx]] = new_values[idx]
    return new_values, d


def decode_mapping(mapping):
    return {
        col: {b64decode(k.encode()).decode(): v for k, v in m.items()}
        for col, m in mapping.items()
    }


def encode_mapping(mapping):
    return {
        col: {b64encode(k.encode()).decode(): v for k, v in m.items()}
        for col, m in mapping.items()
    }


def convert_with_column_mapping(df: pd.DataFrame, mapping):
    for col in df.columns:
        if col in mapping:
            print(df[col].dtype)
            df[col] = df[col].astype(
                "category").cat.rename_categories(mapping[col])
    return df


def reconvert_one_value(column, value, mapping):
    mapping = {
        col: {v: k for k, v in m.items()}
        for col, m in mapping.items()
    }
    if column in mapping:
        return mapping[column][value]


def reconvert_with_column_mapping(df: pd.DataFrame, mapping):
    mapping = {
        col: {v: k for k, v in m.items()}
        for col, m in mapping.items()
    }
    for col in df.columns:
        if col in mapping:
            print(df[col].dtype)
            df[col] = df[col].astype(
                "category").cat.rename_categories(mapping[col])
    return df


if __name__ == "__main__":
    import sys

    df = pd.read_csv(sys.argv[1], sep=None)
    print(df)
    mapping = create_column_mapping(df)
    print(mapping)
    print(encode_mapping(mapping))
    print(decode_mapping(encode_mapping(mapping)))
    print(df)
    converted = convert_with_column_mapping(df, mapping)
    print(converted)
    print(reconvert_with_column_mapping(converted, mapping))
