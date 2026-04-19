---
title: "ML Dimensionality Reduction"
category: ml
tags: [pca, lda, tsne, dimensionality-reduction, unsupervised, feature-extraction]
sources: [raw/ml/ml-dimred.md, raw/ml/stats-dimred.md]
confidence: 0.88
last_updated: 2026-04-19
stale: false
related: [[ML Workflow]], [[ML Clustering]], [[ML Classification]], [[Statistics Basics]]
---

# ML Dimensionality Reduction

Reducing the number of features while preserving the most important information. Used to combat the curse of dimensionality, speed up training, and enable visualisation.

## When to Use
- Many correlated features (feature redundancy)
- Data visualisation (reduce to 2D or 3D)
- Speed up training of downstream models
- Remove noise from data

## PCA — Principal Component Analysis

**Unsupervised** — finds directions of maximum variance. Does not use labels.

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)   # or use n_components=0.95 to keep 95% variance
X_pca = pca.fit_transform(X_train)
print(pca.explained_variance_ratio_)
```

> 💡 Apply feature scaling BEFORE PCA. PCA is sensitive to scale.

## LDA — Linear Discriminant Analysis

**Supervised** — maximises class separation. Uses labels. Better than PCA when class distinction matters.

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA

lda = LDA(n_components=2)
X_lda = lda.fit_transform(X_train, y_train)
```

## t-SNE (Visualisation only)

Non-linear technique — excellent for visualising high-dimensional clusters in 2D/3D. **Not for feature extraction** — results are not reusable for new data.

```python
from sklearn.manifold import TSNE

tsne = TSNE(n_components=2, random_state=42)
X_tsne = tsne.fit_transform(X)
```

## PCA vs. LDA vs. t-SNE

| Technique | Supervised? | Use For |
|-----------|-------------|---------|
| PCA | No | General feature reduction, noise removal |
| LDA | Yes | Classification preprocessing, class separation |
| t-SNE | No | Visualisation only |

## Relationships
- [[ML Clustering]] — dimensionality reduction often precedes clustering
- [[ML Workflow]] — feature engineering step
- [[Statistics Basics]] — variance, covariance matrices underpin PCA

## Source References
- `raw/ml/ml-dimred.md` — implementations
- `raw/ml/stats-dimred.md` — statistical background
