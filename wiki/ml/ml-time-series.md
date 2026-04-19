---
title: "ML Time Series"
category: ml
tags: [time-series, stationarity, autocorrelation, arima, forecasting, lstm, decomposition]
sources: [raw/ml/ml-tsb.md, raw/ml/stats-tsb.md, raw/ml/ml-tsf.md]
confidence: 0.92
last_updated: 2026-04-19
stale: false
related: [[ML Workflow]], [[ML Deep Learning]], [[Statistics Basics]], [[ML Time Series Forecasting]]
---

# ML Time Series

Working with time-ordered sequential data. Covers both the foundational concepts (stationarity, decomposition) and modelling approaches.

## Key Properties of Time Series

| Property | Description |
|----------|-------------|
| **Trend** | Long-term upward or downward movement |
| **Seasonality** | Regular repeating pattern at fixed intervals |
| **Cyclicality** | Irregular longer-term fluctuations |
| **Noise/Residuals** | Random variation after removing trend + seasonality |

## Stationarity

A time series is **stationary** if its statistical properties (mean, variance, autocorrelation) do not change over time. Most models require stationarity.

**Tests for stationarity:**
- **ADF (Augmented Dickey-Fuller)** — p-value < 0.05 → stationary
- **KPSS** — p-value > 0.05 → stationary

**Making a series stationary:**
- **Differencing** — subtract previous value: `y_t - y_{t-1}`
- **Log transform** — stabilises variance
- **Seasonal differencing** — subtract same period last season

```python
from statsmodels.tsa.stattools import adfuller
result = adfuller(series)
print(f'ADF Statistic: {result[0]:.4f}')
print(f'p-value: {result[1]:.4f}')
# p < 0.05 → reject null → series is stationary
```

## Autocorrelation

How much a series correlates with its own past values:
- **ACF (Autocorrelation Function)** — correlation with all lags
- **PACF (Partial Autocorrelation Function)** — correlation with specific lag controlling for intermediate lags

Used to identify ARIMA parameters (p, d, q).

```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
plot_acf(series, lags=40)
plot_pacf(series, lags=40)
```

## Decomposition

Separate a time series into its components:

```python
from statsmodels.tsa.seasonal import seasonal_decompose
decomposition = seasonal_decompose(series, model='additive', period=12)
# or model='multiplicative' when components interact multiplicatively
decomposition.plot()
# Access components:
decomposition.trend
decomposition.seasonal
decomposition.resid
```

**Additive model**: `y = Trend + Seasonality + Residual`
**Multiplicative model**: `y = Trend × Seasonality × Residual` (use when seasonality grows with trend)

## Transformations

Order of transformations (important for reversibility):
1. Power transforms (log, Box-Cox) — first
2. Seasonal differencing — second
3. Trend differencing — third
4. Standardisation — after nonlinear transforms
5. Normalisation — last

## White Noise and Random Walk

- **White Noise**: Series with zero mean, constant variance, zero autocorrelation — unpredictable
- **Random Walk**: Each value = previous value + white noise. Non-stationary. Differencing converts it to white noise.

## Key Libraries

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller, acf, pacf
```

## Relationships
- [[ML Time Series Forecasting]] — models for predicting future values
- [[ML Deep Learning]] — LSTM and transformer models for sequence data
- [[Statistics Basics]] — autocorrelation, distributions, hypothesis testing
- [[ML Workflow]] — time series has a specialised data prep workflow

## Source References
- `raw/ml/ml-tsb.md` — time series basics and implementations
- `raw/ml/stats-tsb.md` — statistics for time series (stationarity, ACF/PACF)
- `raw/ml/ml-tsf.md` — time series forecasting methods
