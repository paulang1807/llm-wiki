---
title: "ML Time Series Forecasting"
category: ml
tags: [forecasting, arima, sarima, prophet, lstm, time-series, statsmodels]
sources: [raw/ml/ml-tsf.md, raw/ml/stats-tsb.md]
confidence: 0.91
last_updated: 2026-04-19
stale: false
related: [[ML Time Series]], [[ML Deep Learning]], [[ML Workflow]]
---

# ML Time Series Forecasting

Predicting future values of a time series. Builds on [[ML Time Series]] concepts (stationarity, decomposition, ACF/PACF) to choose and implement the right forecasting model.

## Model Selection Guide

| Model | Best For | Notes |
|-------|----------|-------|
| **ARIMA** | Non-seasonal, stationary data | Classic statistical model |
| **SARIMA** | Seasonal data | ARIMA + seasonal terms |
| **SARIMAX** | Seasonal + exogenous variables | Adds external regressors |
| **Prophet** | Business time series with holidays | Easy to use, interpetable |
| **LSTM** | Complex non-linear patterns | Deep learning; needs more data |
| **XGBoost/LightGBM** | Feature-rich time series | Requires lag feature engineering |
| **Exponential Smoothing** | Smooth series, simple trends | Faster than ARIMA |

## ARIMA

**ARIMA(p, d, q)**:
- **p** — autoregressive order (use PACF to identify)
- **d** — differencing degree (to achieve stationarity)
- **q** — moving average order (use ACF to identify)

```python
from statsmodels.tsa.arima.model import ARIMA

model = ARIMA(train_series, order=(p, d, q))
fitted_model = model.fit()
print(fitted_model.summary())

# Forecast
forecast = fitted_model.forecast(steps=n_forecast)
```

## SARIMA

**SARIMA(p,d,q)(P,D,Q,s)** — adds seasonal terms:
- `(p,d,q)` — non-seasonal ARIMA parameters
- `(P,D,Q)` — seasonal AR, differencing, MA orders
- `s` — seasonal period (e.g., 12 for monthly, 4 for quarterly)

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

model = SARIMAX(train_series,
                order=(p, d, q),
                seasonal_order=(P, D, Q, s))
fitted = model.fit(disp=False)
forecast = fitted.forecast(steps=n_forecast)
```

## SARIMAX (With Exogenous Variables)

```python
model = SARIMAX(train_y,
                exog=train_X,           # additional covariates
                order=(p, d, q),
                seasonal_order=(P, D, Q, s))
fitted = model.fit()
forecast = fitted.forecast(steps=n_forecast, exog=test_X)
```

## Parameter Selection (Auto ARIMA)

```python
# pip install pmdarima
import pmdarima as pm

auto_model = pm.auto_arima(
    train_series,
    seasonal=True,
    m=12,               # seasonal period
    stepwise=True,
    suppress_warnings=True,
    information_criterion='aic'
)
print(auto_model.summary())
```

## Evaluation Metrics

| Metric | Formula | Notes |
|--------|---------|-------|
| **MAE** | Mean(|actual - predicted|) | Easy to interpret, same units as data |
| **RMSE** | √Mean((actual - predicted)²) | Penalises large errors more |
| **MAPE** | Mean(|actual - predicted| / actual) | Percentage error; undefined for 0 actuals |
| **SMAPE** | Symmetric MAPE | More robust than MAPE |

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
```

## Train/Test Split (Time-Aware)

> ⚠️ Do NOT use random train/test split for time series. Always split by time.

```python
train_size = int(len(series) * 0.8)
train = series[:train_size]
test = series[train_size:]
```

## LSTM Forecasting

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Reshape input to [samples, timesteps, features]
X_train_lstm = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))

model = Sequential([
    LSTM(50, activation='relu', input_shape=(n_steps, 1)),
    Dense(1)
])
model.compile(optimizer='adam', loss='mse')
model.fit(X_train_lstm, y_train, epochs=200, verbose=0)
```

## Relationships
- [[ML Time Series]] — foundational concepts (stationarity, ACF/PACF, decomposition)
- [[ML Deep Learning]] — LSTM architecture for time series
- [[ML Workflow]] — general ML pipeline; time series has time-aware train/test split
- [[Statistics Basics]] — distributions, autocorrelation statistics

## Source References
- `raw/ml/ml-tsf.md` — forecasting methods, ARIMA, parameter selection
- `raw/ml/stats-tsb.md` — statistical backing for time series models
