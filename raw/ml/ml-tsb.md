## Modeling Steps
- Generate or Read data
    - Ensure that date column is of date datatype
- [EDA](../stats-eda/)
- Data Preparation 
    <p id="cust-id-tsb-resampl"></p>
    - Resampling or Changing Frequency
        - Downsampling (e.g. Quarterly to Yearly)
        - Upsampling (e.g. Quarterly to Monthly)
            - May result in missing data for lower level rows. Also see [Handle Missing Data]()
        - Set Frequency
            - Set date column as index (if not the index already)
    - Handle missing data 
        - Also see [here](../#handle-missing-data)
    - Transform Data
        - To [stabilize variance](../stats-tsb/#variance-stabilization)
        - Calculate [Moving Average](../stats-tsb/#moving-average)
- Feature Engineering
    - Add Basic Date Time features
    - Add Lag features
    - Add Windowing features
    - Add cyclical features
        - Helps capture cyclical relation between time variables by applying sine and cosine transformations
            - December will be treated to be closer to January compared to July
    - Add Expanding/Cumulative features
    - Add / Remove other columns as needed
    - Add exogenous regressors (see [Structural Time Series](../stats-tsb/#structural-time-series))
- More EDA on Processed Data
    - Test for Stationarity
    - Test for Seasonality
        - Apply [Differencing](../stats-tsb/#cust-id-tsb-diff) as needed
    - Test for ACF and PACF
- Split training and test data

*[Resampling]: Changing the frequency of the available data to match the desired forecast frequency

### Data Prep

!!! abstract "Read Data"

    ```python
    # Parse date column as date when reading data
    # dayfirst = True uses the dd/mm/yyyy format instead of the default mm/dd/yyyy; not needed if date is in default format
    # we pass the index of the date column to the parse_dates parameter
    df_ts_base1 = pd.read_csv('data/TimeSeriesData1.csv', dayfirst=True, parse_dates=[0])

    # Alternatively, we can also convert the date column after reading the csv
    # We would do this if for some reason we read the date column without parsing it as a date
    df_ts_base2 = pd.read_csv('data/TimeSeriesData1.csv')
    df_ts_base2.date = pd.to_datetime(df_ts_base2.date, dayfirst = True)
    ```

#### Resampling
| Alias  | Description           |
|--------|-----------------------|
| B      | Business day          |
| D      | Calendar day          |
| W      | Weekly                |
| M      | Month end             |
| Q      | Quarter end           |
| A      | Year end              |
| BA     | Business year end     |
| AS     | Year start            |
| H      | Hourly frequency      |
| T, min | Minutely frequency    |
| S      | Secondly frequency    |
| L, ms  | Millisecond frequency |
| U, us  | Microsecond frequency |
| N, ns  | Nanosecond frequency  |


!!! abstract "Sample Code"
    [Resample](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.DataFrame.resample.html#pandas.DataFrame.resample)

    ```python    
    # Downsample
    df_ts1_mth = df_ts1.resample('M', on='date').mean()

    # Upsample
    df_ts1_hr = df_ts1.resample('H', on='date').mean()
    ```

!!! abstract "Set Index"

    ```python
    # Set date column as index if it has not been set as the index based on some prior operation
    df_ts_base1.set_index("date", inplace=True)
    ```

!!! abstract "Set desired frequency"

    Also see [Offset Aliases](https://pandas.pydata.org/pandas-docs/stable/user_guide/timeseries.html#offset-aliases)

    ```python
    # This will generate new rows for missing periods for the desired frequency
    # Make sure to set the frequency only after setting the date column as index
    # Parameter 'b' signifies business days
    df_ts_base1 = df_ts_base1.asfreq("b")
    ```

#### Handle missing data
| Method  | Description                                               |
|---------|-----------------------------------------------------------|
| bfill   | Backward fill                                             |
| count   | Count of values                                           |
| ffill   | Forward fill                                              |
| first   | First valid data value                                    |
| last    | Last valid data value                                     |
| max     | Maximum data value                                        |
| mean    | Mean of values in time range                              |
| median  | Median of values in time range                            |
| min     | Minimum data value                                        |
| nunique | Number of unique values                                   |
| ohlc    | Opening value, highest value, lowest value, closing value |
| pad     | Same as forward fill                                      |
| std     | Standard deviation of values                              |
| sum     | Sum of values                                             |
| var     | Variance of values                                        |

!!! abstract "Handle Missing Data"
    [Interpolate](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.DataFrame.interpolate.html)

    ```python
    # Front fill NaNs
    df_ts_base1.spx = df_ts_base1.spx.ffill()

    # Back fill NaNs
    df_ts_base1.spx = df_ts_base1.spx.bfill()

    # Populate NaNs using mean value
    df_ts_base1.spx = df_ts_base1.spx.fillna(value=df_ts_base1.spx.mean())

    # Fill in missing values with linear interpolation (euqally spaced values)
    df_ts1_hr_interpolated = df_ts1_hr.interpolate(method='linear')
    ```

### Transform Data

!!! abstract "Log Transform"
    [Sktime LogTransformer](https://www.sktime.net/en/latest/api_reference/auto_generated/sktime.transformations.series.boxcox.LogTransformer.html)

    ```python
    from sktime.transformations.series.boxcox import LogTransformer
    
    transformer = LogTransformer()
    df_air_pass['y_log_bc'] = transformer.fit_transform(df_air_pass.y)

    # Recover original value from transformed value
    df_air_pass['y_log_bc_inv'] = transformer.inverse_transform(df_air_pass.y_log_bc)
    ```

!!! abstract "MLE Transform"
    [BoxCox](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.boxcox.html)

    [Inverse BoxCox](https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.inv_boxcox.html)

    ```python
    from scipy.stats import boxcox
    from scipy.special import inv_boxcox
    
    df_air_pass['y_mle_bc'], lmbda = boxcox(df_air_pass.y, lmbda=None)

    # Recover original value from transformed value
    # The second parameter is the value of lambda used in the transform
    df_air_pass['y_mle_bc_inv'] = inv_boxcox(df_air_pass.y_mle_bc, 0.14802265137037945)
    ```

!!! abstract "Box Cox Transform"
    [Sktime BoxCoxTransformer](https://www.sktime.net/en/stable/api_reference/auto_generated/sktime.transformations.series.boxcox.BoxCoxTransformer.html)

    ```python
    from sktime.transformations.series.boxcox import BoxCoxTransformer
    
    transformer = BoxCoxTransformer(method="guerrero", sp=12)   # Here seasonality is 12, so sp is being set to 12
    df_air_pass['y_gue_bc'] = transformer.fit_transform(df_air_pass.y)

    # Recover original value from transformed value
    df_air_pass['y_gue_bc_inv'] = transformer.inverse_transform(df_air_pass.y_gue_bc)
    print("Guerrero Lambda: ", transformer.lambda_)
    ```

!!! abstract "Moving Average"
    [Rolling](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html)

    ```python
    # ODD WINDOW
    df_rtl_sales['3-MA'] = df_rtl_sales.rolling(window=3,  
        center=True  # Compute average at center of window
    ).mean()

    # EVEN WINDOW
    window_size = 4
    df_rtl_sales['4-MA'] = (
        # Apply the MA without a centered window. The average is computed at the end of the window
        df_rtl_sales.y.rolling(window=window_size).mean()  
                        .rolling(window=2).mean() 
                        # Shift is required to align the output to what a centered window would have produced
                        .shift(-window_size // 2) )
    ```

### Explore Data

!!! abstract "Test for Stationarity"
    [Stationarity](../stats-tsb/#stationarity)

    [Augmented Dickey Fuller Test](https://www.statsmodels.org/dev/generated/statsmodels.tsa.stattools.adfuller.html)

    ```python
    import statsmodels.tsa.stattools as sts

    adfuller_stats = sts.adfuller(df_ts_base1.market_value)
    adfuller_stats
    ```

!!! abstract "Classical Decomposition"
    [Seasonality](../stats-tsb/#seasonality)

    [Decomposition](../stats-tsb/#decomposition)

    [Seasonal Decompose](https://www.statsmodels.org/dev/generated/statsmodels.tsa.seasonal.seasonal_decompose.html)

    [Month Plot](https://www.statsmodels.org/dev/generated/statsmodels.graphics.tsaplots.month_plot.html)

    [Quarter Plot](https://www.statsmodels.org/dev/generated/statsmodels.graphics.tsaplots.quarter_plot.html)

    ```python
    from statsmodels.tsa.seasonal import seasonal_decompose

    # Use model="multiplicative" for testing multiplicative naive decomposition
    s_dec_additive = seasonal_decompose(df_ts_base1.market_value, model = "additive")
    print("Trend values: ", s_dec_additive.trend.head(2))
    print("Seasonality values: ", s_dec_additive.seasonal.head(2))
    
    s_dec_additive.plot()
    plt.show()

    # Use the period parameter to check seasonality for other frequencies
    # Overrides the default frequency
    s_dec_additive = seasonal_decompose(df_ts_base1.market_value, model = "additive", period=4)
    s_dec_additive.plot()
    plt.show()

    # Plot seasonality at month and quarter level
    # The black lines represent the volaitility of the corresponding time period
    sgt.month_plot(df_ts_base3.MilesMM.resample(rule = 'MS').mean())
    sgt.quarter_plot(df_ts_base3.MilesMM.resample(rule = 'Q').mean());
    ```

!!! abstract "STL Decomposition"
    [STL](../stats-tsb/#stl)

    [STL Decomposition](https://www.statsmodels.org/devel/generated/statsmodels.tsa.seasonal.STL.html)

    ```python
    from statsmodels.tsa.seasonal import STL
    
    s_dec_stl = STL(
        endog=df_rtl_sales["y"],  # Y values
        period=12,  # The periodicity of the seasonal component
        seasonal=7,  # Determines the window size for LOESS used when smoothing the seasonal component (i.e, the cycle-subseries)
        robust=True  # Flag to use robust regression when fitting the LOESS curves so the fit is robust to outliers
    ).fit()

    print("Trend values: ", s_dec_stl.trend.head(2))
    print("Seasonality values: ", s_dec_stl.seasonal.head(2))
    ```

!!! abstract "MSTL Decomposition"
    [MSTL Decomposition](https://www.statsmodels.org/dev/generated/statsmodels.tsa.seasonal.MSTL.html)

    ```python
    from statsmodels.tsa.seasonal import MSTL

    s_dec_mstl = MSTL(df["y"], periods=(24, 24 * 7), stl_kwargs={"seasonal_deg": 0}).fit()

    print("Trend values: ", s_dec_stl.trend.head(2))
    print("Seasonality values: ", s_dec_stl.seasonal.head(2))
    
    ```

!!! abstract "Differencing"
    [Differencing](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.Series.diff.html#pandas.Series.diff)

    ```python    
    # Remove Trend
    # Lag 1 Differencing to get rid of trends
    # Uses the difference of current and 'Lag1' values (col - col.shift(1))
    df_ts_base3['diff1'] = df_ts_base3['MilesMM'].diff(periods=1)

    # Remove Seasonality
    # Lag 12 Differencing to get rid of monthly seasonality
    # Uses the difference of current and 'Lag12' values (col - col.shift(12))
    df_ts_base3['diff12'] = df_ts_base3['diff1'].diff(periods=12)
    ```

!!! abstract "Extracting Trend - LOWESS"
    [LOWESS](https://www.statsmodels.org/dev/generated/statsmodels.nonparametric.smoothers_lowess.lowess.html)

    ```python    
    # lowess returns an array where the first column
    # are the x values and the second column are the
    # values of the fit at those x values

    rtl_sales_lowess_trnds = lowess(
        endog=df_rtl_sales_lowess.y,  
        exog=df_rtl_sales_lowess.index,  
        frac=rtl_sales_lowess_f,  # fraction of dataset to use in window
        it=3,  # Number of iterations for robust regression.
        # The default value of 3 is typically good enough [1].
    )
    ```

### Feature Engineering
#### Date Time Features
- Most of these features are used to capture cyclical effects
    - The numeric representation does not capture this well
- Often have a non-linear relation with the target variable
- Useful for tree based models
    - Tree based models can capture the non linear relationship well
- May not be as useful for linear models
    - Linear models do not work well with the non linear relation of these features w.r.t the targets
    - One hot encoding the date time features may help with this
    

!!! abstract "Sample Code"
    [Pandas Datetime](https://pandas.pydata.org/pandas-docs/stable//reference/series.html#datetimelike-properties)

    ```python
    # Add additional date columns as needed
    df_ts1['year'] = df_ts1.index.year
    df_ts1['month'] = df_ts1.index.month
    df_ts1['day'] = df_ts1.index.day
    df_ts1['day_of_week'] = df_ts1.index.day_of_week
    df_ts1['hour'] = df_ts1.index.hour
    # Create a new column with just the date component from datetime
    df_ts1['date'] = df_ts1.index.date
    # Add flag for weekend dates
    df_ts1['is_weekend'] = np.where(df_ts1.day_of_week > 4, 1,0)
    ```

<p id="cust-id-tsb-time-feat"></p>
!!! abstract "Time Features"
    [SKTime Date Time Features](https://www.sktime.net/en/latest/api_reference/transformations.html#seasonality-and-date-time-features)

    ```python
    from sktime.transformations.series.time_since import TimeSince

    # Compute the time since the start of the time series
    time_since_f = TimeSince(keep_original_columns=True, freq="MS")
    df_air_qlty_ts = time_since_f.fit_transform(df_air_qlty_ts)

    # Time Features with changepoints
    changepoints = [
        "2004-03-01",  # start of time series
        "2004-10-01",  # changepoint
    ]
    time_since_f = TimeSince(start=changepoints, positive_only=True, keep_original_columns=True)
    df_air_qlty_ts2 = time_since_f.fit_transform(df_air_qlty_ts2)
    ```

#### Lag Features
- ==**If seasonality is known, use the seasonality as the lag**==
    - If there are multiple seasonalities in data, test out the correlation and feature importance of all those lags
- Recent lag periods (e.g. last 1 to 5) often have predictive significance
- Another approach is to create lag features going back n periods
    - Then use [feature selection](#feature-selection) to determine which subset of the lag features minimize the forecast error
    - Important to avoid multicollinearity by selecting highly correlated lag features (e.g. lag 1 and lag 2 for the same feature)
- ==**Select lag features that are highly correlated to the target variable**== 
    - [ACF](../stats-tsb/#autocorrelation), [PACF](../stats-tsb/#partial-autocorrelation) and CCF can be used to determine features that are correlated to target
- **Are heavily impacted by any outliers present in the previous lag periods**
- Results in NaN values at the top (beginning) edge 

*[ACF]: Autocorrelation Function
*[PACF]: Partial Autocorrelation Function
*[CCF]: Cross-correlation Function

!!! abstract "Sample Code"
    [Shift](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.Series.shift.html#pandas.Series.shift)

    Also See [Moving Average Colab Notebook](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=z7XdInEVt-QV)

    ```python
    df_ts1['last_day'] =  df_ts1.spx.shift(1)   # last data point's value
    df_ts1['last_week'] =  df_ts1.spx.shift(freq='7D')  # values for data point same day last week
    df_ts1['lag_4H'] = df_ts1.spx.shift(periods = 2, freq='2H') # value 2 2H data point (4 hour in this case) back
    ```

#### Window Features
- Results in NaN values at the extreme edges of the windows 
    - Can use smaller windows at the edges to overcome this
        - For example, when using a windows size of 3, we will be left with 3 NaN rows at the extreme edges
            - We can use window of size 1 for the 2nd edge row and a window of size 2 for the third edge row
            - This will reduce the number of edge rows with NaN values to 1
            - Disadvantage is that we end up using differnt window sizes at the edges
    - Also see [Moving Average Limitations](../stats-tsb/#cust-id-tsb-ma-lim)
- Window size can be decided based on the seasonality and feature selection similar to [determining number of lags](#lag-features)
    - Multiple window sizes can be used if multiple seasonalities exist
    - Another approach is to consider multiple window sizes(weekly, monthly etc.) and using the difference in their values
- Apart from trying out different window sizes, different window functions(mean, std, corr etc.) can also be tested for model performance and feature selection
- Aggregate functions used in the rolling windows use evenly distributed constant weights by default
    - Same weight is used for all windows
    - Can also use [weighted windows](https://colab.research.google.com/drive/1z6rmVmhglrJW4KW5gLnkPRM7baB-oi3b#scrollTo=Jfw7_bECwMSm) where a separate weight can be used for each window
        - More weight given to the more recent windows
        - Weights can be linearly or exponentially distributed
            - Exponential distribution results in [exponential smoothing](../stats-tsb/#cust-id-tsb-exp-smth)
            - Exponential weights are commonly applied to [expanding windows](#expandingcumulative-features)

!!! abstract "Sample Code"
    [Rolling](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.Series.rolling.html#pandas.Series.rolling)

    ```python
    # Aggreates over specified rolling windows
    df_ts1['3hr_mean'] =  df_ts1.spx.rolling(window=3).mean()
    df_ts1['3hr_mean_minper'] =  df_ts1.spx.rolling(window=3, min_periods=2).mean()
    df_ts1['2day_max'] =  df_ts1.spx.rolling(window='2D').max()
    ```

<p id="cust-id-tsb-exp-wt-alpha"></p>
!!! abstract "Finding $\alpha$ for Exponential Smoothing"
    [SimpleExpSmoothing](https://www.statsmodels.org/stable/generated/statsmodels.tsa.holtwinters.SimpleExpSmoothing.html#statsmodels.tsa.holtwinters.SimpleExpSmoothing)

    ```python
    from statsmodels.tsa.holtwinters import SimpleExpSmoothing
    hw_rslt = SimpleExpSmoothing(df_ts1.spx).fit(optimized=True)
    alpha = hw_rslt.params["smoothing_level]
    ```
#### Cyclical Features
- Create features that capture the cyclical representation
- Apply sine and cosine transformations to the variables
- Scatterplot for the sin and cos transformations can be used to vizualize the cyclic relationship

!!! abstract "Sample Code"
    [Feature Engine](https://feature-engine.trainindata.com/en/latest/)

    ```python
    df_air_qlty_cyc["hour_sin"] = np.sin(df_air_qlty_cyc["hour"] / df_air_qlty_cyc["hour"].max() * 2 * np.pi)
    df_air_qlty_cyc["hour_cos"] = np.cos(df_air_qlty_cyc["hour"] / df_air_qlty_cyc["hour"].max() * 2 * np.pi)
    df_air_qlty_cyc["month_sin"] = np.sin(df_air_qlty_cyc["month"] / df_air_qlty_cyc["month"].max() * 2 * np.pi)
    df_air_qlty_cyc["month_cos"] = np.cos(df_air_qlty_cyc["month"] / df_air_qlty_cyc["month"].max() * 2 * np.pi)
    ```

#### Expanding/Cumulative Features
- Uses all previous values at any step
- Only the first row will have NaN values
- Not as common as Rolling windows
    - Does not give more weight to more recent values as all previous values are used
        - This can be overcome by using [exponential weights](https://colab.research.google.com/drive/1z6rmVmhglrJW4KW5gLnkPRM7baB-oi3b#scrollTo=i6GvlOMuUt6Y)
    - Used where cumulative effects are desired
    - Also used for **target encoding** of categorical variables

!!! abstract "Sample Code"
    [Expanding](https://pandas.pydata.org/pandas-docs/stable//reference/api/pandas.Series.expanding.html#pandas.Series.expanding)

    ```python
    # Cumulative max
    df_ts1['cum_max'] =  df_ts1.spx.expanding().max()
    ```

#### Fourier Features
!!! abstract "Sample Code"
    [SKTime Fourier Features](https://www.sktime.net/en/latest/api_reference/auto_generated/sktime.transformations.series.fourier.FourierFeatures.html#sktime.transformations.series.fourier.FourierFeatures)

    ```python
    from sktime.transformations.series.fourier import FourierFeature
    
    ftf = FourierFeatures(
        sp_list=[24, 24 * 7],  # seasonal periods
        fourier_terms_list=[2, 2],  
        freq="H",  
        keep_original_columns=True,
    )

    ftf.fit(df_air_qlty_ff)
    df_air_qlty_ff = ftf.transform(df_air_qlty_ff)
    ```

### Feature Selection
- Examine the model parameters and calculate **feature importance**
    - Packages such as [shap](https://shap.readthedocs.io/en/latest/index.html) can also be used for examining the feature importance
- Use feature importance to make informed decisions and adjust model features as needed 

!!! abstract "Test for Autocorrelation (ACF)"
    [Autocorrelation](../stats-tsb/#autocorrelation)

    [Plot ACF](https://www.statsmodels.org/dev/generated/statsmodels.graphics.tsaplots.plot_acf.html)

    ```python
    import statsmodels.graphics.tsaplots as sgt

    # zero = False means that the current period is not considered
    # as the correlation between the current period and itself will always be 1
    # 40 is the optimal number of lags for time series analysis
    sgt.plot_acf(df_ts_base1.market_value, lags = 40, zero = False)
    plt.title("ACF S&P", size = 24)
    plt.show()
    ```

!!! abstract "Test for Partial Autocorrelation (PACF)"
    [Partial Autocorrelation](../stats-tsb/#partial-autocorrelation)

    [Plot PACF](https://www.statsmodels.org/dev/generated/statsmodels.graphics.tsaplots.plot_pacf.html)

    ```python
    import statsmodels.graphics.tsaplots as sgt

    # zero = False means that the current period is not considered
    # as the correlation between the current period and itself will always be 1
    # 40 is the optimal number of lags for time series analysis
    sgt.plot_pacf(df_ts_base1.market_value, lags = 40, zero = False, method = ('ols'))
    plt.title("PACF S&P", size = 24)
    plt.show()
    ```

### Model Evaluation
#### MSE
!!! abstract "Sample Code"
    [MSE](../stats-cheatsheet/#mean-square-error)

    [Mean Squared Error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_squared_error.html#sklearn.metrics.mean_squared_error)

    ```python
    from sklearn.metrics import mean_squared_error
    mean_squared_error(y_test, y_pred)
    ```

#### RMSE
!!! abstract "Sample Code"
    [RMSE](../stats-cheatsheet/#root-mean-square-error)

    [Root Mean Squared Error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.root_mean_squared_error.html#sklearn.metrics.root_mean_squared_error)

    ```python
    from sklearn.metrics import root_mean_squared_error
    root_mean_squared_error(y_test, y_pred)
    ```

#### MAE
!!! abstract "Sample Code"
    [MAE](../stats-cheatsheet/#mean-absolute-error)

    [Mean Absolute Error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_error.html#sklearn.metrics.mean_absolute_error)

    ```python
    from sklearn.metrics import mean_absolute_error
    mean_absolute_error(y_test, y_pred)
    ```

#### MAPE
- Error has the same relevance regardless of magnitude, if percent error is the same
!!! abstract "Sample Code"
    [MAPE](../ml-cheatsheet/#mape)

    [Mean Absolute Percent Error](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.mean_absolute_percentage_error.html)

    ```python
    from sklearn.metrics import mean_absolute_percentage_error
    mean_absolute_percentage_error(y_test, y_pred)
    ```

### Model Selection
#### Walk Forward Validation
- Steps
    - Fit the model in an iterative manner
    - Split the data into multiple test sets
    - Fit the initial model on the training data 
    - Generate predictions for the first test data set
    - Add the first test set to the end of the training data set and fit the model on this extended dataset
        - Predict the next test set using this model
        - Repeat the steps till all the predictions for all the test sets have been generated
- Can be ==**Anchored(Expanding)**== or ==**Rolling(Sliding)**==
    - Anchored follows the steps described above
    - For rolling during each iteration 
        - We remove the data equivalent to the size of each test data set from the beginning of the training set 
        - Then add the new test set at the end of the previous training set and fit the model on this extended dataset

!!! abstract "Sample Code"

    ```python
    wf_data = y_train
    for t in y_test:
        ts_ar = AutoReg(y_train, lags=9)
        ts_ar_rslts = ts_ar.fit()
        y_pred = ts_ar_rslts.predict(start=len(wf_data), end=len(wf_data)+len(y_test)-1)
        wf_data = np.append(wf_data, t)    # this gives a numpy ndarray
        wf_data = pd.Series(wf_data)       # convert ndarray to series
    ```

## Multivariate Model Concepts
- Use other regressors in addition to the target variable
- These regressors are a part of the exogenous variable that is used as a parameter for prediction
    - We are trying to predict the target value for future time periods
    - However future values of these regressors may not be known
- Two appraoches
    - Direct Forecasting
    - Recursive Forecasting

### Direct Forecasting
- Separate model is used for predicting each forecast period
- ==**Each model uses a lagged version of the target depending on the forecast period**==
    - T + 1 : Predicting one data point in future
        - Exog values ==**$x_{t - 1}$ (shift(1))**== will be used with target ==**$y_t$**== in the training data for model fitting
            - The train set will include all the exog columns along with the lag 1 target column
                - All rows except the last one will be used as the lag 1 target column will be null for this row
            - The test set will include the last row of exog columns 
        - The corresponding prediction will correspond to the target value for T + 1
    - T + 2 : Predicting two data points in future
        - Exog values ==**$x_{t - 2}$ (shift(2))**== will be used with target ==**$y_{t + 1}$ (shift(-1))**== in the training data for model fitting
        - The train set will include all the exog columns along with the lag 2 target column
                - All rows except the last two will be used as the lag 2 target column will be null for these two rows
            - The test set will include the last two rows of exog columns 
        - The corresponding predictions will correspond to the target values for T + 2 corresponding to each of the test set rows
            - We normally consider only the last of the predicted values (corresponding to the last test row)  
    - T + n will use target $y_{t + n}$ which will have the **lag_n (shift(-n))** version of the target
        - Exog values ==**$x_{t - n}$ (shift(n))**== will be used with target ==**$y_{ + n}t$ (shift(-n))**== in the training data for model fitting
        - The train set will include all the exog columns along with the lag n target column
                - All rows except the last n will be used as the lag n target column will be null for these n rows
            - The test set will include the last n rows of exog columns 
        - The corresponding predictions will correspond to the target values for T + n corresponding to each of the test set rows
            - We normally consider only the last of the predicted values (corresponding to the last test row)
- The value for each forecasted period is independent
    - If the value for T + 2 depended on T + 1, this approach will not capture that
- Does not propagate estimation errors
    - Since we are not basing future predictions on previous predicted values

!!! note "Steps for test and train split for future forecasting"
    - Add lag columns for target value based on the desired forecast periods (horizons)
    - For each forecast period,
        - Based on the corresponding target lag column (Lag col 1 for T + 1, Lag col 2 for T + 2 and so on)
            - Split the data set into test and train
                - Use the records starting first to the one where target data is available as training dataset
                    - This will be till the last but one row for lag col 1, last but two rows for lag col 2 and so on
                - Use the remaining as test dataset

### Recursive Forecasting
- Same model is used for predicting each forecast period
- Propagates estimation errors
    - Since we are basing each future prediction on the previous predicted value
- When using multivariate forecasting, this approach will work only with models that support ==**MultiOutputRegressors**==
    - SkLearn regressors that do not support multi target regression natively can be used for multi target regression using [SkLearn MultiOutputRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.multioutput.MultiOutputRegressor.html)
- The forecasts are made for one period in the horizon at a time
    - The set of predicted values for the regressors are then transformed and included in the test data for predicting the next period in the horizon

!!! note "Steps for adjusting test data for future forecasting"
    - Make MultiOutputRegressor prediction for T + 1 using the initial train test split
    - Add the T + 1 predicted regressors to the test set and remove the oldest data point
    - Apply relevant transformations
    - Make MultiOutputRegressor prediction for T + 2
    - Repeat the process for the desired forecast horizon

*[MultiOutputRegressors]: Estimators that can generate predictions for multiple target columns at the same time