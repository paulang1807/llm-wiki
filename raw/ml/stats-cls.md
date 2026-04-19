**Classification is the process of estimating the value of the dependent categorical variable from the independent variable(s).**

## [Logistic Regression](../stats-cheatsheet/#logistic-regression-model)

- Predict a categorical dependent variable from a set of independent variables
- Curve is defined by the [sigmoid function](../stats-cheatsheet/#cust-id-cs-log-res-sig)
- Parameters are estimated using the ==**Maximum Likelihood Estimation**==

### [Likelihood Function](../stats-cheatsheet/#likelihood-function)

- To estimate $\beta$ vectors consider a sample of data points with labels either 0 or 1
- Projection of data points on the sigmoid curve gives the probability of success (probability of the point being labelled as 1) for the data point
    - Likelihood for samples labeled as `1`
        - we try to estimate $\beta$ such that the product of probability of all data points is as close to 1 as possible
        - the projection of the data point on the sigmoid curve gives the probability of success, so $p(x)$ gives the probability of being close to 1
    - Likelihood for samples labeled as `0`
        - we try to estimate $\beta$ such that the product of probability of all data points is as close to 0 as possible 
        - the projection of the data point on the sigmoid curve gives the probability of success, so $1 - p(x)$ gives the probability of being close to 0
    - The [likelihood function](../stats-cheatsheet/#cust-id-cs-likelihood) returns the probability of how well the model(curve) predicts the label
        - Combination (Product) of conditions for samples labeled as `1` and `0`
- The likelihood function across multiple models (sigmoid curves) is optimized to get the maximum likelihood

## K-Nearest Neighbor

- Steps
    - Choose number of neighbors (K) - usually an odd number
    - Take the K nearest neighbors measured by the [Euclidean distance](../ml-cheatsheet/#euclidean-distance) (most common distance calculation used)
    - Count the number of data points in each category among the neighbors
    - Predict dependent data point to be in the category with the most neighbors

## Support Vector Machine (SVM)

- Helps deine the best decision boundary to separate the categories
- Determines the plane for the ==**Maximum Margin Hyperplane (Maximum Margin Classifier)**==
    - Equidistant from the ==**Support Vectors**==
    - **Support Vectors** are the vectors that are closest to the **Maximum Margin Hyperplane**
        - Think of these as the vectors which are the most similar (most challenging to differentiate) across the categories
- Objective is to maximize the sum of the distances of the Maximum Margin plane from the support vectors

### Using Kernels

- Mapping non linear data points to higher planes allows us to define linear boundaries to separate them
    - We can then project them back to the original plane to get the non linear separator in the original plane
- Kernels help avoid the high compute intensive requirements that comes with mapping data points to higher planes

## [Naive Bayes](../probability/#bayes-theorem)

- Assumes the dependent variables to be independent ( and are not correlated)

## Decision Tree Classification

- Also See [Decision Tree Regression](../stats-reg/#decision-tree-regression)
- Uses entropy for splitting data