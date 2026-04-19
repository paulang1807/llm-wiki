## Model Types
### [Simple Linear Regression](../stats-reg/#simple-linear-regression-model)

- Predict dependent variable based on a single independent variable
- Works well on linear pattern
- Joining data points result in a single line
- Does not require Feature Scaling

!!! abstract "Sample Code"

    [Linear Regression](http://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html)

    ```python
    from sklearn.linear_model import LinearRegression
    lr = LinearRegression(fit_intercept=True)
    lr.fit(X_train, y_train)
    intercept = lr.intercept_
    coefficient = lr.coef_
    y_pred = lr.predict(X_test)
    ```

### [Multiple Linear Regression](../stats-reg/#multiple-linear-regression-model)

- Predict dependent variable based on multiple independent variables
- Works well on linear pattern
- Joining data points result in a single line
- Does not require Feature Scaling

!!! danger "Remember"
    For ML models, the categorical variables need to be transformed to dummy variables (using one hot encoding, for example). However, care should be taken not to include all the resulting dummy variables for multiple regression models, as it will result in **multicollinearity**. This is also referred to as the ==**Dummy Variable Trap**==. 

    In order to avoid this, we should always omit one dummy variable corresponding to each categorical variable.

    ==In the python code, the scikit learn Multiple Regression class automatically takes care of this, so we don't have to omit the dummy variables explicitly==

!!! tip
    ==In Multiple Linear Regression, there is no need to apply Feature Scaling.== 
    
    The coefficients for the independent variables will put everything on the same scale.

!!! abstract "Backward Elimination using Statsmodel"

    [Statsmodel](https://www.statsmodels.org/stable/index.html)

    **Sample Code**
    ```python
    import statsmodels.api as sm

    # Here X is the array after one hot encoding the independent variable
    X = X[:, 1:]   # Avoiding the Dummy Variable Trap

    # Statsmodel does not take into account the constant (intercept).
    # So we need to add it in the form b0x0 where x0 is an array of 1s
    X = np.append(arr = np.ones((50, 1)).astype(int), values = X, axis = 1)

    regressor_OLS = sm.OLS(endog = y, exog = X_optimal).fit()
    regressor_OLS.summary()
    ```

### [Polynomial Regression](../stats-reg/#polynomial-regression-model)

- Predict dependent variable based on single independent variable
- Works well on non-linear pattern
- Joining data points result in a single line
- Does not require Feature Scaling
- Need to choose the right polynomial degree for a good bias/variance tradeoff

!!! abstract "Sample Code"

    [Polynomial Features](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.PolynomialFeatures.html)

    ```python
    from sklearn.preprocessing import PolynomialFeatures
    num_features = 4
    pf4 = PolynomialFeatures(degree=num_features, include_bias=False)
    X4 = pf4.fit_transform(X_train)

    from sklearn.linear_model import LinearRegression
    lr4 = LinearRegression()
    lr4.fit(X4, y)
    print (lr4.intercept_)
    print (lr4.coef_)
    y_pred = lr4.predict(pf4.transform(X_test))
    ```

### [Support Vector Regression](../stats-reg/#support-vector-regression-model)

- Predict dependent variable based on single independent variable
- Works very well on non linear problems; works with linear problems as well
- Not biased by outliers
- Joining data points result in a single line
- Requires Feature Scaling

!!! abstract "Sample Code"

    [Support Vector Regressor](https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVR.html)

    ```python
    # Scale Data
    from sklearn.preprocessing import StandardScaler
    # Apply feature scaling to independent variables
    # Also apply to dependent variables, if needed
    sc_x = StandardScaler()
    sc_y = StandardScaler()
    X_train = sc_x.fit_transform(X_train)
    y_train = sc_y.fit_transform(y_train)

    from sklearn.svm import SVR
    r_svr = SVR(kernel = 'rbf')  # Using radial basis function kernel
    r_svr.fit(X_train,y_train)
    y_pred_sc = r_svr.predict(sc_x.transform(X_test))
    # Inverse Transform to get the predicted value in the original scale
    y_pred = sc_y.inverse_transform(y_pred_sc.reshape(-1,1))
    ```

### [Decision Tree Regression](../stats-reg/#decision-tree-regression)

- Predict dependent variable based on one or more independent variables
    - More applicable to datasets with high number of independent variables
- Works on both linear / nonlinear problems
- Does not require Feature Scaling
- Poor results if dataset is too small
    - Overfitting can easily occur

!!! abstract "Sample Code"

    [Decision Tree Regressor](https://scikit-learn.org/1.4/modules/generated/sklearn.tree.DecisionTreeRegressor.html)

    ```python
    from sklearn.tree import DecisionTreeRegressor
    r_dt = DecisionTreeRegressor(random_state = 0)
    r_dt.fit(X_train,y_train)
    y_pred = r_dt.predict(X_test)
    ```

### Random Forest Regression

- Predict dependent variable based on one or more independent variables
- Is an ensemble method
    - Create multiple models (such as decision trees) using different combinations of subset of the independent variables
    - Need to choose the number of trees
    - Final prediction is based on an aggregated value (e.g. avg) of all the predictions
- Does not require Feature Scaling
- Difficult to interpret
- Overfitting can easily occur

!!! abstract "Sample Code"

    [Random Forest Regressor](https://scikit-learn.org/1.4/modules/generated/sklearn.ensemble.RandomForestRegressor.html)

    ```python
    from sklearn.ensemble import RandomForestRegressor
    r_rf = RandomForestRegressor(n_estimators = 10, random_state = 0)
    r_rf.fit(X_train,y_train)
    y_pred = r_rf.predict(X_test)
    ```

### XGB Regression
- Ensemble algorithm
- Can be linear or tree based
- Can be used for both regression and classification models
- Treats NA's as information
- Deals with non linear relationships between dependent amd independent variables very well

!!! abstract "Sample Code"
    [XGBoost Regressor](https://xgboost.readthedocs.io/en/stable/python/python_api.html#xgboost.XGBRegressor)

    ```python
    from xgboost import XGBRegressor
    r_xgb = XGBRegressor()
    r_xgb.fit(X_train, y_train)
    y_pred_xgb = r_xgb.predict(X_test)
    ```

*[XGB]: Extreme Gradient Boosting