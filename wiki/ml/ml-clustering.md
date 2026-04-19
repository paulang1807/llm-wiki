---
title: "ML Clustering"
category: ml
tags: [clustering, k-means, hierarchical, dbscan, unsupervised, scikit-learn]
sources: [raw/ml/ml-clustr.md, raw/ml/stats-clustr.md]
confidence: 0.90
last_updated: 2026-04-19
stale: false
related: [[ML Workflow]], [[ML Dimensionality Reduction]], [[Statistics Basics]]
---

# ML Clustering

**Unsupervised** technique — group similar data points together without labelled training data. Discover natural structure in data.

## When to Use Clustering
- Customer segmentation
- Anomaly/outlier detection
- Image compression (colour quantisation)
- Document grouping
- Gene expression analysis

## K-Means Clustering

The most common clustering algorithm. Partitions data into **K** pre-specified clusters.

**Algorithm:**
1. Initialise K cluster centroids (random or K-Means++ for better init)
2. Assign each point to nearest centroid
3. Recompute centroids as mean of assigned points
4. Repeat until convergence

```python
from sklearn.cluster import KMeans

# Use elbow method to choose K
wcss = []
for i in range(1, 11):
    km = KMeans(n_clusters=i, init='k-means++', random_state=42)
    km.fit(X)
    wcss.append(km.inertia_)   # Within-Cluster Sum of Squares

# Fit with chosen K
kmeans = KMeans(n_clusters=5, init='k-means++', random_state=42)
y_kmeans = kmeans.fit_predict(X)
```

**Elbow Method** — plot WCSS vs. K; choose K at the "elbow" where improvement slows.

## Hierarchical Clustering

Builds a tree (dendrogram) of clusters. No need to specify K upfront.

```python
from sklearn.cluster import AgglomerativeClustering
import scipy.cluster.hierarchy as sch

# Plot dendrogram to find optimal K
dendrogram = sch.dendrogram(sch.linkage(X, method='ward'))

# Fit model
hc = AgglomerativeClustering(n_clusters=5, affinity='euclidean', linkage='ward')
y_hc = hc.fit_predict(X)
```

**Linkage methods:**
- `ward` — minimises within-cluster variance (most common)
- `complete` — max distance between clusters
- `average` — average distance between clusters

## DBSCAN

Density-Based Spatial Clustering. Finds clusters of arbitrary shape. Automatically detects outliers.

```python
from sklearn.cluster import DBSCAN

db = DBSCAN(eps=0.3, min_samples=10)
y_db = db.fit_predict(X)
# -1 = noise/outlier
```

**Parameters:**
- `eps` — maximum distance between two points to be in same neighbourhood
- `min_samples` — minimum points required to form a dense region

## Evaluation (Unsupervised)

Since there are no ground truth labels, evaluation is harder:

| Metric | Description |
|--------|-------------|
| **Silhouette Score** | How similar each point is to its cluster vs. others. Range [-1, 1]; higher is better |
| **WCSS (Inertia)** | Sum of squared distances to nearest centroid; lower is better |
| **Davies-Bouldin Index** | Lower is better |

```python
from sklearn.metrics import silhouette_score
score = silhouette_score(X, labels)
```

## Relationships
- [[ML Dimensionality Reduction]] — often applied before clustering to reduce noise
- [[ML Workflow]] — clustering is one type of ML task (unsupervised)
- [[Statistics Basics]] — distance metrics, variance underpin clustering

## Source References
- `raw/ml/ml-clustr.md` — clustering implementations
- `raw/ml/stats-clustr.md` — statistical background for clustering
