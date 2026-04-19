## Modeling Steps
- Generate or Read data
- [EDA](./stats-eda/)
- Data Preparation
    - Handle outliers as needed
    - Separate the independent and dependent variables
    - Handle missing data (Needed if there is missing data)
    - Encode Categorical Data (Needed if there is categorical data)
- Feature Engineering
    - Variable Transformations
    - Add calculated columns
    - Add derived columns
    - Remove/Process incorrect data (e.g. negative quantity)
    - Remove nulls if/as needed
    - [Handle Outliers](./stats-eda/#handling-outliers)
- Split training and test data
- Data Processing
    - Feature Scaling (Needed only for some models)
- Model Selection
- Model Training (`model.fit` or `model.fit_transform`)
- Prediction (`model.predict`)
- Model Evaluation
- Model Explainability Analysis

### Data Preparation
#### Handle missing data
- One option is to replace missing value with population mean/median/mode for the column
    - In some cases it may make more sense to impute using values based on matching or neighboring segments
- We can also use interpolation or forward/backward fill techniques
- For categorical variables, it may make sense to replace missing values with the most frequently occuring values
    - We can use the **mode** as the impute strategy in such cases

!!! abstract "Sample Code"

    [Simple Imputer](https://scikit-learn.org/stable/modules/generated/sklearn.impute.SimpleImputer.html)

    ```python
    from sklearn.impute import SimpleImputer
    imputer = SimpleImputer(missing_values=np.nan, strategy='mean')
    imputer.fit(X[:, 1:3])  # Include all numeric columns
    X[:, 1:3] = imputer.transform(X[:, 1:3])
    ```

#### Encode Categorical Data
- This usually pushes the encoded columns to the front of the array

**Encoding the Categorical data when the data is related (e.g. male, female etc.) or the order matters (e.g. small,medium,large etc.)**
!!! abstract "Sample Code"
    [Label Encoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.LabelEncoder.html)

    ```python
    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y = le.fit_transform(y)
    ```

**Encoding the Categorical data when the data points are not related and the order does not matter (e.g. state names)**
!!! abstract "Sample Code"
    [Column Transformer](https://scikit-learn.org/stable/modules/generated/sklearn.compose.ColumnTransformer.html) 

    [One Hot Encoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html)

    ```python
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import OneHotEncoder
    
    ct = ColumnTransformer(transformers=[('encoder', OneHotEncoder(), [0])], remainder='passthrough')
    X = np.array(ct.fit_transform(X))
    ```

### Feature Engineering
#### Variable Transformations
- Identify variables to transform based on functional knowledge and bivariate analysis
    - Commonly applied to transform non linear relations to linear relations
- Approaches
    - Create derived columns using relevant functions and/or calculations, e.g. calculating ratios, log, exponential, roots, higher polynomial degrees etc.

!!! tip "Order of Transformations"
    - **Power transforms** (log transform, box cos transform etc.) should be performed prior to differencing
    - **Seasonal differencing** should be performed prior to **one-step (trend) differencing**
    - **Standardization** is linear and should be performed on the sample after any nonlinear transforms and differencing
    - **Normalization** is a linear operation but it should be the final transform performed to maintain the preferred scale
    - The inverse operations should be performed in the opposite order

### Split training and test data

!!! abstract "Sample Code"
    [Train Test Split](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)

    ```python
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 0)
    ```

### Data Processing
#### Feature Scaling
- Used in some ML models(not all) 
    - Models where there is an implicit relation between the dependent and independent variables (e.g. Support Vector Regression Model)
- Done in order to avoid some features dominating the other features
- Feature scaling is always applied to columns
- ==Should not be applied to encoded columns==
    - Will result in loss of interpretation (of the original categories) if applied 

!!! danger "Remember"
    Feature Scaling should always be done after splitting the training and test data. The test data should be clean and not a part of the feature scaling process.

##### Standardization
- This will result in all the features taking values between -3 and 3
- Works all the time irrespective of the distribution of the features
$$ x_{stand} = \frac{x - mean(x)}{standard \ deviation (x)} $$

!!! abstract "Sample Code"
    [Standard Scaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html)

    ```python
    from sklearn.preprocessing import StandardScaler
    sc = StandardScaler()

    # When some independent variables have been encoded
    # Scale only the non-encoded colummns
    # Since the encoded columns are present in the front of the array, we usually just take everything from the index of the first non encoded numerical column
    # In the below code, 'n' is the number of resulting encoded columns after encoding
    X_train[:, n:] = sc.fit_transform(X_train[:, n:])

    # When no independent variables have been encoded
    # Apply feature scaling to all independent variables
    # Also apply to dependent variables, if needed
    X_train = sc.fit_transform(X_train)
    ```

##### Normalization
- This will result in all the features taking values between 0 and 1
- Recommended when the distribution for most of the features are normalized
$$ x_{norm} = \frac{x - min(x)}{max(x) - min (x)} $$

!!! abstract "Sample Code"
    [MinMax Scaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html)

    ```python
    from sklearn.preprocessing import MinMaxScaler
    mmsc = MinMaxScaler()

    X_train = mmsc.fit_transform(X_train)
    ```

### [Model Evaluation](./ml-cheatsheet/#accuracy-and-error-rates)
#### Regression Models
!!! abstract "Sample Code"
    [R2 Score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.r2_score.html#sklearn.metrics.r2_score)

    ```python
    from sklearn.metrics import r2_score
    r2_score(y_test, y_pred)
    ```

#### Classification Models
The common practice is to optimize for **Recall** or **Precision** depending on the use case. If neither can be used, then optimize for **F1 score**.

##### Confusion Matrix
Displays a matrix of four categories based on the actual and predicted labels

- True positive : actual = 1, predicted = 1
- False positive : actual = 0, predicted = 1
- False negative : actual = 1, predicted = 0
- True negative : actual = 0, predicted = 0

Also see [Type I and Type II Errors](./stats-hypo-test/#type-i-and-type-ii-errors)


<p id="cust-id-indx-conf-matr"></p>
|             | Actual Positive    | Actual Negative  |
| :---------- | :-------------------: |:----------------: |
| Predicted Positive | TP  | FP  |
| Predicted Negative | FN | TN|

!!! abstract "Sample Code"
    [Confusion Matrix](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.confusion_matrix.html#sklearn.metrics.confusion_matrix)

    ```python
    from sklearn.metrics import confusion_matrix
    confusion_matrix(y_test, y_pred)
    ```

##### [Accuracy](./ml-cheatsheet/#accuracy-and-error-rates)
Fractions of samples predicted correctly

!!! abstract "Sample Code"
    [Accuracy Score](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.accuracy_score.html#sklearn.metrics.accuracy_score)

    ```python
    from sklearn.metrics import accuracy_score
    accuracy_score(y_test, y_pred)
    ```

##### [Recall](./ml-cheatsheet/#precision-and-recall)
Based on the values in the **Actual Positive** column in the [confusion matrix](#cust-id-indx-conf-matr). It is the fractions of positive events that are predicted correctly

!!! abstract "Sample Code"
    [Recall Score](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.recall_score.html#sklearn.metrics.recall_score)

    ```python
    from sklearn.metrics import recall_score
    recall_score(y_test, y_pred)
    ```

##### [Precision](./ml-cheatsheet/#precision-and-recall)
Based on the values in the **Predicted Positive** row in the [confusion matrix](#cust-id-indx-conf-matr). It is the fractions of predicted positive events that are actually positive

!!! abstract "Sample Code"
    [Precision Score](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.precision_score.html#sklearn.metrics.precision_score)

    ```python
    from sklearn.metrics import precision_score
    precision_score(y_test, y_pred)
    ```

##### [F1 Score](./ml-cheatsheet/#f1-score)
Harmonic mean of recall and precision

- The higher the score the better the model

!!! abstract "Sample Code"
    [F1 Score](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.f1_score.html#sklearn.metrics.f1_score)

    ```python
    from sklearn.metrics import f1_score
    f1_score(y_test, y_pred)
    ```

##### ROC Curve and ROC AUC Score
- Help with understanding the balance between true positive rate and false positive rates
    - The area under curve metric helps to analyze the performance
- Inputs to these functions are the actual labels and the predicted probabilities (not the predicted labels)
- ROC stands for Receiver Operating Characteristic
- The roc curve function returns three lists:
    - thresholds: all unique prediction probabilities in descending order
    - fpr: the false positive rate (FP / (FP + TN)) for each threshold
    - tpr: the true positive rate (TP / (TP + FN)) for each threshold

!!! abstract "Sample Code"
    [ROC Curve](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.roc_curve.html#sklearn.metrics.roc_curve)

    ```python
    from sklearn.metrics import roc_curve
    fpr, tpr, thresholds = roc_curve(y_test, y_pred_prob)
    ```

    [ROC AUC Score](https://scikit-learn.org/1.4/modules/generated/sklearn.metrics.roc_auc_score.html#sklearn.metrics.roc_auc_score)

    ```python
    from sklearn.metrics import roc_auc_score
    roc_auc_score(y_test, y_pred_prob)
    ```

### Model Selection
#### Bias-Variance Tradeoff
!!! abstract "Terminology"
    - **Bias**: Error in ML model due to incorrect assumptions 
    - **Variance**: Changes in the model resulting from using different parts of the training dataset for training

The ideal scenario is to have low bias and low variance

#### K-Fold Cross Validation
- Used to validate the model using various combinations of the training data
    - Ensures that we don't just rely on a single validation using test data to determine how good or bad the model is
- Steps
    - Divide the training data into $k$ folds
    - Iterate over the folds using $k -1$ folds for training and the 1 fold for testing

!!! abstract "Sample Code"
    [Cross Validation Score](https://scikit-learn.org/1.4/modules/generated/sklearn.model_selection.cross_val_score.html#sklearn.model_selection.cross_val_score)

    ```python
    from sklearn.model_selection import cross_val_score
    # Example for SVC classifier
    accuracies = cross_val_score(estimator = c_svc, X = X_train, y = y_train, cv = 10)   # 10 training splits
    accuracies
    print("Accuracy: {:.2f} %".format(accuracies.mean()*100))
    print("Standard Deviation: {:.2f} %".format(accuracies.std()*100))
    ```

#### Grid Search
- Allows testing various hyperparameter combinations to get the base selection
- Uses cross validation to ensure a good model selection with the optimal hyperparameters
- Steps
    - Choose the hyperparameters to test the model with
    - Divide the training data into $k$ folds
    - For each hyperparameter combination, iterate over the folds using $k -1$ folds for training and the 1 fold for testing

!!! abstract "Sample Code"
    [GridSearchCV](https://scikit-learn.org/1.4/modules/generated/sklearn.model_selection.GridSearchCV.html#sklearn.model_selection.GridSearchCV)

    ```python
    # Example for SVC classifier
    # Specify hyperparameters to test
    parameters = [{'C': [0.2, 0.4, 0.6, 0.8, 1], 'kernel': ['linear']},
                {'C': [0.2, 0.4, 0.6, 0.8, 1], 'kernel': ['rbf'], 'gamma': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]}]

    grid_search = GridSearchCV(estimator = c_svc,
                            param_grid = parameters,
                            scoring = 'accuracy',
                            cv = 10,
                            n_jobs = -1)  # all processors in the machine will be used
    grid_search.fit(X_train, y_train)
    best_accuracy = grid_search.best_score_
    best_parameters = grid_search.best_params_
    print("Best Accuracy: {:.2f} %".format(best_accuracy*100))
    print("Best Parameters:", best_parameters)
    ```