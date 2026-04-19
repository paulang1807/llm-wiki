## Model Types
### [K-Means Clustering](../stats-clustr/#k-means-clustering)
- The SkLearn Model outputs a numpy array with predicted cluster indices corresponding each data point
- Works well irrespective of the dataset size

!!! abstract "Sample Code"
    [K-Means Clustering](https://scikit-learn.org/1.4/modules/generated/sklearn.cluster.KMeans.html#sklearn.cluster.KMeans)

    ```python
    from sklearn.cluster import KMeans
    # Calcluate WCSS and plot
    wcss = []
    for i in range(1, 11):
        cl_km = KMeans(n_clusters = i, init = 'k-means++', random_state = 0)
        cl_km.fit(X)
        wcss.append(cl_km.inertia_)   # Get WCSS value and append to list
    plt.plot(range(1, 11), wcss)
    plt.show()

    # Select the ELBOW based on the above plot and use that as 
    # the number of clusters below
    cl_km = KMeans(n_clusters = 5, init = 'k-means++', random_state = 0)

    # Fit model and predict
    # y_means is a numpy array with predicted cluster indices corresponding each data point
    y_km = cl_km.fit_predict(X)

    print("Cluster Predictions: ", y_km)   
    print("Cluster Centers: ", cl_km.cluster_centers_)

    # Use predicted cluster as index for the source data to plot scatter 
    plt.scatter(X[y_km == 0, 0], X[y_km == 0, 1], s = 100, c = 'blue', label = 'Cluster 1')
    ...
    plt.scatter(X[y_km == n, 0], X[y_km == n, 1], s = 100, c = 'geen', label = 'Cluster n')
    plt.scatter(cl_km.cluster_centers_[:, 0], cl_km.cluster_centers_[:, 1], s = 300, c = 'red', label = 'Centroids')
    plt.show()
    ```

### [Hierarchical Clustering](../stats-clustr/#hierarchical-clustering)
- Not appropriate for large datasets

!!! abstract "Sample Code"
    [Hierarchical Clustering](https://docs.scipy.org/doc/scipy/reference/cluster.hierarchy.html)

    [Agglomerative Clustering](https://scikit-learn.org/1.4/modules/generated/sklearn.cluster.AgglomerativeClustering.html#sklearn.cluster.AgglomerativeClustering)

    ```python
    # Plot dendogram to find optimal number of clusters
    import scipy.cluster.hierarchy as sch
    dgram = sch.dendrogram(sch.linkage(X, method = 'ward'))
    plt.show()

    # Fit model and predict
    # y_hc is a numpy array with predicted cluster indices corresponding each data point
    from sklearn.cluster import AgglomerativeClustering
    cl_ac = AgglomerativeClustering(n_clusters = 5, metric = 'euclidean', linkage = 'ward')
    y_hc = cl_ac.fit_predict(X)

    print("Cluster Predictions: ", y_hc)   

    # Use predicted cluster as index for the source data to plot scatter 
    plt.scatter(X[y_hc == 0, 0], X[y_hc == 0, 1], s = 100, c = 'blue', label = 'Cluster 1')
    ...
    plt.scatter(X[y_hc == n, 0], X[y_hc == n, 1], s = 100, c = 'green', label = 'Cluster n')
    plt.show()
    ```