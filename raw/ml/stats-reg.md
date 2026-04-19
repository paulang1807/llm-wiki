## [Simple Linear Regression Model](../stats-cheatsheet/#simple-linear-regression-model)

**Regression is the process of estimating the value of the dependent variable from the independent variable(s).**

The most common form of the Regression Model is the ==**Simple Linear Regression Model**==

- Also called ==**two-variable linear regression model**== or ==**bivariate linear regression model**==

It is represented as the equation of the line that best shows the trend in the data. The line is referred to as the ==**regression line**==.

- Also called ==**line of best fit**== or the ==**least squares line**== (see [Sum of Squared Residuals](#sum-of-squared-residuals))

!!! success "Expression"
    $$y=\beta_0 + \beta_1 x + u$$

    where 

    - $y$ is the dependent variable (==also called explained, outcome, predicted or response variable or just regressand==),
    - $\beta_0$ is the intercept,
    - $\beta_1$ is the slope parameter,
    - $x$ is the independent variable (also called control, predictor or explanatory variable or just regressor or covariate) and
    - $u$ is the error term or disturbance and includes the effect of all other factors aside from $x$
        - It is the difference between the actual value of a data point and the predicted value (value of the point on the regression line) and is also called the ==**residual**== for that data point
    
    - $\beta_0 + \beta_1 x$ is referred to as the ==**systematic part** of $y$==, the part that can be expalined by $x$  
    - $u$ is the ==**unsystematic part** of $y$==, the part that cannot be expalined by $x$

If the regression line has a

- positive slope, the data has a **positive linear relationship**
- negative slope, the data has a **negative linear relationship**

Also see [Correlation Basics Tip](../stats-basics/#cust-id-base-corr-tip)

If the data is clustered

- tightly around the regression line, it shows a **strong relationship**
- loosely around the regression line, it shows a **moderate or weak relationship** depending on the spread of the data points
    - the more outliers there are in the data, the weaker the relationship

!!! info
    In statistics, we usually write the slope and intercept at least to four decimal places to prevent severe rounding errors and getting a more accurate regression line

!!! note "[Error Assumptions](../stats-cheatsheet/#errors)"
    - Errors have zero means, $E(u) = 0$
    - Average value of $u$ does not depend on value of $x$, i.e. $u$ is **mean independent** of x. This is referred to as the ==**zero conditional mean assumption**== , $E(u|x)=E(u) \implies E(u|x) = 0$

!!! abstract "[Residual Properties](../stats-cheatsheet/#cust-id-cs-reg-res-prop)"
    - Estimated errors sum up to zero, $\sum_{i=1}^n \hat u_i = 0$
    - For any regression line, the mean of residuals is always zero, $\overline {\hat u} = 0$
    - Correlation between residuals and regressors is zero, $\sum_{i=1}^n x_i \hat u_i = 0$
    - Sample averages of y and x (point $\overline x, \overline y$) lie on a regression line, $\overline y = \hat \beta_0 + \hat \beta_1 \overline x$

## [Multiple Linear Regression Model](../stats-cheatsheet/#multiple-linear-regression-model)

### Assumptions

- **Linearity** - The relationship between the independent and dependent variables should be linear.  
    - It is also important to check for outliers since linear regression is ==sensitive to outlier effects==
    - The linearity assumption can best be ==tested with scatter plots==
    !!! danger "Remember"
        Always analyze the data distribution in order to determine if Linear Regression can be used to model the data. See [Anscombe's Quartet](https://en.wikipedia.org/wiki/Anscombe%27s_quartet)
- **Multivariate Normality** - All variables should be multivariate normal, i.e. the data points should be normally distributed along the line of linear regression.  
    - This assumption can best be ==checked with a histogram or a Q-Q-Plot==
    - ==Normality can be checked with a goodness of fit test==, e.g., the Kolmogorov-Smirnov test
    - When the data is not normally distributed, a ==non-linear transformation== (e.g., log-transformation) might fix this issue
<p id="cust-id-stats-reg-multicol"></p>
- **Lack of MultiCollinearity** - There should be little or no multicollinearity in the data, i.e the predictors (independent variables) are not correlated to each other.
    - Multicollinearity may be tested with three central criteria:
        - [Correlation matrix](../stats-cheatsheet/#correlation-matrix) – when computing the matrix of Pearson’s Bivariate Correlation among all independent variables the correlation coefficients need to be smaller than 1
        - [Tolerance](../stats-cheatsheet/#tolerance) – the tolerance measures the influence of one independent variable on all other independent variables  
        !!! tip
            - With T < 0.1 there might be multicollinearity in the data 
            - With T < 0.01 there  is multicollinearity in the data
        - [Variance Inflation Factor (VIF)](../stats-cheatsheet/#variance-inflation-factor) - This is good indicator when the sample size is small but is of limited use for large sample sizes
        !!! tip
            - With VIF > 5 there is an indication that multicollinearity may be present
            - With VIF > 10 there is certainly multicollinearity among the variables 
        - Condition Index – the condition index is calculated using a factor analysis on the independent variables.  
            - Values of 10-30 indicate a mediocre multicollinearity
            - Values > 30 indicate strong multicollinearity
    - If multicollinearity is found in the data
        - Centering the data (deducting the mean of the variable from each score) might help to solve the problem
- **Independence (Autocorrelation or Serial Correlation)** - There should be little or no autocorrelation in the data.  Autocorrelation occurs when the residuals/rows are not independent from each other
    - occurs when the value of current row y(x) is not independent from the value of the previous row y(x-1)
    - common for time series data
    - can be tested with the ==**Durbin-Watson test**==
        - [Durbin-Watson’s d](../stats-cheatsheet/#durbin-watson-statistic) tests the null hypothesis that the residuals are not linearly auto-correlated.  
            - d can assume values between 0 and 4
            - ==values of 1.5 < d < 2.5 show that there is no auto-correlation in the data==
            - only analyses linear autocorrelation and only between direct neighbors(successive data points), which are first order effects
- **[Homoscedasticity](../stats-cheatsheet/#homoscedasticity)** - data should be homoscedastic, i.e. the variance in the error term, $u$, is the same for all combinations of outcomes of the independent variables.  
    - Scatter plot should not show cone shaped distribution

### Modeling Methods
- **Use all variables**
    - Not preferred unless there is a compelling reason
- !!! example "Backward Elimination"
    - Select significance level (e.g. $\alpha$ = 0.05)
    - Fit model with all variables
    - If the variable with the highest **p-value** is greater than $\alpha$
        - Remove the variable 
        - Fit the model again with the remaining variables
        - Repeat process till the highest **p-value** is no longer greater than $\alpha$
- !!! example "Forward Selection"
    - Select significance level (e.g. $\alpha$ = 0.05)
    - Create separate **Simple Linear Regression models** by fitting each variable separately
    - Select the model with the lowest **p-value**
        - Create separate Regression models by fitting each of the remaining variables separately to this model
        - Repeat process till the lowest p-value is no longer lesser than $\alpha$
        - Use the model prior to the one that resulted in p-value greater than $\alpha$
- !!! example "Bidirectional Elimination (Stepwise Regression)"
    - Select significance levels to enter and stay in the model - both can be same (e.g. $\alpha$ = 0.05)
    - Perform **Forward Selection** step
        - Select the model with the lowest **p-value** 
        - Perform **Backward Selection** step with remaining variables
        - Remove the variables where **p-value** is greater than $\alpha$
        - Create separate Regression models by fitting each of the remaining variables separately to the **Forward Selection** model
        - Repeat the process till there are no variables to enter or exit
- !!! example "Score Comparison"
    - Select a criterion of goodness of fit (e.g. Akaike criterion)
    - Construct all possible regression models (discusssed above)
        - $2^N - 1$ total models can be created
    - Select the model with the best criterion

==**When writing python code, we usually don't have to worry about using a certain method for selecting the most statistically significant features. This is taken care of by the regression class in scikit learn package automatically.**==

## [Polynomial Regression Model](../stats-cheatsheet/#polynomial-regression-model)
The polynomial regression model is a linear regression even though the variables are not linear (they grow expnentially) as the linearity in the regression model is based on the coefficients of the independent variables(which are linear in this case).

## [Chi Square Tests](../stats-cheatsheet/#chi-square-tests)
Helps investigate the relationship betweem categorical variables. Refer [Chi Square Distribution Table](https://www.math.arizona.edu/~jwatkins/chi-square-table.pdf)

- Null Hypothesis: variables are independent
- Alternative Hypothesis: variables are correlated in some way

!!! abstract "Conditions for Inference"
    - **Random**
        - Sample should be random
    - **Large Counts**
        - Each [expected value](#cust-id-reg-exp-val) should be 5 or greater
    - **Independent**
        - Sample with replacement AND/OR
        - $n \leq \frac{N}{10}$ (Sample size less than 10% of total population - ==10% Rule==)
    - **Categorical**
        - variables should be categorical

Three types:

- $\chi^2$ test for homogeneity
    - Whether the probability distributions of **two separate groups** are homogenous (similar) with respect to some characteristic
        - The values corresonding to a homogenous distribution are referred to as the ==<b id="cust-id-reg-exp-val">expected values</b>==
        - ==The larger the value of $\chi^2$, the more likely that the variables affect each other and are not homogenous==
        - Compare the calculated $\chi^2$ against the chi square table value based on the desired $\alpha$ and degree of freedom to test the null hypothesis
        - ==Reject null hypothesis if $\chi^2 \gt \chi_\alpha^2$==
- $\chi^2$ test for association/independence
    - Whether two variables in the **same group** are related
- $\chi^2$ test for goodness of fit
    - Whether data (in a single data table) fits a specified distribution


## Decision Tree Regression
- At a very high level,
    - Splits data to maximize categories and finding optimal splits
    - The splitting process is repeated till all optimal splits are found
        - The decision process for splitting data results in a tree like structure
    - A split is also referred to as a leaf
        - The last leaf is called the terminal leaf

## [Support Vector Regression Model](../stats-cheatsheet/#support-vector-regression-model)
- Disregards any error within the ==$\varepsilon$ insensitive cube== (a cube with a buffer area around the regression line)
- Care about the errors above($\xi$) and below($\xi^*$) the cube area

    - These error points are vectors and are referred to as ==**support vectors**==. Also see [Support Vectors in Classification](../stats-cls/#support-vector-machine-svm)

## [Measures of Variation](../stats-cheatsheet/#measures-of-variation)

### [Sum of Squared Residuals](../stats-cheatsheet/#sum-of-squared-residuals)
To find the best fitting regression line that shows the trend in the data, we want to minimize all the residual values, because doing so would minimize the distance of the data points from the line of best fit. 

In order to minimize the residual, we actually minimize the square of the residuals so that the positive and negative values of the residuals do not cancel out and all residuals get minimized.

This form of regression is also referred to as ==**Ordinary Least Squares Regression**== as we are trying to minimize the squae of the residuals.

### [Coefficient of Determination, $R^2$](../stats-cheatsheet/#coefficient-of-determination)
Measures the percentage of error we eliminated by using least-squares regression instead of just mean,$\overline y$. 

- For Simple Linear Regression, square of the [Correlation Coefficient ($r^2$)](../stats-cheatsheet/#correlation) is used instead of $R^2$. 

- Tells us how well the regression line approximates the data
!!! tip
    - Ranges between 0 and 1
    - Expressed as percentage
        - 100% describes a line that is a perfect fit to data
            - Very rare (almost non -existant) for ML models
        - The higher the value, the more data points pass through the line
        - Very small values indicate that the regression line does not pass through many data points

### [Adjusted R-Squared](../stats-cheatsheet/#adjusted-r-squared)

- Better measure for model evaluation
- Sensitive to the number of independent variables in the model
- Penalizes the model when increasing independent variables
    - As we put more variables into the model, R-squared increases even if those variables are unrelated to the outcome
        - OLS tries to predict variables that reduce the residuals
        - Sets coefficients of additional independent variables to 0 if they don't contribute to reducing residuals
    - Adjusted R-squared attempts to correct for this by deflating R-squared based on increase of additional predictors

### [Root Mean Square Error (RMSE)](../stats-cheatsheet/#root-mean-square-error)
The standard deviation of the residuals

- Also called the ==**Root Mean Square Deviation(RMSD)**==
!!! tip
    - Can be thought of as lines representing the standard deviation of the residuals
        - Parallel to the regression line
        - Distance between the lines represents the fit
            - The lesser the distance, the better the fit
    - The concept of normal distribution probability based on standard deviations(see [here](../stats-distributions/#cust-id-dst-ndist-tip)) can be applied here
        - ==68.2% of the data points will fall between 1 * RMSE of the regression line==
        - ==95.4% of the data points will fall between 2 * RMSE of the regression line==
        - ==99.7% of the data points will fall between 3 * RMSE of the regression line==