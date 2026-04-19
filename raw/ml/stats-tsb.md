## Basics 

!!! abstract "Terminology"
    - **Period** - Time taken for one repetition of a cycle. Denoted as $T$
    - **Frequency** - Number of occurences of a repeating event over a unit of time. Calculated as $F=\frac{1}{T}$
    - **Market Efficiency**: Measures the level of difficulty in forecasting future values 
    - **Arbitrage**: Buy and sell commodities and make a safe profit while the price adjusts

- [Sample EDA](https://colab.research.google.com/drive/1DBoFlqtpY1jBBz2mZRoac2KlQeNLpT3C)
- Intervals between data points should be identical
    - Encode / Impute missing data / time periods as needed
        - Setting the frequency (`df.asfreq()` method) will add rows corresponding to any missing periods for the desired frequency
        - When handling missing data, it is usually NOT a good idea to fill the missing values with mean values
            - This is appropriate only when all data points for the column fluctuate heavilly around the mean which is rarely the case
            - See [Handle Missing Data](../ml-tsb/#handle-missing-data) for sample code
- We normally use dates as the dataframe indexes for time series data
    - When [resampling](../ml-tsb/#cust-id-tsb-resampl) data, the date column is automatically set as the index column
- In time series analysis, we normally work with one dependent variable at a time
- ==**We cannot shuffle time series data as they need to be in chronological order**==
- If the data has any non linear distribution (quadratic, polynomial, logarithmic, exponential etc.), 
    - converting the values to get a more linear trend can be helpful  
    - helps reducing the noise and bring out underlying trends
        - Various **Power Transformation** techniques can be used in such scenarios
            - ==Used only when there is no trend or seasonality in the series==
            - ==**Moving Average Smoothing**== is the process of creating a new series where the values correspond to the **"moving averages"** of the original values
                - Involves determining the **window width** and **position** (leading, trailing, centered etc.)
                - Centered and Leading positions require a knowledge of future values and are not useful in predictions (since future value is what we are trying to predict)
            <p id="cust-id-tsb-exp-smth"></p>
            - ==**[Exponential Smoothing](../stats-cheatsheet/#exponential-smoothing)**== is the process of creating a new series where the values correspond to the **"weighted averages"** of the original values with larger weight given to the more recent values
                - The smoothing constant $\alpha$ is learned by minimizing the forecasting error

            !!! note
                - A **Fast Learner** model is one where the smoothing constant ($\alpha$) is closer to 1

                    - More importance given to the newer values

                - A **Slow Learner** model is one where the smoothing constant ($\alpha$) is closer to 0

                    - More importance given to the older values

    - may result in better forecasting for some of the models

- Some time series models expect **de-trended** and **de-seasonalized** data
    - Some Tree based forecasting models perform better with de-trended data
    <p id="cust-id-tsb-diff"></p>
    - Use ==**[Differencing](../stats-cheatsheet/#lag-k-differencing)**== to remove the trend and seasonality from the data in such cases
        - Use `Lag 1 Differencing` to get rid of the linear trends
            - For getting rid of the quadratic trends, we apply differencing on the "differenced" series again.
        - Use `Lag 7 Differencing` to get rid of weekly seasonality, `Lag 12 Differencing` to get rid of monthly seasonality and so on
            - This is applied on the "differenced" data that was used to remove trends

- Plot data to understand patterns in data and use corresponding feature engineering techniques to address the patterns
    - For example, use **Lag Scatter plots** to understand if there is any relation between lag periods and current periods
        - Use Lag Features to address these patterns
    - Refer [Sample EDA](https://colab.research.google.com/drive/1DBoFlqtpY1jBBz2mZRoac2KlQeNLpT3C) for more examples
- ==For a good model the residuals will be random (stationary **white noise**) and the residual coefficients will not be significant==
- For train-test split we need to ensure that 
    - Training data is from beginning to a certain cut off point in time
    - Test data starts at the cut off point and continues till the end

### [White Noise](https://colab.research.google.com/drive/10kKCr6cRvFVMWI89cGGLmp98KdvJM1_G#scrollTo=vqSgsmJBlBC5)
- A special type of time series where the data does not follow a pattern
    - Is a random series
    - Hence difficult to model or forecast
- Conditions:
    - Mean is zero
    - Have a constant mean and variance
    - No autocorrelation in any period
        - No clear relation between the past and present values in the time series
- Is [stationary](#stationarity)
- Can be represented as the [AR Time Series](../stats-cheatsheet/#autoregressive-process-ar) with no autoregressive terms ($p = 0$)

### [Random Walk (Drunkard Walk)](https://colab.research.google.com/drive/10kKCr6cRvFVMWI89cGGLmp98KdvJM1_G#scrollTo=mRviui_llBC6)
- A special type of time series where the next value is only dependent on the current value
    - The best esitmator of today's value is yesterday's value
    - The best estimator of tomorrow's value is today's value
    - This process is also referred to as ==**Naive Forecasting**==
- Apart from the dependency on the previous value, the entire series is random
- Can be represented as the [AR Time Series](../stats-cheatsheet/#autoregressive-process-ar) with the autoregressive terms just for the previous period ($p = 1$) and the coefficient ($\phi_1$) set to 1

### [Stationarity](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=b8edb6e7-7a2c-4b3c-a09c-cb799cb22a02)
- Implies that taking consecutive sets of data **with the same size** should have **identical covariances** regarless of the starting point
    - Which means the data does not have trend or seasonality
- Also referred as ==**weak-form stationarity**== or ==**covariance stationarity**==
- Assumptions:
    - Have a constant mean and variance
    - Consitent covariance between periods at constant distance from one another
- White Noise is an example of a weak form stationarity 
- ==**Dickey-Fuller Test**== (also called DF Test) can be used to check if data is from a stationary process
    - Null hypothesis is that the data comes from a non-stationary process
    - ==**Reject Null hypothesis if the test statistic is less than the critical value for the desired significance level in the Dickey-Fuller table**==

### Trend
- Types
    - Linear
    - [Piecewise Linear](../stats-cheatsheet/#piecewise-linear-regression) - Breaking up a non linear curve at changepoint
        - Can use non-linear time features (higher order terms) to model non-linear features
            - Not recommended
            - Risk of Overfitting and poor Extrapolation
            - Predictions can be improved to some extent by using **Regularization** (e.g. Ridge Regression)
        - Useful for scenarios where the number of changepoints are less
        - See [Time Features with Changepoints](../ml-tsb/#cust-id-tsb-time-feat)

*[changepoint]: Abrupt change in the property of a time series, e.g. changes in trend, seasonality, ar etc.

### Seasonality
- Suggests that certain patterns in the data repeat with a fixed frequency
    - This is diffferent from ==**cyclical patterns**== in that the cyclical patterns repeat without a fixed frequency
        - They repeat but the period between consecutive repetitions may be different
    - [Lag features](../ml-tsb/#lag-features) can be useful when analyzing both seasonality and cyclical patterns
    - ==**[Features based on derived date time columns](../ml-tsb/#date-time-features), one hot encoded date time feature columns (seasonal dummies) and fourier transforms can be useful for analyzing seasonality**== but may not be as useful for analyzing cyclical patterns 
        - One Hot encoded date time features can be useful for linear models to capture the effect of a given value for the encoded feature
- If the data is seasonal, we may need to consider factors other than the current period for prediction

### Variance Stabilization
#### [Log Transform](../stats-cheatsheet/#log-transform)
- Can be used to stabilize the variance of a time series
    - Cannot always stabilize the variance
    - May or may not work depending on the time series
- Some models like ARIMA perform better if the variance does not increase with time

#### [Box Cox Transform](../stats-cheatsheet/#box-cox-transform)
- More commonly used to stabilize the variance
- Combines log transform and power transform ($y^{\lambda}$)
- Methods to automatically select $\lambda$ value
    - Maximum Likelihood (MLE) Method: Picks $\lambda$ that makes transformed data look most normally dustributed
    - ==**[Guerrero Method](../stats-cheatsheet/#guerrero-method)**==: Picks $\lambda$ to make variance constant across time series
        - More suitable for time series use cases
        - Value of $\lambda$ that minimizes $C_V(\lambda)$ makes the variance `most constant`

        !!! tip "Determination of Number of Subseries for Guerrero Method"
            - If data has seasonality 
                - Number of subseries is set to the number of seasonal periods 
            - Else it is set to 2
                - To minimize loss of information caused by grouping

### [Moving Average](../stats-cheatsheet/#moving-average)
- Can be used to extract trend information from the time series
    - Not the preferred method due to its limitations
- Moving average of order(window size) $m$ is denoted as $m-MA$
    - Window size is often the same as the seasonality
- For even windows,
    - First apply the MA for the desired window size
    - Then apply another MA with a window size of 2 on the result from the first MA
- Applied to the center for odd windows
    - Applied to the edges for even windows and the shifted up by $m/2$ rows
<p id="cust-id-tsb-ma-lim"></p>
- Limitations
    - Extreme edges of the MA windows will have NaN values
        - For even windows, the top and bottom $m/2$ values will be NaN
    - When using mean MAs are distorted by outliers
        - Medians may be a better option in these scenarios
    - Tends to oversmooth rapid changes
    - Seasonal component does not change in time (e.g. seasonal component for January is the same for every year)
    - Difficult to select window size if seasonality is not known

### [Decomposition](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=nbGd-dmUMjhV)
- Splits the time series into 3 effects:
    - Trend -> Consistent patterns in data
    - Seasonal -> Cyclical patterns
    - Residual/Noise -> Prediction Error or Random Variation
        - The part of the time series not explained by trends, seasonality, or cycles
- Expects a linear relationship between the three effects
- Uses the previous period values as trend-setter
- Approaches:
    - **Additive**: For any time period, the observed value is the sum of the three effets
    - **Multiplicative**: For any time period, the observed value is the product of the three effets

    !!! tip
        - For additive seasonality
            - The seasonal spikes (magnitude of the pattern) will appear roughly constant in size over time
            - Think in terms of adding absolute values
        - For multiplicative
            - The seasonal spikes will grow/shrink as the time series increases/decreases
            - The trend is usually exponential
            - Think in terms of percentages

- A multiplicative decomposition can be converted to an additive decomposition by using the [log transform](#log-transform)
    - If the time series is multiplicative, then the log of the time series is additive
- Some decomposition methods such as [STL decomposition](#stl) can handle only additive cases

!!! info "Classical Decomposition Steps"
    - Identify order of seasonality
    - Calculate Trend using moving average method
    - De-Trend the data
        - For additive: $y_t - trend_t$
        - For multiplicative: $y_t / trend_t$
    - Calculate seasonality by grouping the de-trended data by month and taking mean
    - Calculate the residuals as $y_t - trend_t - seasonality_t$

    Also see [Colab Notebook for Classical Decomposition](https://colab.research.google.com/drive/1X2JnsdMTkmIJVNAys_a2hkiZG6o3bmsf)

### [LOWESS](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=Y_yQCcBDis8k)
- Can be used to estimate the trend of a time series
- Extracts the trend by plotting a smooth curve to fit a scatterplot of the data points
    - Works only with univariate data
- Curve is generated by iterating through the following process for multiple points $x$
    - At each point $x$, a weighted robust linear regression is fitted for a fraction of the data $f$ around $x$
        - Linear regression is fitted $t$ times to get the best fit 
            - Data is weighted such that the data at the edges of the window have less weight and the ones closer to x have more weight
                - Uses a tri-cubic weight function
            - The residuals (outliers) for each regression are given lesser weight in the following regression
                - Uses a bi-square weight function
    - The intersection of the best fit regression with the vertical line through $x$ gives one data point for the smooth curve
    - Combining all such points from all the iterations results in the final curve
- Not effected by outliers
- No missing data at the edges
- No assumptions are made about the data
- Slow to fit on large datasets
    - Requires acces to the entire dataset to evaluate the curve at any point

### LOESS
- Very similar to LOWESS in approach except for the following differences
- Uses a polynomial regression (instead of linear)
- Fits a surface (instead of curve) to multivariate data (instead of univariate)

### [STL](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=WaUCgQFzTfVk)
- Extracts seasonality and trend iteratively using LOESS
- Robust to outliers
- Assumes the time series to be additive
    - For multiplicative series, take the log transform to make it additive
    - Transform back to original scale by using inverse log transform
- Seasonal component can vary in time and is not necessarily periodic
- Use MSTL for decomposing the time series into multiple seasonal components
    - Also see [Colab Notebook for MSTL Decomposition](https://colab.research.google.com/drive/1bygHBLvlvNA6PfX8W-hQlf-zUFpmRMzE#scrollTo=special-institution)

!!! info "STL Steps"
    - Iterates through the following (outer loop)
        - Iterates through the following (inner loop)
            - De-Trend data ($y_t - trend_t$)
                - For first iteration, $trend_t$ is assumed to be 0
            - Extract seasonal component from the de-trended data 
                - Use LOESS with smoothing on Cycle-Subseries
            - Extract trend as $y_t - seasonal_t$ and smoothing using LOESS
            - Repeat till the variance in seasonal and trend component is not much (typically 2 -3 times)
        - Compute residuals ($y_t - trend_t - seasonality_t$)
        - Compute weights from residuals and pass to LOESS in the inner loop
            - Weights are used to reduce the impact of outliers

    Also see [Colab Notebook for STL Decomposition](https://colab.research.google.com/drive/1v9iAceyLdQkxhASbHZJ166kQeCGkrtiU)

*[LOWESS]: Locally Weighted Scatterplot Smoothing
*[LOESS]: Locally Estimated Scatterplot Smoothing
*[STL]: Seasonal and Trend Decomposition using LOESS
*[Cycle-Subseries]: Time series formed from looking at the value of each period within a seasonal cycle over time

### [Autocorrelation](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=02191b9d-b9bc-488a-8d9f-9d47127665cf)
- Represents the correlation between an observation and a "lagged" version of itself
    - Includes both direct and indirect effects
        - Effect of lag t on current does includes the effects of lags t-1,t-2, etc. on lag t (which may indirectly effect the current data point)
- Autocorrelation in data 
     - at daily frequency checks for correlation between yesterday's and today's data
     - at monthly frequency checks for correlation between last month and current month data
- When data has a trend, the autocorrelations for small lags are usually large and positive 
    - Observations close in time are also nearby in value
- When data show seasonality, autocorrelation values will be larger in correspondence of seasonal lags (and multiples of the seasonal period) than for other lags
- Data with both trend and seasonality will show a combination of these effects.
- In the ACF plot, 
    - X Axis represnts the lags
    - Y Axis shows the correlation values
    - The Blue region around the x axis is the cone of 95% confidence and represents significance

!!! note "ACF Interpretation"
    - If the autocorrelation values are higher than the blue region, 
        - we can say with 95% confidence that the variables (lagged versions) are correlated
            - indicating time dependence in the data
    - If the values fall withiin the blue area, the coefficients are not correlated
    - A sharp drop-off indicates the lag beyond which correlations are not significant

### [Cross Correlation](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=WANRVWnFLn6F)
- Similar to autocorrelation
- Represents the correlation between the target and a "lagged" version of a predictor variable
- Captures only the linear relationship between the target and the lagged version of the predictor
- We should de-trend and de-seasonalize the data before testing the crosss correlation

### [Partial Autocorrelation](https://colab.research.google.com/drive/1u93tB_xbgIrgWNFWrHId_oom7ttz1T01#scrollTo=83f87240-e49c-4df1-a15b-b344a1d004c8)
- Measures the correlation between an observation and its lagged values **while adjusting for the effects of intervening observations** 
- Helps identify the direct effect of a specific lagged version on the time series 
    - Removes the influence of other intermediate lags on the concerned lags
        - Effect of lag t-2 on t does not include the effects of lag t-2 on t related to its effect on t-1 
            - Since t-1 also effects t, the effect of t-2 on t-1 will have an indirect effect t as well
            - This is removed when using Partial Autocorrelation
- Assumes that the time series data is stationary, i.e. it has a constanct mean and variance
    - If the mean changes, i.e. the data has a trend component, de-trend the data before applyiing Partial Autocorrelation
    - If the variance changes, [variance stabilization](#variance-stabilization) techniques should be used first

!!! danger "Remember"
    - ACF, CCF and PACF plots assume that the data is stationary
        - De-trend and de-seasonalize the data before plotting to get better results

### Structural Time Series
- Time series focuses on the overall trend, while ==structural time series also looks at the underlying components that create the trend==
- In addition to the [seasonal decomposition components](#decomposition), the impact of various exogenous factors are also considered
    - Impact Effects (holidays and other events)
    - External Regressors (other factors that may have an impact on the time series)
        - Requires the knowledge of these factors for the future periods for which the prediction is being made
        - Linear Regression is often used to assess the impact of the factors
    - Autoregressive component that focus on exponential smoothing may also be considered
    - Even the seasonality can be considered at multiple levels - Weekly, Monthly, Yearly etc.
- Also see [Structural Time Series by Fast Forward Labs](https://structural-time-series.fastforwardlabs.com/)

### Model Selection
!!! tip 
    When comparing models, we should select the one with **Higher Log Likelihood** and **Lower Information Criteria** (**AIC** and **BIC** values)

*[AIC]: Akaike's Information Criteria
*[BIC]: Bayesian Information Criteria

## [Autoregressive Process (AR)](../stats-cheatsheet/#autoregressive-process-ar)

- Relies on past period values and past periods (lags) to predict the current value
- It is a linear model
- Current period values are a sum of past outcomes multiplied by a numeric factor $\phi$

!!! info "AR1 Processes"
    - If $\phi_1 = 1$ and $c > 0$, the time series grows linearly; time series is not stationary
    - If $\phi_1 \gt 1$, the time series grows exponentially; time series is not stationary
    - If $\phi_1 \lt 1$, the time series grows exponentially but oscillates from negative to positive for each iteration; time series is  stationary

- ==**Number of lags to be included in the model is determined using [PACF](#partial-autocorrelation)**==
- ==**Works with time series data without trend and seasonality (i.e. Stationary data)**==
    - Use [Differencing](#cust-id-tsb-diff) to get rid of trend and seasonality, if present
- To convert non stationary to stationary data
    - Use **% change** instead of **values**
        - % change between the values of two consecutive periods

## [Moving Average Model (MA)](../stats-cheatsheet/#moving-average-model-ma)

- ==Takes into account past residuals (lags in the white noise)==
    - Predictions are corrected immediately following an error
- Allows the predictions to adjust accordingly
- ==**Number of lags to be included in the model is determined using [ACF](#autocorrelation)**==
- ==**Very useful for predicting random walk datasets**==
    - Always adjust based on the error from the previous period
- Steps
    - Build a forecasting model (AR or Naive)
    - Find forecast errors or Residuals
    - Build a forecast model on the residuals
        - Common to use AR model on lagged residuals
    - Use the forecasted residuals to update the initial forecast
- If the initial model is AR, then the resulting MA model is also called ==**ARMA model**==
- **Works with time series without trend and seasonality (i.e. Stationary data)**
    - Use [Differencing](#cust-id-tsb-diff) to get rid of trend and seasonality, if present
    - We can also remove the trend and seasonal values obtained by the decomposition process

## Holt-Winters (Triple Exponential Smoothing)
- Splits the time series into 3 parts
    - Level (Most recent past of the data)
    - Trend
    - Seasonality
- Performs [exponential smoothing](#cust-id-tsb-exp-smth) at the three levels
- Does not allow external regressors
- Works better with lesser number of time periods or frequency

## TBATS
- T: Trigonometric seasonality B: Box-Cox transformation A: ARIMA errors T: Trend S: Seasonal components
- Uses [Exponential Smoothing](#cust-id-tsb-exp-smth) concepts
- Does not allow external regressors
- Each seasonality is modeled by a trigonometric representation based on Fourier series
- Considers various models to come up with final recommended model
    - with Box-Cox transformation and without it Box-Cox transformation.
    - with considering Trend and without Trend.
    - with Trend Damping and without Trend Damping.
    - with ARIMA(p,d,q) and without ARMA(p,q) process used to model residuals.
    - non-seasonal model.
    - various amounts of harmonics used to model seasonal effects
    - The final model will be chosen using Akaike information criterion (AIC).

*[Box-Cox transformation]: Transforming the dependent variable into a normal distribution

## [ARMA](../stats-cheatsheet/#arma)

- Defined by 2 orders: **AR (auto regressive component)** and **MA (moving average part)**
    - $ARMA(P,Q)$ takes lag values upto $P$ periods ago and residuals upto $Q$ lags (window size for MA)
    - P and Q can be equal but this may not always be the case

## ARIMA

- [Differencing](#cust-id-tsb-diff) is integrated into the ARMA model to handle trend 
    - Not capable of handling seasonality
- Steps
    - Use differencing to remove trend
    - Use AR for forecasting
    - Use MA on residuals to update forecast
    - Re-introduce trend and seasonality using **de-differencing**
- Defined by 3 orders: AR, **I (Differencing)** and MA
    - $ARIMA(p, d, q)$ takes $p$ lag values, $q$ residuals and $d$ number of differencing

        - $d$ can be 1 for linear trends and 2 for quadratic trends
        - ARIMA model with $q$ = 0 ($ARIMA(p, d, 0)$) represents an [Autoregressive Model](#autoregressive-process-ar)
        - ARIMA model with $p$ = 0 ($ARIMA(0, d, q)$) represents a [Moving Average Model](#moving-average-model-ma)

    !!! tip
        - Use line plot to identify trend difference order(d)
        - Use autocorrelation plot to identify trend AR order (p)
        - Use partial autocorrelation plot to identify trend MA order (q)

*[ARIMA]: Auto Regression Integrated Moving Average