---
title: "Statistics Basics"
category: concepts
tags: [statistics, eda, distributions, hypothesis-testing, sampling, probability]
sources: [raw/ml/stats-basics.md, raw/ml/stats-cheatsheet.md, raw/ml/stats-eda.md, raw/ml/probability.md]
confidence: 0.93
last_updated: 2026-04-19
stale: false
related: [[Statistics for ML]], [[Probability]], [[ML Workflow]], [[ML Classification]]
---

# Statistics Basics

Foundational statistics knowledge that underpins machine learning, data analysis, and data science. This page covers core concepts; see [[Statistics for ML]] for ML-specific applications.

## Descriptive Statistics

### Measures of Central Tendency
| Measure | Description | Use When |
|---------|-------------|----------|
| **Mean** | Sum / count | Normal distribution, no outliers |
| **Median** | Middle value when sorted | Skewed data, outliers present |
| **Mode** | Most frequent value | Categorical data, finding common values |

### Measures of Spread
| Measure | Description |
|---------|-------------|
| **Range** | Max − Min |
| **Variance** | Average squared deviation from mean |
| **Standard Deviation** | √Variance — same units as data |
| **IQR** | Q3 − Q1 — robust to outliers |

### Skewness
- **Positive skew (right)** — long tail on right; mean > median
- **Negative skew (left)** — long tail on left; mean < median
- **Zero skew** — symmetric distribution

## Exploratory Data Analysis (EDA)

Standard EDA steps:
1. Check shape, dtypes, head/tail
2. Descriptive statistics (`describe()`)
3. Missing value analysis
4. Distribution visualization (histograms, box plots)
5. Correlation analysis
6. Outlier detection

### Handling Outliers
Options: remove, cap (winsorize), transform (log), or keep (if valid extreme values).

Detection methods:
- **IQR method**: outlier if `x < Q1 - 1.5*IQR` or `x > Q3 + 1.5*IQR`
- **Z-score**: outlier if `|z| > 3`
- **Box plots**: visual inspection

## Distributions

### Normal (Gaussian) Distribution
- Bell-shaped, symmetric around mean
- **68-95-99.7 rule**: 68% within 1σ, 95% within 2σ, 99.7% within 3σ
- Foundation for many statistical tests

### Common Distributions
| Distribution | Use Case |
|-------------|----------|
| **Normal** | Continuous, symmetric data; central limit theorem |
| **Binomial** | Count of successes in n trials |
| **Poisson** | Count of rare events in interval |
| **Exponential** | Time between events |
| **Uniform** | Equal probability across range |
| **Log-Normal** | Data that is normally distributed after log transform |

## Hypothesis Testing

Testing whether observed data supports a claim about a population.

### Framework
1. Define **H₀** (null hypothesis — no effect) and **H₁** (alternative hypothesis — effect exists)
2. Choose significance level **α** (typically 0.05)
3. Compute **test statistic** and **p-value**
4. Decision: if **p < α**, reject H₀

### Type I and Type II Errors
| | H₀ is True | H₀ is False |
|--|--|--|
| **Reject H₀** | Type I Error (False Positive) α | Correct (Power) |
| **Fail to Reject H₀** | Correct | Type II Error (False Negative) β |

### Common Tests
| Test | When to Use |
|------|------------|
| **t-test** | Compare means of 1–2 groups |
| **ANOVA** | Compare means of 3+ groups |
| **Chi-squared** | Independence of categorical variables |
| **Shapiro-Wilk** | Test for normality |

## Correlation

- **Pearson** — linear correlation between continuous variables; range [-1, 1]
- **Spearman** — rank-based; works for non-linear monotonic relationships
- **Point-Biserial** — correlation between continuous and binary variable

> ⚠️ Correlation ≠ causation. Always investigate confounders.

## Sampling

| Method | Description |
|--------|-------------|
| **Simple Random** | Every item equally likely |
| **Stratified** | Sample proportionally from subgroups |
| **Cluster** | Sample entire clusters randomly |
| **Systematic** | Every Nth item |
| **Bootstrap** | Resample with replacement — used for confidence intervals |

## Relationships
- [[Probability]] — mathematical foundation of statistics
- [[Statistics for ML]] — stats concepts applied in ML pipelines
- [[ML Workflow]] — EDA and feature engineering use statistics heavily
- [[ML Classification]] — precision, recall, F1 are statistical evaluation metrics
- [[ML Time Series]] — stationarity, autocorrelation are key time-series statistics

## Source References
- `raw/ml/stats-basics.md` — central tendency, spread, distributions
- `raw/ml/stats-cheatsheet.md` — comprehensive cheatsheet
- `raw/ml/stats-eda.md` — EDA techniques and outlier handling
- `raw/ml/probability.md` — probability foundations
