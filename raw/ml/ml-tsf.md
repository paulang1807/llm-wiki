## Model Types
### Naive Forecasting Model

- Based on the assumption that the previous period value is the forecast for this period

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=9c08a97d-1995-4760-b75f-ab3107492b2c)

    ```python
    # Add lag feature for previous period
    df_ts1['Lag_Col'] = df_ts1['Orig_Col'].shift(1)

    # Drop NaN values that got created in the lag column
    df_ts1.dropna(inplace=True) 
    df_ts1.reset_index(inplace=True) 

    # Train Test split
    size = df_ts1.shape[0]-7
    df_train_ts1 = df_ts1.iloc[:size]  
    df_test_ts1 = df_ts1.iloc[size:]

    # For a naive forecasting model, we use the previous period value as the current period predictor
    # Hence the new lag column created can be treated as X
    # And the current period value (original column) as y

    X_train, y_train = df_train_ts1['Lag_Col'], df_train_ts1['Orig_Col']
    X_test, y_test = df_test_ts1['Lag_Col'], df_test_ts1['Orig_Col']

    # Check Predictions
    # For a naive forecasting model, we use the previous period value as the current period predictor
    # Hence the new lag column created can be treated as the predicted variable
    # And the current period value (original column) as y_test
    y_pred =  df_test_ts1.loc[:,'Lag_Col']
    ```

