#!/usr/bin/env python3

import pandas as pd
from sklearn.feature_selection import SelectKBest, chi2, f_regression
from sklearn.ensemble import ExtraTreesClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split

linters_list = []
score_list = []
score_c_list = []


def lint_column(col, df):
    return [res for linter in linters_list if (res := linter(df[col])) is not None]


def lint_dataframe(df: pd.DataFrame, target, *, use_dask=False):
    json = {
        "lints": {
            col: lints
            for col in df.columns
            if (lints := lint_column(col, df))
        }
    }
    X = df.drop([target], axis=1)
    Y = df[target]
    json = regression(X, Y, json)
    #json = classification(X, Y, json)
    return json

def regression(X, Y, json):
    for score in score_list:
        res = score(X, Y)
        for idx in range(0, X.shape[1]):
            if res[idx] != "":
                if X.columns[idx] in json["lints"]:
                    json["lints"][X.columns[idx]].append(res[idx])
                else:
                    json["lints"][X.columns[idx]] = []
                    json["lints"][X.columns[idx]].append(res[idx])
    return json

def classification(X, Y, json):
    for score in score_c_list:
        res = score(X, Y)
        for idx in range(0, X.shape[1]):
            if res[idx] != "":
                if X.columns[idx] in json["lints"]:
                    json["lints"][X.columns[idx]].append(res[idx])
                else:
                    json["lints"][X.columns[idx]] = []
                    json["lints"][X.columns[idx]].append(res[idx])
    return json

def linter(f):
    linters_list.append(f)
    return f


def score(f):
    score_list.append(f)
    return f

def score_classification(f):
    score_c_list.append(f)
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

#classification
@score_classification
def check_score_class_classification(X, Y):
    list_string = []
    bestF = SelectKBest(score_func=chi2, k=X.shape[1])
    fit = bestF.fit(X, Y)
    total = 0
    for value in fit.scores_:
        total += value
    percent = total / 100
    for idx in range(0, fit.scores_.shape[0]):
        if fit.scores_[idx] < percent * 1.5:
            list_string.append(f"{X.columns[idx]}")
        else:
            list_string.append("")
    return list_string

#regression
@score
def check_score_class_regression(X, Y):
    list_string = []
    bestF = SelectKBest(score_func=f_regression, k=X.shape[1])
    fit = bestF.fit(X, Y)
    total = 0
    for value in fit.scores_:
        total += value
    percent = total / 100
    for idx in range(0, fit.scores_.shape[0]):
        if fit.scores_[idx] < percent * 1.5:
            list_string.append(f"{X.columns[idx]}")
        else:
            list_string.append("")
    return list_string

#classification
@score_classification
def check_importance(X, Y):
    list_string = []
    model = ExtraTreesClassifier()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] < 0.05:
            list_string.append(f"The column {X.columns[idx]} impacts the result by only 5% or less")
        else:
            list_string.append("")
    return list_string

#regression
@score
def check_importance_two(X, Y):
    list_string = []
    model = LinearRegression()
    model.fit(X, Y)
    for idx in range(0, model.coef_.shape[0]):
        if model.coef_[idx] <= 0:
            list_string.append(f"The column {X.columns[idx]} has a negative coefficient or equal to 0")
        else:
            list_string.append("")
    return list_string

#regression
#@score
def check_importance_three(X, Y):
    list_string = []
    model = DecisionTreeRegressor()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] < 0.05:
            list_string.append(f"The column {X.columns[idx]} impacts the result by only 5% or less")
        else:
            list_string.append("")
    return model.feature_importances_

#classification
#@score_classification
def check_importance_four(X, Y):
    list_string = []
    model = DecisionTreeClassifier()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] < 0.05:
            list_string.append(f"The column {X.columns[idx]} impacts the result by only 5% or less")
        else:
            list_string.append("")
    return list_string

#regression
@score
def check_importance_five(X, Y):
    list_string = []
    model = RandomForestRegressor()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] < 0.05:
            list_string.append(f"The column {X.columns[idx]} impacts the result by only 5% or less")
        else:
            list_string.append("")
    return list_string

#regression
#@score
def check_importance_six(X, Y):
    model = XGBRegressor()
    model.fit(X, Y)
    return model.feature_importances_

if __name__ == "__main__":
    import sys
    import json

    df = pd.read_csv(sys.argv[1], sep=None, engine="python")
    print(json.dumps(lint_dataframe(df, "species"), indent=4))