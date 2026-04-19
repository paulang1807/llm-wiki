---
title: "ML Regression"
category: ml
tags: [regression, linear-regression, polynomial-regression, svr, decision-tree, random-forest, scikit-learn]
sources: [raw/ml/ml-reg.md, raw/ml/stats-reg.md]
confidence: 0.93
last_updated: 2026-04-19
stale: false
related: [[ML Workflow]], [[ML Classification]], [[Statistics for ML]], [[Statistics Basics]]
---

# ML Regression

Predicting a **continuous numeric** output variable from one or more input features. The simplest and most commonly used supervised ML task.

## When to Use Regression

Use when the target variable is continuous:
- Predicting house prices, stock returns, temperature
- Estimating demand, revenue, duration

## Regression Models

| Model | Type | Best For |
|-------|------|----------|
| **Simple Linear** | Parametric, linear | 1 feature, linear relationship |
| **Multiple Linear** | Parametric, linear | Multiple features, linear relationships |
| **Polynomial** | Parametric, non-linear | Curved relationships between features |
| **SVR (Support Vector Regression)** | Non-parametric | High-dimensional, non-linear; requires feature scaling |
| **Decision Tree** | Non-parametric | Non-linear, interpretable; prone to overfitting |
| **Random Forest** | Ensemble | Robust, handles non-linearity, reduces overfitting |

## Linear Regression

Models relationship as: `y = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ`

**Assumptions:**
1. Linearity between dependent and independent variables
2. Homoscedasticity (constant variance of residuals)
3. Multivariate normality
4. No or little multicollinearity
5. No auto-correlation

```python
from sklearn.linear_model import LinearRegression
regressor = LinearRegression()
regressor.fit(X_train, y_train)
y_pred = regressor.predict(X_test)
```

## Polynomial Regression

Adds polynomial features to capture curved relationships:
```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

poly_reg = PolynomialFeatures(degree=4)
X_poly = poly_reg.fit_transform(X)

lin_reg = LinearRegression()
lin_reg.fit(X_poly, y)
y_pred = lin_reg.predict(poly_reg.fit_transform(X_test))
```

## Support Vector Regression (SVR)

Finds a hyperplane that fits most data within an ε-tube. Requires feature scaling.

```python
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler

# SVR requires feature scaling (both X and y)
sc_X = StandardScaler()
sc_y = StandardScaler()
X_scaled = sc_X.fit_transform(X)
y_scaled = sc_y.fit_transform(y.reshape(-1, 1)).ravel()

svr = SVR(kernel='rbf')
svr.fit(X_scaled, y_scaled)

# Inverse transform predictions back to original scale
y_pred = sc_y.inverse_transform(svr.predict(sc_X.transform(X_test)).reshape(-1, 1))
```

## Decision Tree Regression

```python
from sklearn.tree import DecisionTreeRegressor
dt_regressor = DecisionTreeRegressor(random_state=0)
dt_regressor.fit(X_train, y_train)
y_pred = dt_regressor.predict(X_test)
```

## Random Forest Regression

An ensemble of decision trees using bagging (bootstrap aggregating):
```python
from sklearn.ensemble import RandomForestRegressor
rf_regressor = RandomForestRegressor(n_estimators=10, random_state=0)
rf_regressor.fit(X_train, y_train)
y_pred = rf_regressor.predict(X_test)
```

## Evaluation

```python
from sklearn.metrics import r2_score
r2 = r2_score(y_test, y_pred)
# Perfect = 1.0; Higher is better; Can be negative (worse than mean predictor)
```

**R² Interpretation:**
- `0.9+` — excellent fit
- `0.7–0.9` — good fit
- `0.5–0.7` — moderate fit
- `< 0.5` — poor fit; reconsider model or features

## Relationships
- [[ML Workflow]] — regression fits into the full ML pipeline
- [[ML Classification]] — classification predicts categories vs. regression's continuous values
- [[Statistics for ML]] — statistics for regression (R², residuals, regression coefficients)
- [[Statistics Basics]] — distributions, correlation underpin regression assumptions

## Source References
- `raw/ml/ml-reg.md` — regression model implementations
- `raw/ml/stats-reg.md` — statistical theory behind regression
