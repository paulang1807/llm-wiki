**There are two types of Dimensionality Reduction techniques:**

- **Feature Selection**
- **Feature Extraction**

## Feature Selection
Includes techniques such as Backward Elimination, Forward Selection, Bidirectional Elimination, Score Comparison etc.
See [Regression Modeling Methods](../stats-reg/#modeling-methods)

## Feature Extraction
### Principal Component Analysis
Used for

- Noise Filtering
- Vizualization
- Feature Extraction

Commonly used in areas of

- Stock Market Predictions
- Gene Data Analysis

Basics

- It is a linear transformation technique used for dimensionality reduction 
- Identifies correlation between variables
    - If a strong correlation is found, then dimensionality is reduced by removing the variable
- The goal is to reduce the dimensions of a dataset by projecting it into a lower dimension
    - Tries to find the directions (principal components) that maximize the variance in a dataset
    - "ignores" class labels
    - Categorized as unsupervised algorithm
- Highly affected by outliers in data

!!! abstract "PCA Steps"
    - Standardize the data
    - Obtain the ==**Eigenvectors**== and ==**Eigenvalues**== 
        - From the covariance or correlation matrix
        - ==**Singular Vector Decomposition**==
    - Sort eigenvalues in descending order 
        - Choose $k$ eigenvectors corresponding to the $k$ largest eigenvalues, where $k$ is the dimensionality of the lower dimension
    - Construct the projection matrix from the selected eigenvectors
    - Transform the original dataset via the projection matrix to obtain a $k$ dimensional feature representation

### Linear Discriminant Analysis

- It is a linear transformation technique used for dimensionality reduction
- Similar to PCA except that
    - In addition to finding the component axises, we are also interested in the axes that maximizes the separation between different classes
    - Categorized as supervised algorithm because of the relation to the dependent variable
    - Goal is to project to a lower dimension while maintaining the information for separating the classes

!!! abstract "LDA Steps"
    - Compute the $d$ dimensional mean vectors for the different classes in the dataset where $d$ is the original dimensional space
    - Compute the scatter matrices
        - in-between-class scatter matrix
        - within-class scatter matrix
    - Obtain the ==**Eigenvectors**== and ==**Eigenvalues**== for the scatter matrices
    - Sort eigenvalues in descending order 
        - Choose $k$ eigenvectors corresponding to the $k$ largest eigenvalues, where $k$ is the dimensionality of the lower dimension
    - Construct a $d \times k$ dimensional matrix where every column represents an eigenvector
    - Transform the original dataset via the $d \times k$ eigenvector matrix to obtain a $k$ dimensional feature representation

        - Achieved using matrix multiplication of the original and eigenvector matrices