### [Auto Regressive Model](../stats-tsb/#autoregressive-process-ar)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=d46b62c4-1b11-4051-817b-e6ba17e3aaf2)

    [AutoReg](https://www.statsmodels.org/dev/generated/statsmodels.tsa.ar_model.AutoReg.html)

    [AutoRegResults](https://www.statsmodels.org/dev/generated/statsmodels.tsa.ar_model.AutoRegResults.html)

    ```python
    from statsmodels.tsa.ar_model import AutoReg

    # Set the lag value based on the PACF plot
    ts_ar = AutoReg(y_train, lags=9)
    ts_ar_rslts = ts_ar.fit()  # Returns AutoRegResults object
    y_pred = ts_ar_rslts.predict(start=len(y_train), end=len(y_train)+len(y_test)-1)
    ```

### [Moving Average Model](../stats-tsb/#moving-average-model-ma)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=7ea6a992-69e1-404e-b15f-97d13843b282)

    ```python
    # Add lag feature for previous period
    df_ts1['Lag_Col'] = df_ts1['Orig_Col'].shift(1)

    # Drop NaN values that got created in the lag column
    df_ts1.dropna(inplace=True) 
    df_ts1.reset_index(inplace=True) 

    # Calculate Residuals
    # For a naive forecasting model, the Residuals are nothing but the difference 
    # between the original column and lag column
    df_ts1.loc[:,'Residual'] = df_ts1.loc[:,'Orig_Col'] - df_ts1.loc[:,'Lag_Col']

    # Train Test split
    size = df_ts1.shape[0]-7
    # Use the residual as the train and test data
    y_train_resid = df_ts1.Residual[:size]  
    y_test_resid = df_ts1.Residual[size:]

    # Original test data is still based on the original column
    # This is what will be used for model evaluation
    y_test = df_ts1.Temp[size:]

    # Build Model for Residuals
    from statsmodels.tsa.ar_model import AutoReg
    ts_ar = AutoReg(y_train_resid, lags=9)
    ts_ar_rslts = ts_ar.fit()  # Returns AutoRegResults object
    # Predicted Residuals
    y_pred_resid = ts_ar_rslts.predict(start=len(y_train_resid), end=len(y_train_resid)+len(y_test_resid)-1)

    # Adjust predicted values using predicted residuals
    y_pred = df_ts1.Lag_Col[size:, ] + y_pred_resid
    ```

### [Holts Winter Model](../stats-tsb/#holt-winters-triple-exponential-smoothing)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=8b581da1-cb64-4013-9275-534388241ba5)

    [ExponentialSmoothing](https://www.statsmodels.org/dev/generated/statsmodels.tsa.holtwinters.ExponentialSmoothing.html)

    [HoltWintersResults](https://www.statsmodels.org/dev/generated/statsmodels.tsa.holtwinters.HoltWintersResults.html)

    ```python
    from statsmodels.tsa.holtwinters import ExponentialSmoothing

    ts_hw = ExponentialSmoothing(y_train, trend = 'mul', seasonal = 'mul', seasonal_periods = 7)
    ts_hw_rslts = ts_hw.fit()  # Returns HoltWintersResults object

    # Generate summary to check Log Likelihood and Information Criteria values
    ts_hw_rslts.summary()

    # Evaluate Parameter importance
    # get all model parameters
    # displays parameters and values in a dict format
    ts_hw_rslts.model.params
    # DataFrame containing all parameters
    coefficients_df = ts_hw_rslts.params_formatted
    # Calculate importance for each parameter value as 
    # absolute value of each parameter / Sum of the absolute values of the parameters
    coefficients_df['Abs Value']=coefficients_df['param'].abs()
    coefficients_df['Importance_perc']=coefficients_df['Abs Value']/coefficients_df['Abs Value'].sum()
    coefficients_df.reset_index(inplace=True)
    coefficients_df=coefficients_df.drop('Abs Value',axis=1)
    coefficients_df.rename(columns = {'index':'Variable'}, inplace = True)
    # Find importance of level, trend and seasonality parameter values
    for i in range(0,coefficients_df.shape[0]):
        if coefficients_df.loc[i,'Variable'].__contains__('season'):
            coefficients_df.loc[i,'New Variable']='Seasonality'
        elif coefficients_df.loc[i,'Variable'].__contains__('trend'):
            coefficients_df.loc[i,'New Variable']='Trend'
        elif coefficients_df.loc[i,'Variable'].__contains__('level'):
            coefficients_df.loc[i,'New Variable']='Level'       
    coefficients_df=coefficients_df.groupby(['New Variable'], dropna=False).agg({'param' : 'sum','Importance_perc' : 'sum'}).reset_index()
    coefficients_df.rename(columns = {'New Variable':'Variable'}, inplace = True)

    # Check residuals to see if all the information has been extracted from the data
    # If the graph is centered around zero and does not show any trend or seasonality
    # it indicates that the residual is more like white noise and 
    # does not have any additional data relevant for forecasting
    residuals = ts_hw_rslts.resid
    residuals.describe()

    # Predict for one future period
    ts_hw_rslts.forecast()

    # Predict for five future periods
    ts_hw_rslts.forecast(5)

    # In-sample prediction and out-of-sample forecasting
    ts_hw_rslts.predict(start=698, end=702)
    ```

### [TBATS Model](../stats-tsb/#tbats)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=46ed3c58-7a4a-4c58-9327-3bb725725ce9)

    [TBATS](https://www.rdocumentation.org/packages/forecast/versions/8.22.0/topics/tbats)

    ```python
    from tbats import TBATS

    # include weekly and yearly seasonality
    ts_tbats = TBATS(use_trend = True, seasonal_periods = [7, 365]) 
    ts_tbats_rslts = ts_tbats.fit(y_train)

    # Predict for future periods
    y_pred = pd.Series(ts_tbats_rslts.forecast(31))
    y_pred.index = y_test.index
    ```

### [ARIMA](../stats-tsb/#arima)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=afb5f37b-e517-4727-b8d3-0e8af4afcedd)

    [ARIMA](https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMA.html)

    [ARIMAResults](https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMAResults.html)

    ```python
    # Plot line chart to check trend and determine d
    df_ts1.Sales.plot()

    # Plot ACF chart to check autocorrelation and determine q
    import statsmodels.graphics.tsaplots as sgt
    sgt.plot_acf(df_ts1.Sales, lags = 35, zero = False)

    # Plot PACF chart to check partial autocorrelation and determine p
    sgt.plot_pacf(df_ts1.Sales, lags = 15, zero = False)

    # Build Model
    from statsmodels.tsa.arima.model import ARIMA
    ts_arima = ARIMA(df_ts1.Sales, order=(2,2,3))
    ts_arima_rslts = ts_arima.fit()  # returns ARIMAResults object

    # Generate summary to check Log Likelihood and Information Criteria values
    ts_arima_rslts.summary()

    # Check residuals to see if all the information has been extracted from the data
    # If the graph is centered around zero and does not show any trend or seasonality
    # it indicates that the residual is more like white noise and 
    # does not have any additional data relevant for forecasting
    residuals = ts_arima_rslts.resid
    residuals.describe()

    # Predict for one future period
    ts_arima_rslts.forecast()

    # Predict for five future periods
    ts_arima_rslts.forecast(5)

    # Get predictions for all the values available in the data
    y_pred = ts_arima_rslts.predict()
    ```

### SARIMA
- Includes four elements in addition to the three trend based elements that are a part of ARIMA
    - $P$: Seasonal AR order
    - $D$: Seasonal difference order
    - $Q$: Seasonal MA order
    - $m$: Number of time steps for a single seasonal period
        - 12 for monthly seasonality, 7 for weekly and so on

*[SARIMA]: Seasonal Auto Regression Integrated Moving Average

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=27c7dd21-1bdf-400d-a533-23dcc92f5d44)

    [Auto Arima](https://alkaline-ml.com/pmdarima/modules/generated/pmdarima.arima.auto_arima.html)

    [SARIMAX](https://www.statsmodels.org/dev/generated/statsmodels.tsa.statespace.sarimax.SARIMAX.html)

    [SARIMAXResults](https://www.statsmodels.org/dev/generated/statsmodels.tsa.statespace.sarimax.SARIMAXResults.html)

    ```python
    # Plot line chart to check trend and determine d
    df_ts1.Sales.plot()

    # Plot ACF chart to check autocorrelation and determine q
    import statsmodels.graphics.tsaplots as sgt
    sgt.plot_acf(df_ts1.Sales, lags = 35, zero = False)

    # Plot PACF chart to check partial autocorrelation and determine p
    sgt.plot_pacf(df_ts1.Sales, lags = 15, zero = False)

    # Test for Seasonality and determine m
    df_ts1.index = df_ts1['Month'] 
    s_dec_additive = seasonal_decompose(df_ts1['MilesMM'], model='additive')

    # Build Model
    from pmdarima import auto_arima
    from statsmodels.tsa.statespace.sarimax import SARIMAX

    # Use auto_arima to auto detect best params
    ts_aa = auto_arima(df_ts1.MilesMM, trace=True, suppress_warnings=True,m=12)

    # Extract Best Params
    order = ts_aa.get_params().get("order")
    seasonal_order = ts_aa.get_params().get("seasonal_order")

    # Inferfreq based on the index
    # This requires the date column to be set as index
    freq = df_ts1.index.inferred_freq  

    # The following would be the manual params based on initial exploration
    # ts_sarimax = SARIMAX(df_ts1.MilesMM,  order=(1,1,3), seasonal_order=(1,1,1,12))
    # Using best params from auto_arima instead
    ts_sarimax = SARIMAX(df_ts1.MilesMM,  order=order, seasonal_order=seasonal_order, freq=freq)
    ts_sarimax_rslts = ts_sarimax.fit()  # returns SARIMAXResults object
    ts_sarimax_rslts.summary()

    # Generate summary to check Log Likelihood and Information Criteria values
    ts_sarima_rslts.summary()

    # Evaluate Parameter importance
    # get all model parameters
    # displays parameters and values in a dict format
    ts_sarimax_rslts.params
    # DataFrame containing all parameters
    coefficients_df = pd.DataFrame({'Variable': ts_sarimax_rslts.params.index, 'param': ts_sarimax_rslts.params.values})
    # Calculate importance for each parameter value as 
    # absolute value of each parameter / Sum of the absolute values of the parameters
    coefficients_df['Abs Value']=coefficients_df['param'].abs()
    coefficients_df['Importance_perc']=coefficients_df['Abs Value']/coefficients_df['Abs Value'].sum()
    coefficients_df.reset_index(inplace=True)
    coefficients_df=coefficients_df.drop('Abs Value',axis=1)
    # Find importance of MA, AR, Seasonal MA, Seasonal AR and Error Variance parameter values
    for i in range(0,coefficients_df.shape[0]):
        if coefficients_df.loc[i,'Variable'].__contains__('ma.L'):
            coefficients_df.loc[i,'New Variable']='Moving Average'
        elif coefficients_df.loc[i,'Variable'].__contains__('ar.L'):
            coefficients_df.loc[i,'New Variable']='Autoregressive'
        elif coefficients_df.loc[i,'Variable'].__contains__('ma.S.L'):
            coefficients_df.loc[i,'New Variable']='Seasonal Moving Average'      
        elif coefficients_df.loc[i,'Variable'].__contains__('ar.S.L'):
            coefficients_df.loc[i,'New Variable']='Seasonal Autoregressive'      
        elif coefficients_df.loc[i,'Variable'].__contains__('sigma'):
            coefficients_df.loc[i,'New Variable']='Variance of the error term'      
    coefficients_df=coefficients_df.groupby(['New Variable'], dropna=False).agg({'param' : 'sum','Importance_perc' : 'sum'}).reset_index()
    coefficients_df.rename(columns = {'New Variable':'Variable'}, inplace = True)
                
    # Check residuals to see if all the information has been extracted from the data
    # If the graph is centered around zero and does not show any trend or seasonality
    # it indicates that the residual is more like white noise and 
    # does not have any additional data relevant for forecasting
    residuals = ts_sarima_rslts.resid
    residuals.describe()

    # Predict for one future period
    ts_sarima_rslts.forecast()

    # Predict for five future periods
    ts_sarima_rslts.forecast(5)

    # Get predictions for all the values available in the data
    y_pred = ts_sarima_rslts.predict()
    ```

### SARIMAX
- Uses other exogenous variables on top of the dependent variable we are trying to predict
- Requires date column to be the index column 
- **Auto Arima has built in hyperparameter tuning**

*[SARIMAX]: Seasonal Auto Regression Integrated Moving Average Exogenous

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=34f3acc9-9f9f-4ffe-863c-ee452cd9c043)

    [Auto Arima](https://alkaline-ml.com/pmdarima/modules/generated/pmdarima.arima.auto_arima.html)

    ```python
    from pmdarima import auto_arima
    ts_sarimax = auto_arima(y_train, X_train,  m=7,start_p=0, d=None, start_q=0, max_p=5, max_d=5, max_q=5, start_P=0,
                      D=0, start_Q=1, max_P=5, max_D=5, max_Q=5, max_order=10,with_intercept=True, trace=True, seasonal = True)

    # Generate summary to check Log Likelihood and Information Criteria values
    ts_sarimax.summary()

    # Parameter Evaluation
    # get all model parameters
    # displays parameters and values in a dict format
    ts_sarimax.params()
    # DataFrame containing all parameters
    coefficients_df = pd.DataFrame({'Variable': ts_sarimax.params().index, 'param': ts_sarimax.params().values})
    # Calculate importance for each parameter value as 
    # absolute value of each parameter / Sum of the absolute values of the parameters
    coefficients_df['Abs Value']=coefficients_df['param'].abs()
    coefficients_df['Importance_perc']=coefficients_df['Abs Value']/coefficients_df['Abs Value'].sum()
    coefficients_df.reset_index(inplace=True)
    coefficients_df=coefficients_df.drop('Abs Value',axis=1)
    # Find importance of MA, AR, Seasonal MA, Seasonal AR and Error Variance parameter values
    for i in range(0,coefficients_df.shape[0]):
        if coefficients_df.loc[i,'Variable'].__contains__('ma.L'):
            coefficients_df.loc[i,'New Variable']='Moving Average'
        elif coefficients_df.loc[i,'Variable'].__contains__('ar.L'):
            coefficients_df.loc[i,'New Variable']='Autoregressive'
        elif coefficients_df.loc[i,'Variable'].__contains__('ma.S.L'):
            coefficients_df.loc[i,'New Variable']='Seasonal Moving Average'      
        elif coefficients_df.loc[i,'Variable'].__contains__('ar.S.L'):
            coefficients_df.loc[i,'New Variable']='Seasonal Autoregressive'      
        elif coefficients_df.loc[i,'Variable'].__contains__('sigma'):
            coefficients_df.loc[i,'New Variable']='Variance of the error term'    
        else:
            coefficients_df.loc[i,'New Variable']=coefficients_df.loc[i,'Variable'] 
    coefficients_df=coefficients_df.groupby(['New Variable'], dropna=False).agg({'param' : 'sum','Importance_perc' : 'sum'}).reset_index()
    coefficients_df.rename(columns = {'New Variable':'Variable'}, inplace = True)

    # Predict for five future periods
    y_pred = pd.Series(ts_sarimax.predict(5, X_test))
    y_pred.index = y_test.index
    ```

### [Linear Regression](../ml-reg/#simple-linear-regression)

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=w7-fVSBjDk06)

    [Simple Linear Regression](../stats-reg/#simple-linear-regression-model)

    [Shap](https://shap.readthedocs.io/en/latest/index.html)

    ```python
    from sklearn.linear_model import LinearRegression

    ts_lr = LinearRegression()
    ts_lr.fit(X_train,y_train)
    print (ts_lr.intercept_)
    print (ts_lr.coef_)

    # Predict
    y_pred = ts_lr.predict(X_test)

    # Parameter Evaluation
    # Get shap parameters
    explainer = shap.Explainer(ts_lr, X_train)
    shap_values = explainer.shap_values(X_test)
    coefficients_df=pd.DataFrame(shap_values,columns=df_ts_bike.columns[1:])
    # Transpose parameter dataframe
    coefficients_df = coefficients_df.transpose().reset_index()
    # Add a column with the mean values of the parameters
    coefficients_df['avg'] = coefficients_df[coefficients_df.columns[1:]].mean(axis=1)
    # Keep only relevant columns
    coefficients_df = coefficients_df.loc[:, ['index','avg']]
    coefficients_df.columns = ['Variable','Value']
    # Add model coefficients
    coefficients_df['ts_lr_coeff'] = ts_lr_coeff
    # Calculate importance for each parameter value as 
    # absolute value of each parameter / Sum of the absolute values of the parameters
    coefficients_df['Abs Value']=coefficients_df['Value'].abs()
    coefficients_df['Abs Value Coeff']=coefficients_df['ts_lr_coeff'].abs()
    coefficients_df['Importance_perc']=coefficients_df['Abs Value']/coefficients_df['Abs Value'].sum()
    coefficients_df['Importance_perc_coeff']=coefficients_df['Abs Value Coeff']/coefficients_df['Abs Value Coeff'].sum()
    coefficients_df.reset_index(inplace=True)
    coefficients_df=coefficients_df.drop(['Abs Value','Abs Value Coeff','index'],axis=1)
    # Add explainer expected value
    coefficients_df = pd.concat([coefficients_df,pd.DataFrame({'Variable':'expected_value','Value':explainer.expected_value},index=['i',])], axis=0)
    ```

### Linear Regression - Lasso

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=68r4ZJebn81I)

    [Lasso](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Lasso.html#sklearn.linear_model.Lasso)

    ```python
    from sklearn.linear_model import Lasso

    ts_lasso = Lasso(alpha=100, random_state=0)
    ts_lasso.fit(X_train,y_train)
    print (ts_lasso.intercept_)
    print (ts_lasso.coef_)

    # Predict
    y_pred_lasso = ts_lasso.predict(X_test)
    ```

### Tensorflow Probability STS
- Structural Time Series Model
- Makes it easy to combine probabilistic models and deep learning
- Decomposes the time series into Trend, Seasonalities, Exogenous Impacts, and Autoregressive terms
- Uses Hamiltonian Monte Carlo (HMC) for fitting
    - HMC is a method for obtaining a sequence of random samples
        - that converge to being distributed 
        - according to atarget probability distribution 
        - for which direct sampling is difficult

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=ukAMlIIFnKdI)

    [Tensorflow Probability STS](https://www.tensorflow.org/probability/api_docs/python/tfp/sts)

    ```python
    import tensorflow_probability as tfp

    # set dependent variable as float
    y_train = y_train.astype(np.float64)

    # Add regressor components with linear regression
    # The data needs to be in the form of a matrix
    # All the values should be in float format
    exog = np.asmatrix(df_ts_bike.iloc[:,1:].astype(np.float64))
    regressors = tfp.sts.LinearRegression(design_matrix = exog, name = "regressors")

    # Add Seasonality components
    # Weekday seasonality
    # number of steps per season is 1 as we have daily data
    weekday_effect = tfp.sts.Seasonal(num_seasons = 7, num_steps_per_season = 1, observed_time_series = y_train, name = "weekday_effect")

    # Monthly seasonality
    # number of days per month
    num_days_per_month = np.array(
        [[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], #2011
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]]) # 2012
    monthly_effect = tfp.sts.Seasonal(num_seasons = 12, num_steps_per_season = num_days_per_month, observed_time_series = y_train, name = "monthly_effect")

    # Trend component
    trend = tfp.sts.LocalLinearTrend(observed_time_series=y_train, name = "trend")

    # Autoregressive component
    # order is the number of lags to consider
    autoregressive = tfp.sts.Autoregressive(order = 1, observed_time_series = y_train, name = "autoregressive")

    # Build model
    sts_tfp = tfp.sts.Sum([regressors, weekday_effect, monthly_effect, autoregressive, trend], observed_time_series = y_train)

    # Fit with HMC (Hamilton Monte Carlo)
    samples, kernel_results = tfp.sts.fit_with_hmc(model = sts_tfp, observed_time_series = y, num_results = 100, num_warmup_steps = 50,
                                                num_leapfrog_steps = 15, num_variational_steps = 150, seed = 13)

    print("acceptance rate: {}".format(np.mean(kernel_results.inner_results.inner_results.is_accepted, axis=0)))
    print("posterior means: {}".format({param.name: np.mean(param_draws, axis=0) for (param, param_draws) in zip(sts_tfp.parameters, samples)}))

    # Predict
    # Passing the posterior samples into forecast, we construct a forecast distribution:
    forecast_dist = tfp.sts.forecast(model = sts_tfp, observed_time_series = y_train, parameter_samples = samples, num_steps_forecast = 31)
    forecast_mean = forecast_dist.mean()
    y_pred = pd.Series(forecast_mean[:,0])
    y_pred.index = y_test.index
    ```

### Facebook Prophet
- Decomposes the time series into Trend, Seasonalities, Exogenous Impacts and **Holiday Effects**
- Uses the date as a column in the dataset and not as index
- **Requires the dependent variable to be named 'y' and the data column to be named 'ds'**
- Allows specifying **dynamic holidays** and how many days before/after to quantify
- Has built in cross validation capabilities
- Does not work well with non-linear regressors

!!! info "Prophet Key Components"
    - Growth: Linear or Logistic
    - Holidays: Dataframe with holiday attributes (name, date, lowe and upper windows)
    - Seasonality: Yearly, weekly or daily. True or False
    - Seasonality Mode: Addtive or Multiplicative
    - Seasoanlity Prior Scale: Strengh of the seasonal cycles
    - Holiday Prior Scale: Dictates how much the Holidays affect the seasonality curve.
    - Changepoint Prior Scale: How easily the trend curve should change

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=vhne_meAIwrh)

    [Prophet](https://facebook.github.io/prophet/docs/quick_start.html#python-api)

    [Parameter Grid](https://scikit-learn.org/1.4/modules/generated/sklearn.model_selection.ParameterGrid.html#sklearn.model_selection.ParameterGrid)

    ```python
    from prophet import Prophet

    # renaming dependent variable and date column
    df_ts_bike = df_ts_bike.rename(columns = {'cnt' : 'y', 'dteday': 'ds'})

    # Add holiday dataframe
    holidays = pd.DataFrame({'holiday' : 'hday',
                         'ds': pd.to_datetime(holiday_dates),
                         'lower_window': -3,
                         'upper_window': 1})

    # Build Model
    ts_prophet = Prophet(growth = "linear",
                yearly_seasonality = True,
                weekly_seasonality = True,
                daily_seasonality = False,
                holidays = holidays,
                seasonality_mode = "multiplicative",
                seasonality_prior_scale = 10,
                holidays_prior_scale = 10,
                changepoint_prior_scale = 0.05)
    ts_prophet.add_seasonality(name = 'weekly', fourier_order = 3, period = 90)
    ts_prophet.add_regressor('workingday')
    ts_prophet.add_regressor('weathersit')
    ts_prophet.add_regressor('temp')
    ts_prophet.add_regressor('atemp')
    ts_prophet.add_regressor('hum')
    ts_prophet.add_regressor('windspeed')
    ts_prophet.fit(training_set)

    # Predict
    # Create Future Dataframe
    df_future = ts_prophet.make_future_dataframe(periods = len(test_set), freq = "D")

    # Merge regressors
    df_future = pd.concat([df_future, df_ts_bike.iloc[:,2:]], axis = 1)

    # Forecast
    df_forecast = ts_prophet.predict(df_future)

    # Predictions
    y_pred = df_forecast.yhat[-31:]

    # Evaluate Parameter importance
    # get all model parameters
    from prophet.utilities import regressor_coefficients
    coefficients_df = regressor_coefficients(ts_prophet)
    # Calculate importance for each parameter value as 
    # absolute value of coeff of each regressor / Sum of the absolute values of coefficients of the regressors
    coefficients_df['Abs Value']=coefficients_df['coef'].abs()
    coefficients_df['Importance_perc']=coefficients_df['Abs Value']/coefficients_df['Abs Value'].sum()
    coefficients_df.reset_index(inplace=True)
    coefficients_df=coefficients_df.drop(['Abs Value','index'],axis=1)
    coefficients_df=coefficients_df.drop(['regressor_mode','center','coef_lower','coef_upper'],axis=1)

    # Vizualize
    # Vizualize forecast
    ts_prophet.plot(df_forecast);

    # Plot components
    ts_prophet.plot_components(df_forecast);

    # Cross Validation
    from prophet.diagnostics import cross_validation
    df_cv = cross_validation(ts_prophet,
                            horizon = '31 days',
                            initial = '540 days',      # one and half year. recommended at least one year
                            period = '90 days',
                            parallel = "processes")

    # Hyperparameter Tuning
    from sklearn.model_selection import ParameterGrid

    # Specify hyperparameters to test
    param_grid = {'seasonality_prior_scale': [5, 10, 20],
                'changepoint_prior_scale': [0.01, 0.05, 0.1],
                'holidays_prior_scale': [5, 10, 20]}
    grid = ParameterGrid(param_grid)

    # Tune for best hyper parameters
    mape = []
    for params in grid:
            # Build model
            ts_prophet = Prophet(growth = "linear",
                    yearly_seasonality = True,
                    weekly_seasonality = True,
                    daily_seasonality = False,
                    holidays = holidays,
                    seasonality_mode = "multiplicative",
                    seasonality_prior_scale = params['seasonality_prior_scale'],
                    holidays_prior_scale = params['holidays_prior_scale'],
                    changepoint_prior_scale = params['changepoint_prior_scale'])
        
            ts_prophet.add_regressor('workingday')
            ts_prophet.add_regressor('weathersit')
            ts_prophet.add_regressor('temp')
            ts_prophet.add_regressor('atemp')
            ts_prophet.add_regressor('hum')
            ts_prophet.add_regressor('windspeed')
            ts_prophet.fit(training_set)

            # Cross-validation
            df_cv = cross_validation(ts_prophet,
                            horizon = '31 days',
                            initial = '540 days',      # one and half year. recommended at least one year
                            period = '90 days',
                            parallel = "processes")
    
            # Gather the results
            err = mean_absolute_percentage_error(df_cv.y, df_cv.yhat)
            mape.append(err)

    # Best parameters
    print("Minimum MAPE: ", mape[np.argmin(mape)])
    best_params = grid[np.argmin(mape)]
    print("Best Params: ",best_params)
    ```

### XGBoost with Prophet
- XGBoost not that good with trend and seasonality
    - Use seasonality and trend variables from Prophet
- Uses different weights depending on how difficult it is to predict
    - Incorrectly predicted observation are given more weight for future iterations of the model
    - Also assigns weights to predictors
    - Keeps adjusting weight, till it find the optimal weights
- Uses only parts of the observations (subset of data) at a time
    - Makes it more robust as it trains itself on "multiple views" of the data
    - Prevents overfitting
- Also see [XGB Regression](../ml-reg/#xgb-regression)

*[XGBoost]: Extreme Gradient Boosting

!!! abstract "Sample Code"
    [Colab Link](https://colab.research.google.com/drive/1VRKPIejR-9uNBkS-CzCH6cc4mBEkQCCC#scrollTo=1Fk_Y5yY_qDO)

    [XGB](https://xgboost.readthedocs.io/en/stable/python/python_intro.html)

    ```python
    import xgboost as xgb

    # Get relevant columns from the prophet forecast and concat to the original data
    df_prophet_fcst = df_forecast.loc[:, ["trend", "hday", "weekly", "yearly"]]
    df_xgb = pd.concat([df_ts_bike, df_prophet_fcst], axis = 1)

    #create XGBoost Matrices
    Train = xgb.DMatrix(data = X_train, label = y_train)
    Test = xgb.DMatrix(data = X_test, label = y_test)

    # Set the parameters
    parameters = {'learning_rate': 0.1,
                'max_depth': 3,
                'colsample_bytree': 1,
                'subsample': 1,
                'min_child_weight': 1,
                'gamma': 1,
                'random_state': 13,
                'eval_metric': "rmse",
                'objective': "reg:squarederror"}

    # XGBoost Model
    ts_xgb = xgb.train(params = parameters,
                    dtrain = Train,
                    num_boost_round = 100,
                    evals = [(Test, "y")],
                    verbose_eval = 15)

    # Predict
    y_pred = pd.Series(ts_xgb.predict(Test))
    ```