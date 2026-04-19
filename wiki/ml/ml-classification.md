---
title: "ML Classification"
category: ml
tags: [classification, logistic-regression, svm, naive-bayes, knn, random-forest, scikit-learn]
sources: [raw/ml/ml-cls.md, raw/ml/stats-cls.md]
confidence: 0.92
last_updated: 2026-04-19
stale: false
related: [[ML Workflow]], [[ML Regression]], [[Statistics Basics]], [[Statistics for ML]]
---

# ML Classification

Predicting which **category** an observation belongs to. A supervised ML task for discrete output variables.

## When to Use Classification
- Spam detection (spam / not spam)
- Disease diagnosis (positive / negative)
- Customer churn (yes / no)
- Image recognition (cat / dog / car...)

## Classification Models

| Model | Notes |
|-------|-------|
| **Logistic Regression** | Linear decision boundary; interpretable; baseline model |
| **K-Nearest Neighbours (KNN)** | Non-parametric; no training; sensitive to scale |
| **Support Vector Machine (SVM)** | Maximises margin; good for high-dimensional data |
| **Naive Bayes** | Fast; assumes feature independence; great for text |
| **Decision Tree** | Interpretable; prone to overfitting |
| **Random Forest** | Ensemble; robust; handles non-linearity |
| **Gradient Boosting (XGBoost)** | High accuracy; slower to train |

## Logistic Regression

Despite the name, this is a **classification** model. Uses sigmoid function to output probability:

```python
from sklearn.linear_model import LogisticRegression
classifier = LogisticRegression(random_state=0)
classifier.fit(X_train, y_train)
y_pred = classifier.predict(X_test)
```

## K-Nearest Neighbours

Classifies based on majority vote of K nearest neighbours. No explicit training step.

```python
from sklearn.neighbors import KNeighborsClassifier
# Requires feature scaling!
knn = KNeighborsClassifier(n_neighbors=5, metric='minkowski', p=2)
knn.fit(X_train, y_train)
y_pred = knn.predict(X_test)
```

## Support Vector Machine (SVM)

Finds optimal hyperplane maximising the margin between classes:

```python
from sklearn.svm import SVC
# Linear kernel for linearly separable data
svm = SVC(kernel='linear', random_state=0)
# RBF kernel for non-linear data
svm_rbf = SVC(kernel='rbf', random_state=0)
svm.fit(X_train, y_train)
y_pred = svm.predict(X_test)
```

## Naive Bayes

Fast probabilistic classifier. Assumes features are independent:
```python
from sklearn.naive_bayes import GaussianNB  # for continuous features
# from sklearn.naive_bayes import MultinomialNB  # for text/counts
nb = GaussianNB()
nb.fit(X_train, y_train)
y_pred = nb.predict(X_test)
```

## Decision Tree Classifier

```python
from sklearn.tree import DecisionTreeClassifier
dt = DecisionTreeClassifier(criterion='entropy', random_state=0)
dt.fit(X_train, y_train)
y_pred = dt.predict(X_test)
```

## Random Forest Classifier

```python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=10, criterion='entropy', random_state=0)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)
```

## Evaluation

See [[ML Workflow]] for full metric details (Confusion Matrix, Accuracy, Recall, Precision, F1, ROC AUC).

**Choosing the right metric:**
- **Recall** — when false negatives are costly (e.g., cancer screening: don't miss cases)
- **Precision** — when false positives are costly (e.g., spam filter: don't flag real emails)
- **F1 Score** — when balance between precision and recall is needed
- **ROC AUC** — when comparing models or handling class imbalance

## Multi-class Classification
- Most sklearn classifiers support multi-class out of the box
- For binary-only models: use `OneVsRestClassifier` or `OneVsOneClassifier` wrappers

## Relationships
- [[ML Workflow]] — full pipeline including evaluation metrics
- [[ML Regression]] — regression for continuous targets
- [[Statistics Basics]] — confusion matrix metrics are rooted in statistics
- [[Statistics for ML]] — probability theory, class imbalance handling

## Source References
- `raw/ml/ml-cls.md` — classification model implementations
- `raw/ml/stats-cls.md` — statistical concepts for classification
