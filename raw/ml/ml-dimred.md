## Model Types
### [Principal Component Analysis](../stats-dimred/#principal-component-analysis)

- Requires feature scaling

!!! abstract "Sample Code"
    [Principal Component Analysis](https://scikit-learn.org/1.4/modules/generated/sklearn.decomposition.PCA.html#sklearn.decomposition.PCA)

    ```python
    from sklearn.decomposition import PCA
    
    # n_components is the final number of extracted features
    # start with 2, increase if the prediction is not good enough
    pca = PCA(n_components = 2)  
    X_train = pca.fit_transform(X_train)

    # Train Model and Predict
    # This example uses Logistic Regression
    # Other classification models can also be used
    from sklearn.linear_model import LogisticRegression
    c_lr = LogisticRegression(random_state = 0)
    c_lr.fit(X_train, y_train)
    y_pred_lr = c_lr.predict(pca.transform(sc.transform(X_test)))
    ```

### [Linear Discriminant Analysis](../stats-dimred/#linear-discriminant-analysis)

- Requires feature scaling

!!! abstract "Sample Code"
    [Linear Discriminant Analysis](https://scikit-learn.org/1.4/modules/generated/sklearn.discriminant_analysis.LinearDiscriminantAnalysis.html#sklearn.discriminant_analysis.LinearDiscriminantAnalysis)

    ```python
    from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
    
    # n_components is the final number of extracted features
    lda = LDA(n_components = 2)
    # LDA uses the dependent variable as well
    X_train = lda.fit_transform(X_train, y_train)

    # Train Model and Predict
    # This example uses Logistic Regression
    # Other classification models can also be used
    rom sklearn.linear_model import LogisticRegression
    c_lr = LogisticRegression(random_state = 0)
    c_lr.fit(X_train, y_train)
    y_pred_lr = c_lr.predict(lda.transform(sc.transform(X_test)))
    ```

### Kernel PCA

- Requires feature scaling

!!! abstract "Sample Code"
    [Kernel PCA](https://scikit-learn.org/1.4/modules/generated/sklearn.decomposition.KernelPCA.html#sklearn.decomposition.KernelPCA)

    ```python
    from sklearn.decomposition import KernelPCA
    
    # n_components is the final number of extracted features
    # start with 2, increase if the prediction is not good enough
    kpca = KernelPCA(n_components = 2, kernel = 'rbf')
    X_train = kpca.fit_transform(X_train)

    # Train Model and Predict
    # This example uses Logistic Regression
    # Other classification models can also be used
    from sklearn.linear_model import LogisticRegression
    c_lr = LogisticRegression(random_state = 0)
    c_lr.fit(X_train, y_train)
    y_pred_lr = c_lr.predict(kpca.transform(sc.transform(X_test)))
    ```