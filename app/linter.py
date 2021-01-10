#!/usr/bin/env python3

import pandas as pd

linters_list = []


def lint_column(col, df):
    return [res for linter in linters_list
            if (res := linter(df[col])) is not None]


def lint_dataframe(df: pd.DataFrame, *, use_dask=False):
    return {
        "lints": {
            col: lints
            for col in df.columns
            if (lints := lint_column(col, df))
        }
    }


def linter(f):
    linters_list.append(f)
    return f


@linter
def all_value_identical(col: pd.Series):
    first = col[0]
    if all(x == first for x in col):
        return "All values in the column are identical," \
            " therefore it provides no information."


@linter
def index_column(col: pd.Series):
    first = col[0]
    if first in [0, 1] and all(v == i + first for i, v in enumerate(col)):
        return "This column seems to be an index." \
            " The values are equal to the row number."


@linter
def unnamed_column(col: pd.Series):
    if "Unnamed" in col.name:
        return f"This column is unnamed: '{col.name}'"


if __name__ == "__main__":
    import sys
    import json

    df = pd.read_csv(sys.argv[1], sep=None, engine="python")
    print(json.dumps(lint_dataframe(df), indent=4))
