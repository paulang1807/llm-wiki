**Clustering is a set of data reduction techniques which are designed to group similar observations in a dataset, such that observations in the same group are as similar to each other as possible, and observations in different groups are as different to each other as possible**

## K-Means Clustering
- Decide how many clusters
    - Can use ==**Elbow Method**== to find optimal number of clusters
        - Run the K-Means clustering first to get the number of clusters
        - Calculate [WCSS](../stats-cheatsheet/#wcss) for each cluster combination
        - Plot WCSS against the number of clusters
        - Find the **elbow** in the WCSS plot to determine the Optimal number of clusters
- Assign a random center for each of the clusters
    - May result in the **Random Initialization Trap**
- Group based on the above centers
- Recalculate the centers for each of the new groups
    - Regroup and repeat the above step till the groups stay the same (centers do not change)

## K-Means++ Clustering
- Initial selection of cluster centers is based on an algorithm
    - First center is selected uniformly at random among the data points
    - For each of the remaning data points calculate the distance, $D$ to the nearest of the already selected centers
    - Choose one new data point at random as a new center, using a weighted probability distribution where a point $x$ is chosen with probability proportional to $D(x)^2$
    - Repeat till number of desired centers have been selected 
    - Proceed using standard K-Means clustering
- Helps avoiding the **Random Initialization Trap**

*[elbow]: Point in the WCSS plot where the WCSS stops dropping sharply
*[WCSS]: Within Cluster Sum Of Squares

## Hierarchical Clustering
- Two types:
    - ==**Agglomerative**==
        - Uses the bottom up approach
        - Consider each individual data point to be a separate cluster
        - Combine the two nearest clusters into a single cluster
        - Repeat the above step till you are left with the desired number of clusters
    - ==**Divisive**==
        - Top Down approach
        - Start by considering all data points to be part of a single cluster
        - Split the clusters into smaller ones till you are left with the desired number of clusters
- Cluster distance calculations
    - Min distance: Between the two closest points
    - Max distance: Between the two farthest points
    - Average distance: Average distance between every two points of the cluster
    - Centroid distance: Between the centroids of the clusters 
    - Ward: Minimizes the variance between clusters
- Distances are representative of the dis-similarity between the clusters
- Uses **dendograms** to remember the clustering steps
    - Height of the lines from x-axis represents the distance (and also the dis-similarity) between the clusters
    - We set a threshold for the distance (or dis-similarity) beyond which we wont combine clusters (for agglomertive clustering)
    - The threshold is represented by a horizontal line in the dendogram
    - ==The number of vertical lines crossing (intersecting) the threshold line gives us the number of clusters==
    - One of the ways to find the optimal number of clusters is to ==draw the threshold line such that it crosses **the vertical line that has the largest height and does not cross any extended horizontal line**==