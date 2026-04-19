# Statistics Basics

## Median and Mode
**Median:** The value at the middle of the data set when we line up all the
data points in order from least to greatest.

**Sample median:** Obtained by first ordering the n observations from smallest to largest (with any repeated values included so that every sample observation appears in the ordered list). Then,

!!! success "Expression"

    $$\tilde x = \begin{cases}
    \text{The single middle value if n is odd} = \biggl(\frac{n + 1}{2}\biggl)^{th} \text{ordered value} \\
    \text{The average of the two middle values if n is even} = {average of } \biggl(\frac{n}{2}\biggl)^{th} and \biggl(\frac{n}{2} + 1 \biggl)^{th} \text{ordered values}
    \end{cases} $$

**Mode:** The most frequently occuring value in the data set

## Range and Quartiles
**Range:** The difference between the largest and the smallest value in the dataset.

**Quartiles:** A number that divides the data set into quarters. They are expressed as $4^{th}$.

!!! note

    - The $1^{st}$ quartile, $Q_1$, is equal to 1/4 or 0.25 quantile or 25th percentile and separates the lowest 25 % of data points from the second 25 % . 
    - The $2^{nd}$ quartile, $Q_2$, is the `median`, and it separates the data set into halves. 
    - The $3^{rd}$ quartile, $Q_3$, is equal to 3/4 or 0.75 quantile or 75th percentile and separates the third 25 % of data points from the upper 25 % of data points.
 
**Interquartile Range** is the difference between the third and the first quartile

!!! success "Expression"

    $$IQR = Q_3 - Q_1$$

**Deciles** are expressed as $10^{th}$. For example, $3^{rd}$ decile is equal to 3/10 or 0.3 quantile

## Variance and Standard Deviation
**[Variance](../stats-cheatsheet/#population-variance):** How far the data is spread from the mean.  

**[Standard Deviation](../stats-cheatsheet/#population-standard-deviation):** Square root of the Variance.

## Shifting and Scaling
**Shifting:** Whether we add a constant to each data point or subtract a constant from each data point, ==the mean, median, and mode will change by the same amount==, but ==the range, standard deviation and IQR will stay the same==

!!! success "Expression"

    If $y_1 = x_1 + c, y_2 = x_2 + c, ..., y_n = x_n + c, \ then \ s_y^2 = s_x^2$

**Scaling:** If we multiply or divide each data point in a dataset by a constant value, the mean, median, mode, range ,standard deviation and IQR will ==all get multiplied or divided by the same value==

!!! success "Expression"

    If $y_1 = cx_1, y_2 = cx_2, ..., y_n = cx_n, \ then \ s_y^2 = c^2s_x^2 \ and  \ s_y = |c|s_x$

## [Covariance](../stats-cheatsheet/#covariance)
**Covariance** measures the amount of **linear dependence** between two random variables, i.e., it reflects the directional relationship (but not the magnitude) between two random variables.

- If a positive change in one variable causes a positive change in the other variable (or a negative change in one causes a negative change in the other), then the variables have a positive relationship and we should expect positive covariance. 
- But if a positive change in one variable causes a negative change in the other variable, then the variables have a negative relationship and we should expect negative covariance. 
- And if the variables have no real discernible relationship, we’ll expect a value for covariance that’s close to 0.

!!! danger "Remember"
    - ==**Covariance calculation can’t distinguish between different units of measure (e.g. using hours vs minutes - using minutes will result in a larger covariance value)**==
    - To correct for covariance’s lack of sensitivity to the units of measure of each variable, we prefer instead to calculate the ==**correlation coefficient**==

!!! tip
    * If $X$ and $Y$ are independent, 
    $$ Cov(X,Y) = 0 $$

## [Correlation](../stats-cheatsheet/#correlation)
**Correlation** is the degree of the relationship between two random variables. 

- Correlation, $\rho$ is defined as the covariance of the standardizations of $X$ and $Y$
- Correlation, $\rho$ is dimensionless (it's a ratio)

<p id="cust-id-base-corr-tip"></p>

!!! tip
    * varies between -1 and 1
    * $\rho = 1 \ or \ -1$ iff $Y = aX + b$ for some numbers $a$ and $b$ with $a \neq 0$

        - $0 \leq \rho \leq 1$ indicates positive slope for regression line
        - $-1 \leq \rho \leq 0$ indicates negative slope for regression line
    * the relationship is described as strong if $| \rho | \geq .8$, moderate if $.5 \lt |\rho | \lt .8$, and weak if $| \rho| \leq .5$
    * doesn't change whether we add/multiply constants to/with the x or y variables
    * if $X$ and $Y$ are independent, then $\rho = 0$, but $\rho = 0$ does not imply independence

The **[Pearson Correlation Coefficient](../stats-cheatsheet/#pearson-correlation-coefficient)** is one of several correlation coefficients that can be used to measure correlation. 

!!! info
    It makes sense to calculate the Pearson correlation coefficient if all of the following conditions are true: 

    - Both variables are quantitative.
    - The variables are normally distributed or close to normally distributed. 
    - There are no outliers. The presence of outliers may significantly skew the data and the resulting Pearson correlation coefficient will not accurately reflect the correlation of the two variables. 
    - The relationship between the variables is linear. Pearson correlation is best for data sets that with a reasonably straight trend line.  
