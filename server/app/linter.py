#!/usr/bin/env python3

import sys
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
    return [[res, "", True] for linter in linters_list if (res := linter(df[col])) is not None]


def lint_dataframe(df: pd.DataFrame, target, type_model: str, *, use_dask=False):
    json = {
        "lints": {
            col: lints
            for col in df.columns
            if (lints := lint_column(col, df))
        }
    }
    try:
        df = df.dropna(axis=0)
        X = df.drop([target], axis=1)
        Y = df[target]
        # print(f"MODEL TYPE {type_model}", file=sys.stderr)
        if type_model == "classification":
            json = classification(X, Y, json)
        else:
            json = regression(X, Y, json)
        return json
    except ValueError:
        sys.stderr.write("Found a value who is not an integer")
        return json
    except:
        sys.stderr.write("Unexpected error")
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
    bestF = SelectKBest(k=X.shape[1])
    fit = bestF.fit(X, Y)
    total = 0
    for value in fit.scores_:
        total += value
    percent = total / 100
    for idx in range(0, fit.scores_.shape[0]):
        # print(X.columns[idx], file=sys.stderr)
        # print(fit.scores_[idx], file=sys.stderr)
        # print(percent * 3, file=sys.stderr)
        if fit.scores_[idx] < percent * 3:
            list_string.append([f"According to Feature Selection f-test ANOVA this feature is not useful in the prediction", "https://scikit-learn.org/stable/modules/generated/sklearn.feature_selection.SelectKBest.html#sklearn.feature_selection.SelectKBest", True])
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
            list_string.append([f"The column represent 1.5 % or less of the result", "https://scikit-learn.org/stable/modules/generated/sklearn.feature_selection.SelectKBest.html#sklearn.feature_selection.SelectKBest", True])
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
            list_string.append([f"The column impacts the result by only 5% or less", "https://towardsdatascience.com/feature-selection-techniques-in-python-predicting-hotel-cancellations-48a77521ee4f", True])
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
            list_string.append([f"The column has a negative coefficient or equal to 0", "https://towardsdatascience.com/linear-regression-explained-d0a1068accb9", True])
        else:
            list_string.append("")
    return list_string

#regression + Test positif
@score
def check_importance_three(X, Y):
    list_string = []
    model = DecisionTreeRegressor()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] >= 0.5:
            list_string.append([f"This column is important and positively impacts the result by 30% or more", "", False])
        else:
            list_string.append("")
    return list_string

#classification + Test Positif
#@score_classification
def check_importance_four(X, Y):
    list_string = []
    model = DecisionTreeClassifier()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] > 0.49:
            list_string.append([f"This column is important and positively impacts the result by 30% or more", "https://chiragsehra42.medium.com/decision-trees-explained-easily-28f23241248", False])
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
            list_string.append([f"The column impacts the result by only 5% or less", "https://www.kongakura.fr/article/Random-Forest-explication-et-implémentation-avec-sklearn%20python-machine%20learning-", True])
        else:
            list_string.append("")
    return list_string

#regression + Test Positif
@score
def check_importance_six(X, Y):
    list_string = []
    model = XGBRegressor()
    model.fit(X, Y)
    for idx in range(0, model.feature_importances_.shape[0]):
        if model.feature_importances_[idx] >= 0.5:
            list_string.append([f"This column impacts the result by 30% or more", "https://www.datacorner.fr/xgboost/#:~:text=Pour%20faire%20simple%20XGBoost%20(comme,arbres%20de%20boosting%20de%20gradient.&text=L%27id%C3%A9e%20est%20donc%20simple,pour%20obtenir%20un%20seul%20r%C3%A9sultat", False])
        else:
            list_string.append("")
    return list_string

if __name__ == "__main__":
    import sys
    import json

    df = pd.read_csv(sys.argv[1], sep=None, engine="python")
    print(json.dumps(lint_dataframe(df, "species"), indent=4))
