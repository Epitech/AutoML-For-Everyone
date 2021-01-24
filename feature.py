import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.ensemble import ExtraTreesClassifier, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from xgboost import XGBRegressor

def check_same_values(data):
    tab = []
    for keys in data.keys():
        nb = 1
        column = data[keys].values
        save = column[0]
        for value in column:
            if value != save:
                nb = 0
                break
        tab.append(nb)
    return tab

def check_index(data):
    tab = []
    for keys in data.keys():
        nb = 1
        column = data[keys].values
        save = column[0]
        for value in range(column.size):
            if value == 0:
                continue
            if column[value] != save + 1:
                nb = 0
                break
            save = column[value]
        tab.append(nb)
    return tab

def check_score(X, Y):
    bestF = SelectKBest(score_func=chi2, k=4)
    fit = bestF.fit(X, Y)
    return fit.scores_

    #dfscores = pd.DataFrame(fit.scores_)
    #dfcolumns = pd.DataFrame(X.columns)
    #featureScores = pd.concat([dfcolumns, dfscores], axis=1)
    #featureScores.columns = ['Specs', 'Score']
    #return featureScores.nlargest(4, 'Score')
    #return fit.scores_

def check_importance(X, Y):
    model = ExtraTreesClassifier()
    model.fit(X, Y)
    return model.feature_importances_

    #feat = pd.Series(model.feature_importances_, index=X.columns)
    #feat.nlargest(5).plot(kind='barh')
    #plt.show()
    #return model.feature_importances_

def check_importance_two(X, Y):
    model = LinearRegression()
    model.fit(X, Y)
    return model.coef_

def check_importance_three(X, Y):
    model = DecisionTreeRegressor()
    model.fit(X, Y)
    return model.feature_importances_

def check_importance_four(X, Y):
    model = DecisionTreeClassifier()
    model.fit(X, Y)
    return model.feature_importances_

def check_importance_five(X, Y):
    model = RandomForestRegressor()
    model.fit(X, Y)
    return model.feature_importances_

def check_importance_six(X, Y):
    model = XGBRegressor()
    model.fit(X, Y)
    return model.feature_importances_

def automated_test(data, target):
    X = data.drop([target], axis=1)
    Y = data[target]
    print(check_score(X, Y))
    print(check_importance(X, Y))
    print(check_importance_two(X, Y))
    print(check_importance_three(X, Y))
    print(check_importance_four(X, Y))
    print(check_importance_five(X, Y))
    print(check_importance_six(X, Y))
    print(check_same_values(data))
    print(check_index(data))

data_iris=pd.read_csv('datasets/iris.csv', sep=',', dtype=np.float64)
automated_test(data_iris, 'species')