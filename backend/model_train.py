from processed import get_fully_processed_data
# Linear Models
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import Ridge
from sklearn.linear_model import Lasso
from sklearn.linear_model import ElasticNet
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import SGDRegressor

# Decision Trees
from sklearn.tree import DecisionTreeClassifier
from sklearn.tree import DecisionTreeRegressor

# Random Forest
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import RandomForestRegressor

# # Extra Trees
# from sklearn.ensemble import ExtraTreesClassifier
# from sklearn.ensemble import ExtraTreesRegressor

# Support Vector Machines (SVM)
from sklearn.svm import SVC
from sklearn.svm import SVR
from sklearn.svm import LinearSVC
from sklearn.svm import LinearSVR

# K-Nearest Neighbors (KNN)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neighbors import KNeighborsRegressor

# # Naive Bayes
# from sklearn.naive_bayes import GaussianNB
# from sklearn.naive_bayes import MultinomialNB
# from sklearn.naive_bayes import BernoulliNB

# Clustering
from sklearn.cluster import KMeans
from sklearn.cluster import DBSCAN
# from sklearn.cluster import AgglomerativeClustering
# from sklearn.cluster import MeanShift

# # Dimensionality Reduction
# from sklearn.decomposition import PCA
# from sklearn.decomposition import TruncatedSVD
# from sklearn.manifold import TSNE

# Ensemble Methods
from sklearn.ensemble import AdaBoostClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.ensemble import BaggingClassifier
from sklearn.ensemble import BaggingRegressor

# # Neural Networks
# from sklearn.neural_network import MLPClassifier
# from sklearn.neural_network import MLPRegressor

# # Anomaly Detection
# from sklearn.ensemble import IsolationForest
# from sklearn.neighbors import LocalOutlierFactor

# # Discriminant Analysis
# from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
# from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, r2_score

def train_models(df,model_type,target_column,problem_type):
    processed_data = get_fully_processed_data(df,model_type,target_column)
    y = processed_data[target_column]
    X = processed_data.drop(columns=[target_column])
    X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42)
    accuracies = dict()

    if problem_type == "classification":
        cl_ml_algorithms = {
            "LogisticRegression": LogisticRegression,
            "RandomForestClassifier": RandomForestClassifier,
            "KNeighborsClassifier": KNeighborsClassifier,
            "DecisionTreeClassifier": DecisionTreeClassifier,
            "SVC": SVC,
            "LinearSVC": LinearSVC,
            "AdaBoostClassifier": AdaBoostClassifier,
            "GradientBoostingClassifier": GradientBoostingClassifier,
            "SGDClassifier": SGDClassifier,
            "BaggingClassifier": BaggingClassifier,
        }
        for name, ModelClass in cl_ml_algorithms.items():
            clf = ModelClass()
            clf.fit(X_train, y_train)
            predictions = clf.predict(X_test)
            acc = accuracy_score(y_test, predictions)
            accuracies[name] = round(acc * 100, 2)

    if problem_type == "regression":
        reg_ml_algorithms = {
            "LinearRegression": LinearRegression,
            "Ridge": Ridge,
            "Lasso": Lasso,
            "ElasticNet": ElasticNet,
            "SGDRegressor": SGDRegressor,
            "RandomForestRegressor": RandomForestRegressor,
            "KNeighborsRegressor": KNeighborsRegressor,
            "DecisionTreeRegressor": DecisionTreeRegressor,
            "GradientBoostingRegressor": GradientBoostingRegressor,
            "BaggingRegressor": BaggingRegressor,
        }
        
        for name, ModelClass in reg_ml_algorithms.items():
            reg = ModelClass()
            reg.fit(X_train, y_train)
            predictions = reg.predict(X_test)
            score = r2_score(y_test, predictions)
            accuracies[name] = round(score*100, 2)

    return accuracies

