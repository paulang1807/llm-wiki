---
title: "Probability"
category: concepts
tags: [probability, bayes, distributions, fundamentals]
sources: [raw/ml/probability.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[Statistics Basics]], [[Statistics for ML]]
---

# Probability

Foundational concepts for understanding uncertainty and data distributions in machine learning and data science.

## Fundamentals
- **P(Impossible Event) = 0**
- **P(Certain Event) = 1**
- Non-certain probabilities range between **[0, 1]**.
- **Complementary Events**: Mutually exclusive events whose probabilities sum to 1. 

### Key Logical Operators
- **OR**: Signifies **addition**.
- **AND**: Signifies **multiplication**.

> 💡 **Expression**: $P(\text{at least 1 success}) = 1 - P(\text{all failures})$

---

## 📐 Structure of Probability Space

### Partition of State Space ($\Omega$)
A collection of events $A_1, A_2, \cdots, A_N$ that are mutually exclusive and collectively exhaustive (they cover the entire sample space without overlapping).

### Union and Intersection
- **Intersection ($A \cap B$)**: Probability that both events occur.
- **Union ($A \cup B$)**: Probability that at least one of the events occurs.

---

## 🧠 Bayesian Probability

### Conditional Probability ($P(A|B)$)
The probability of event A occurring given that event B has already occurred.

### Bayes' Theorem
Calculates the probability of an event based on prior knowledge of conditions related to the event.

### Bayes Factor (BF)
The ratio of the likelihoods of two competing hypotheses. 
- **BF > 1**: Data provides evidence **for** the hypothesis (Posterior > Prior).
- **BF < 1**: Data provides evidence **against** the hypothesis (Posterior < Prior).

---

## 📈 Probability Distributions

### Beta Distribution
A probability distribution **on probabilities**.
- Models the distribution of success probability given past successes and failures.
- Domain is strictly bounded between **[0, 1]**.
- **Skewness**: Left-skewed for higher success probabilities; Right-skewed for weaker ones.

---

## Source References
- `raw/ml/probability.md` — Probability basics and Bayesian concepts.
