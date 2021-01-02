from tpot import TPOTClassifier
import pandas as pd
import numpy as np
import shap
from sklearn.model_selection import train_test_split

data = pd.read_csv('CDM2018.csv')
feature_names = [i for i in data.columns if data[i].dtype in [np.int64, np.int64]]
X = data[feature_names]
Y = data['Man of the Match'] = data['Man of the Match'].map({'No':0,'Yes':1})

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, random_state=1, train_size=0.70, test_size=0.30)

tpot = TPOTClassifier(generations=5, population_size=20, cv=5, random_state=42, verbosity=2, max_time_mins=2)

tpot.fit(X_train, Y_train)

explainer = shap.KernelExplainer(tpot.predict_proba, X_train, link="logit")

shap_values = explainer.shap_values(X_test, nsamples=100)
shap.summary_plot(shap_values, X_test, plot_type="bar")