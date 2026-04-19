---
title: "ML Workflow"
category: ml
tags: [machine-learning, data-preparation, feature-engineering, model-selection, model-evaluation, scikit-learn]
sources: [raw/ml/index.md, raw/ml/ml-cheatsheet.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[ML Regression]], [[ML Classification]], [[ML Clustering]], [[Statistics Basics]], [[Statistics for ML]]
---

# ML Workflow

The standard end-to-end workflow for building, evaluating, and selecting machine learning models using scikit-learn. This page covers the pipeline from raw data to a validated model.

## Modeling Steps

```
1. Read/Generate Data
2. EDA (Exploratory Data Analysis)
3. Data Preparation
4. Feature Engineering
5. Split Training & Test Data
6. Data Processing (Feature Scaling)
7. Model Selection
8. Model Training (model.fit)
9. Prediction (model.predict)
10. Model Evaluation
11. Model Explainability Analysis
```

## Data Preparation

### Handling Missing Data
Options (in order of preference):
- Replace with population **mean/median/mode** for numeric columns
- Use **interpolation** or **forward/backward fill** for time-ordered data
- For categorical: replace with **mode** (most frequent value)

```python
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(missing_values=np.nan, strategy='mean')
imputer.fit(X[:, 1:3])        # fit on numeric columns only
X[:, 1:3] = imputer.transform(X[:, 1:3])
```

### Encoding Categorical Data

| Situation | Method |
|-----------|--------|
| Related/ordered categories (male/female, small/medium/large) | `LabelEncoder` |
| Unrelated, unordered categories (state names, colours) | `OneHotEncoder` via `ColumnTransformer` |

```python
# Label encoding (ordered or binary categories)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y = le.fit_transform(y)

# One-hot encoding (nominal categories)
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
ct = ColumnTransformer(transformers=[('encoder', OneHotEncoder(), [0])], remainder='passthrough')
X = np.array(ct.fit_transform(X))
```

## Feature Engineering

### Variable Transformations
Apply to linearise non-linear relationships. Common operations: log, exponential, polynomial, ratios.

**Order of transformations (important!):**
1. Power transforms (log, Box-Cox) — before differencing
2. Seasonal differencing — before trend differencing
3. Trend (one-step) differencing
4. Standardization — after nonlinear transforms
5. Normalization — always last

> 🔄 Inverse operations must be applied in reverse order when interpreting predictions.

## Train/Test Split

```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
```

## Feature Scaling

> ⚠️ **Always split data BEFORE scaling.** Apply scaler only to training data; transform test data using the fitted scaler. Never scale encoded (one-hot) columns.

| Method | Formula | When to Use |
|--------|---------|-------------|
| **Standardization** | `(x - mean) / std` → range ≈ [-3, 3] | Works for any distribution |
| **Normalization** | `(x - min) / (max - min)` → range [0, 1] | When features are normally distributed |

```python
from sklearn.preprocessing import StandardScaler
sc = StandardScaler()
X_train[:, n:] = sc.fit_transform(X_train[:, n:])  # n = number of encoded columns
X_test[:, n:] = sc.transform(X_test[:, n:])         # only transform, don't fit

from sklearn.preprocessing import MinMaxScaler
mmsc = MinMaxScaler()
X_train = mmsc.fit_transform(X_train)
```

## Model Evaluation

### Regression
```python
from sklearn.metrics import r2_score
r2_score(y_test, y_pred)    # 1.0 = perfect; closer to 1 = better
```

### Classification

**Confusion Matrix:**
| | Actual Positive | Actual Negative |
|--|--|--|
| **Predicted Positive** | TP | FP |
| **Predicted Negative** | FN | TN |

| Metric | Formula | Optimise When |
|--------|---------|--------------|
| **Accuracy** | (TP+TN) / total | Balanced classes |
| **Recall** | TP / (TP+FN) | Missing positives is costly (e.g., cancer detection) |
| **Precision** | TP / (TP+FP) | False positives are costly (e.g., spam filter) |
| **F1 Score** | Harmonic mean of Recall & Precision | Neither can be prioritised |

```python
from sklearn.metrics import (confusion_matrix, accuracy_score,
                              recall_score, precision_score, f1_score,
                              roc_curve, roc_auc_score)

confusion_matrix(y_test, y_pred)
accuracy_score(y_test, y_pred)
recall_score(y_test, y_pred)
precision_score(y_test, y_pred)
f1_score(y_test, y_pred)

# ROC — uses predicted probabilities, not labels
fpr, tpr, thresholds = roc_curve(y_test, y_pred_prob)
roc_auc_score(y_test, y_pred_prob)
```

## Model Selection

### Bias-Variance Tradeoff
- **Bias** — error from incorrect assumptions (underfitting)
- **Variance** — error from sensitivity to training data (overfitting)
- Goal: minimise both (low bias, low variance)

### K-Fold Cross Validation
Validates model on multiple subsets of training data — reduces risk of lucky/unlucky train-test splits.

```python
from sklearn.model_selection import cross_val_score
accuracies = cross_val_score(estimator=model, X=X_train, y=y_train, cv=10)
print(f"Accuracy: {accuracies.mean()*100:.2f}%  ±  {accuracies.std()*100:.2f}%")
```

### Grid Search (Hyperparameter Tuning)
Exhaustive search over parameter grid with cross-validation:

```python
from sklearn.model_selection import GridSearchCV
parameters = [
    {'C': [0.2, 0.4, 0.6, 0.8, 1], 'kernel': ['linear']},
    {'C': [0.2, 0.4, 0.6, 0.8, 1], 'kernel': ['rbf'], 'gamma': [0.1, 0.3, 0.5, 0.7, 0.9]}
]
grid_search = GridSearchCV(estimator=model, param_grid=parameters,
                           scoring='accuracy', cv=10, n_jobs=-1)
grid_search.fit(X_train, y_train)
print(f"Best Accuracy: {grid_search.best_score_*100:.2f}%")
print(f"Best Parameters: {grid_search.best_params_}")
```

## Relationships
- [[ML Regression]] — predicting continuous values
- [[ML Classification]] — predicting categories
- [[ML Clustering]] — unsupervised grouping
- [[ML Deep Learning]] — neural networks
- [[Statistics Basics]] — underpinning statistical knowledge
- [[Statistics for ML]] — stats concepts applied directly to ML
- [[ML Time Series]] — time-ordered data workflows

## Source References
- `raw/ml/index.md` — full workflow, data prep, evaluation metrics
- `raw/ml/ml-cheatsheet.md` — accuracy/error rate formulas
