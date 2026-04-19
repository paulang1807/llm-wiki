## Basics
### Mean
=== "Population"
    $$\mu = \frac{x_1 + x_2 + ... + x_N}{N} = \frac{\sum_{i = 1}^N x_i}{N}$$

=== "Sample"
    $$\overline x = \frac{x_1 + x_2 + ... + x_n}{n} = \frac{\sum_{i = 1}^n x_i}{n}$$

Also see [Random Variables: Expected or Mean Value](#expected-or-mean-value)

#### Weighted Mean
=== "Population"
    $$\mu_w = \frac{\sum_{i=1}^N w_i x_i}{\sum_{i=1}^N w_i}$$

=== "Sample"
    $$\overline x_w = \frac{\sum_{i=1}^n w_i x_i}{\sum_{i=1}^n w_i}$$

#### Grouped Data Mean
=== "Population"
    $$\mu = \frac{\sum_{i=1}^N f_i M_i}{N}$$

    where $M_i$ is the midpoint and $f_i$ is the frequency of each class

=== "Sample"
    $$\overline x = \frac{\sum_{i=1}^n f_i M_i}{n}$$

    where $M_i$ is the midpoint and $f_i$ is the frequency of each class

### Variance
=== "Population"
    $$\sigma^2 = \frac{\sum_{i=1}^N (x_i - \mu)^2}{N} $$

=== "Sample"
    **Biased**

    $$s^2 = \frac{\sum_{i=1}^n (x_i - \overline x)^2}{n} $$

    **Unbiased**

    $$s_{n-1}^2 = \frac{\sum_{i=1}^n (x_i - \overline x)^2}{n - 1} $$

Also see [Random Variables: Variance](#variance_1)

#### Weighted Variance
=== "Population"
    $$\sigma_w^2 = \frac{\sum_{i=1}^N w_i(x_i - \mu_w)^2}{\sum_{i=1}^N w_i} $$

=== "Sample"

    $$s_w^2 = \frac{\sum_{i=1}^n w_i(x_i - \overline x_w)^2}{\sum_{i=1}^n w_i} $$

#### Grouped Data Variance
=== "Population"
    $$\sigma^2 = \frac{\sum_{i=1}^N f_i(M_i - \mu)^2}{N}$$

=== "Sample"
    $$s^2 = \frac{\sum_{i=1}^n f_i(M_i - \overline x)^2}{n-1}$$

###  Standard Deviation
=== "Population"
    $$\sigma = \sqrt{\sigma^2} = \sqrt{\frac{\sum_{i=1}^N (x_i - \mu)^2}{N}} $$

=== "Sample"
    $$s = \sqrt{s_{n-1}^2} = \sqrt{\frac{\sum_{i=1}^n (x_i - \overline x)^2}{n - 1}} $$

### Covariance
=== "Population"
    $$\sigma_{xy} = cov(x,y) = \frac{\sum(x_i - \mu_x)(y_i - \mu_y)}{N}$$

=== "Sample"
    $$s_{xy} = cov(x,y) = \frac{\sum(x_i - \overline x)(y_i - \overline y)}{n - 1}$$

Also see [Random Variables: Covariance](#covariance_1)

### Variance Covariance Matrix
$$vcov(x,y) = \begin{bmatrix}
var(x) & cov(x,y) \\
cov(x,y) & var(y)
\end{bmatrix}$$

$$var(X) = \begin{bmatrix}
var(X_1) & cov(X_1, X_2) & \dots & cov(X_1, X_n) \\
cov(X_2, X_1) & var(X_2) & \dots & cov(X_2, X_n) \\
\vdots & \ & \ddots \\
cov(X_n, X_1) & cov(X_n, X_2) & \dots & var(X_n) \\
\end{bmatrix}$$

### Correlation

$$ r = \frac{1}{n - 1}\sum {\biggl(\frac{x_i - \overline x}{S_x}\biggl)\biggl(\frac{y_i - \overline y}{S_y}\biggl)} = \frac{1}{n - 1}\sum {(z_x)(z_y)}$$

where
$S_x$ and $S_y$ are the standard deviations with respect to x and y and $z_x$ and $z_y$ are the z-scores for x and y.

#### Pearson Correlation Coefficient
=== "Population"
    $$\rho_{xy} = \frac{\sigma_{xy}}{\sigma_x\sigma_y}$$

    where $\sigma_{xy}$ is the covariance and $\sigma_x$ and $\sigma_y$ are the standard deviations of the variables.

=== "Sample"
    $$r_{xy} = \frac{s_{xy}}{s_xs_y}$$

Also see [Random Variables: Correlation](#correlation_1)

#### Correlation Matrix

$$r(X) = \begin{bmatrix}
1 & r(X_1, X_2) & \dots & r(X_1, X_n) \\
r(X_2, X_1) & 1 & \dots & r(X_2, X_n) \\
\vdots & \ & \ddots \\
r(X_n, X_1) & r(X_n, X_2) & \dots & 1 \\
\end{bmatrix}$$

### Z-Score
$$z = \frac{\overline x - \mu}{\sigma}$$

where $x$ is the data point, $\mu$ is the mean and $\sigma$ is the standard deviation.

## Random Variables
### Discrete Random Variables
**Probability Mass Function (pmf)**, $p(x)$ for a discrete random variable $X$ is given by 
$$ p(x) = p_X(x) = P(X = x) = P(\{w \in \Omega:X(w) = x\}) $$ where $x$ is a value of the discrete RV $X$ and belongs to the set of real numbers $$ \{x \in R :f(x) \gt 0\} $$ and maps to the outcomes w and $(X = x)$ is the corresponding event.
Also,
    $$ p(x) \geq 0 $$ and
    $$ \sum_xp(x) = 1 $$

### Continuous Random Variables
For any two numbers a and b, the **probability density function (pdf)** of a continuous RV $X$ is given by
$$ P(a \leq X \leq b) = \int_a^bf(x)\ dx $$ where 
$$ f(x) \geq 0 $$ for all $x$ and 
$$ \int_{-\infty}^{\infty}f(x) \ dx = 1 $$ is the area under the entire graph of $f(x)$. 

$f(x)dx$ is the probability that $X$ is in an infinitesimal range around $x$ of width $dx$.

Also, $$ P(a \leq X \leq b) = P(a \lt X \lt b) = P(a \lt X \leq b) = P(a \leq X \lt b) $$

**Continuous RV at any single value**
$$ P(X = c) = \int_c^cf(x) \ dx = \lim_{\epsilon \to 0} \int_{c - \epsilon}^{c + \epsilon} f(x) \ dx = 0 $$

### Expected or Mean value 
=== "Discrete RV"
    !!! warning ""
        $$ E(X) = \mu_X = \sum_{x \in D}x . p(x) = \sum_{i=1}^n x_i . p(x_i) $$
        where X is a discrete RV with set of possible values D and pmf p(x)

    If $p(x_i)=p(x_j) \ \forall \ i,j$, i.e. each outcome has the same probability and hence equal likelihood of happening, then
        $$ E(X) = p(x)\sum_{i = 1}^kx_k = \frac{1}{k} \sum_{i = 1}^kx_k $$
        where 1/k is the probability of k terms with equal likelihood 

    For any linear function $h(X) = aX + b$,
    $$ \mu_{h(X)} = E[h(X)] = \sum_Dh(x).p(x) $$

=== "Continuous RV"
    !!! warning ""
        $$ \mu_X = E(X) = \int_{-\infty}^{\infty}x.f(x) \ dx $$

    $$ \mu_{h(X)} = E[h(X)] = \int_{-\infty}^{\infty}h(x).f(x) \ dx $$

#### ==Rules of Expected Value==
$$ E(X + Y) = E(X) + E(Y) $$

$$ E(X - Y) = E(X) - E(Y) $$

$$ E(aX + bY) = aE(X) + bE(Y) $$

If $X$ and $Y$ are independent,
$$ E(XY) = E(X)E(Y) $$

For any linear function $h(X) = aX + b$,
$$ E(aX + b) = a. E(X) + b $$
$$ \mu_{aX + b} = a. \mu_X + b $$

### Variance
=== "Discrete RV"
    !!! warning ""
        $$ V(X) = \sigma_X^2 = \sum_D(x - \mu)^2 . p(x) = \sum_{i=1}^n (x_i - \mu)^2 . p(x_i) $$
    
    $$ = E[(x- \mu)^2] $$

    $$ = \biggl[\sum_D x^2 .p(x)\biggl] - \mu^2 $$

    $$ = E(X^2) - [E(X)]^2 $$

    $$ = E(X^2) - \mu^2 $$

    For any linear function $h(X) = aX + b$,
    $$ V[h(X)] = \sigma_{h(X)}^2 = \sum_D\{h(X) - E[h(X)]\}^2 .p(x) $$

=== "Continuous RV"
    !!! warning ""
        $$ V(X) = \sigma_X^2 = \int_{-\infty}^{\infty}(x - \mu)^2 . f(x) \ dx $$
    
    $$ = E[(x- \mu)^2] $$

#### Standard Deviation
$$ \sigma_X = \sqrt{\sigma_X^2} $$

#### ==Rules of Variance & Standard Deviation==
$$ Var(aX + bY) = a^2Var(X) + b^2Var(Y) + 2ab Cov(X,Y) $$

$$ Var(aX - bY) = a^2Var(X) + b^2Var(Y) - 2ab Cov(X,Y) $$


!!! warning ""
    If $X$ and $Y$ are independent,
    $$ Var(X + Y)  = Var(X) + Var(Y) = Var(X - Y) $$
    $$ \sigma (X + Y) = \sqrt{Var(X) + Var(Y)} = \sqrt{{\sigma (X)}^2 + {\sigma (Y)}^2} = \sigma (X - Y) $$

Standard Deviation, $$ \sigma_{aX + b} = |a|. \sigma_x $$

For any linear function $h(X) = aX + b$,
$$ Variance, \ V(aX + b) = \sigma_{aX + b}^2 = a^2. \sigma_x^2 = a^2 . Var(X) $$

$E[(X - a)^2]$ is a minumum when $$ a = \mu = E(X) $$

Variance of any constant is zero and if a random variable has zero variance, then it is essentially constant.

### Covariance 
=== "Discrete RV"
    !!! warning ""
        $$ Cov(X, Y) = \sigma_{XY} = E[(X - \mu_X)(Y - \mu_Y)] = E(XY) - E(X)E(Y) $$
    $$ =\sum_x\sum_y(x - \mu_X)(y - \mu_Y)p(x,y) = \biggl(\sum_x\sum_y xyp(x,y)\biggl) - \mu_X\mu_Y $$

=== "Continuous RV"
    !!! warning ""
        $$ =\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}(x - \mu_X)(y - \mu_Y)f(x,y) \ dx \ dy =\biggl(\int_a^b\int_c^dxyf(x,y) \ dx \ dy \biggl) - \mu_X\mu_Y $$

#### ==Rules of Covariance==
$$ Cov(X, X) = E[(X - \mu_X)^2] = V(X) $$

$$ Cov(aX + b, cY + d) = acCov(X,Y) $$

$$ Cov(X, Y+Z) = Cov(X,Y) + Cov(X,Z) $$

### Correlation
#### ==Rules of Correlation==
- If $a$ and $c$ are either both positive or both negative,
$$ Corr(aX + b, cY + d) = Corr(X,Y) $$
- If $ac \lt 0$ ,
$$ Corr(aX + b, cY + d) = -Corr(X,Y) $$
- For any two rv’s X and Y, 
$$ -1 \leq  Corr(X, Y) \leq 1 $$

### Binomial RV
=== "Mean"
    $$ \mu_X = E(X) = np = n * (p * 1 + (1 - p) * 0) $$
    where $n$ is the number of trials and $p$ is the probability of success and $q$ is the probability of failure in a single trial.
=== "Variance"
    $$ \sigma^2_X = np (1 - p) = npq $$
    where $q=1-p$
=== "Standard Deviation"
    $$ \sigma_x = \sqrt{np (1 - p)} = \sqrt{npq} $$

#### Bernoulli RV
=== "Mean"
    $$ \mu_X = p = p * 1 + (1 - p) * 0 $$
=== "Variance"
    $$ \sigma^2_X = p (1 - p) = pq $$
    where $q=1-p$
=== "Standard Deviation"
    $$ \sigma_x = \sqrt{p (1 - p)} = \sqrt{pq} $$

### Geometric RV
=== "Mean"
    $$ \mu_X = E(X) = \frac{1}{p} $$
=== "Variance"
    $$ \sigma^2_X = \frac{1 - p}{p^2} $$
=== "Standard Deviation"
    $$ \sigma_x = \sqrt{\frac{1 - p}{p^2}} $$

## Distributions
### Normal Distribution
=== "Probability Density Function (PDF)"
    $$ f(x; \mu, \sigma) = \frac{1}{\sqrt{2 \pi \sigma^2}}e^{-(x-\mu)^2/(2 \sigma^2)} $$

    where $-\infty \lt x \lt \infty, -\infty \lt \mu \lt \infty, 0 \lt \sigma$

    For n independent RVs,

    $$ f(x_1,...,x_n;\mu,\sigma^2) = \frac{1}{\sqrt{2 \pi \sigma^2}}e^{-(x_1 -\mu)^2/(2 \sigma^2)} \cdot ... \cdot \frac{1}{\sqrt{2 \pi \sigma^2}}e^{-(x_n -\mu)^2/(2 \sigma^2)} $$ 
    
    $$ = \biggl(\frac{1}{2 \pi \sigma^2}\biggl)^{n/2}e^{-\sum (x_i-\mu)^2/(2 \sigma^2)} $$
    
=== "Cumulative Density Function (CDF)"
    $$ F(x) = P(X \leq x) = \frac{1}{\sigma \sqrt{2 \pi}} \int_{-\infty}^x e^{-(v-\mu)^2/2 \sigma^2} dv $$

    $$ P(a \leq X \leq b) = \int_a^b\frac{1}{\sqrt{2 \pi \sigma^2}}e^{-(x-\mu)^2/(2 \sigma^2)}dx $$

### Standard Normal Distribution (z-Distribution), $Z \sim N(\mu=0, \sigma = 1)$
=== "Probability Density Function (PDF)"

    $$ f(z; 0, 1) = \frac{1}{\sqrt{2 \pi}}e^{-z^2/2} $$
    where $-\infty \lt z \lt \infty$

=== "Cumulative Density Function (CDF)"
    The CDF is obtained as the area under $\phi$, to the left of $z$.

    $$ \phi(z) = P(Z \leq z) = \int_{-\infty}^z f(y;0,1)dy $$
    
    $$ =\frac{1}{\sqrt{2 \pi}} \int_{-\infty}^z e^{-u^2/2}du $$

    $$ =\frac{1}{2} + \frac{1}{\sqrt{2 \pi}} \int_0^z e^{-u^2/2}du $$
    where the area of the standard normal curve to the right of 0 (between $-\infty$ to 0) is 1/2.

    For any $c \gt 0$,
    $$ P(|Z| \gt c) = P(Z \gt c) + P(Z \lt -c) = 2P(Z \gt c) = 2[1 - \phi(c)] $$

### Binomial Distribution
=== "Probability Mass Function (PMF)"
    $$ b(x; n,p) = \begin{cases}
    \binom nxp^x(1-p)^{n-x}, & \ x=0,1,2,3,...,n \\
    0, & \ otherwise
    \end{cases} $$
=== "Cumulative Density Function (CDF)"
    $$ B(x; n,p) = P(X \leq x) = \sum_{y=0}^xb(y;n,p)  \ \  x=0,1,2,...,n $$

** Use cumulative binomial probability table to find out the PMF and CDF values

!!! warning ""
    Binomial distribution approaches normal distribution when
    $$ \lim_{n \to \infty} p \biggl(a \leq \frac{X - np}{\sqrt{npq}} \leq b \biggl) = \frac{1}{\sqrt{2 \pi}} \int_a^b e^{-u^2/2}du $$

    $$ P(X \leq x) = B(x; n,p) \approx (area \ under \ normal \ curve \ to \ the \ left \ of \ x + .5) $$

    $$ =\phi(\frac{x + .5 - np}{\sqrt{npq}}) $$
    ==provided $np \geq 10$ and $nq \geq 10$==

#### Bernoulli Distribution
=== "Probability Mass Function (PMF)"
    If $P(X=1)=\alpha$, then $P(X=0) = 1 - \alpha$. Hence
    $$ p(x; \alpha) = \begin{cases}
    1 - \alpha, & \ \text{if x = 0} \\
    \alpha, & \ \text{if x = 1} \\
    0, & \ \text{otherwise}
    \end{cases} $$
=== "Cumulative Density Function (CDF)"
    $$ F(x; \alpha) = \begin{cases}
    0, & \  x \lt 0 \\
    1 - \alpha, & \  0 \leq x \lt 1 \\
    1, & \ x \geq 1
    \end{cases} $$

### Geometric Distribution
=== "Probability Mass Function (PMF)"
    $$ p(x) = \begin{cases}
    (1 - p)^xp, & \ x = 0,1,2,3,... \\
    0, & \ \text{otherwise}
    \end{cases} $$
    $$ = \begin{cases}
    (1 - p)^{x-1}p, & \ x = 1,2,3,... \\
    0, & \ \text{otherwise}
    \end{cases} $$
    where $x$ is the number of failures before the first success
=== "Cumulative Density Function (CDF)"
    $$ F(x) = P(X \leq x) = \begin{cases}
    0, & \ x \lt 1 \\
    1 - (1 - p)^{[x]}, & \ x \geq 1 
    \end{cases} $$
    where $[x]$ is the largest integer $\leq x$

### Poisson Distribution
!!! warning ""
    $$ p(x; \mu) = P(X = x) = \frac{\mu^x e^{- \mu}}{x!} \ \ x=0,1,2... $$

From **Maclaurin series expansion** of $e^\mu$:
$$ e^\mu = 1 + \mu + \frac{\mu^2}{2!} + \frac{\mu^3}{3!} + ... = \sum_{x = 0}^{\infty} \frac{\mu^x}{x!} $$
$$ \implies \sum p(x; \mu) = \sum_{x = 0}^{\infty} \frac{e^{-\mu} \cdot \mu^x}{x!} = 1 $$

!!! warning ""
    Probability that $k$ events will be observed during any particular time interval of length $t$
    $$ P_k(t) = \frac{e^{-\alpha t} \cdot (\alpha t)^k}{k!} $$
    where $\mu = \alpha t$ and $\alpha$ is the rate of the event process, the expected number of events occuring in unit time. 
    Also see [Poisson Probability](../prob-cheatsheet/#poisson-probability)
    
$$ P(X_1 \leq t) = 1 - P(X_1 \gt t) = 1 - e^{-\alpha t} $$

Also, $$ P(X_1 \leq t) = \sum_{x=0}^t P(X = x) = \sum_{x=0}^t \frac{\mu^x e^{- \mu}}{x!} $$

And, $$ P(X_1 \geq (t + 1)) = 1 - P(X_1 \leq t) = 1 - (\sum_{x=0}^t P(X = x)) = 1 - (\sum_{x=0}^t \frac{\mu^x e^{- \mu}}{x!}) $$

=== "Cumulative Density Function (CDF)"
    $$ F_X(x) = \frac{\Gamma(x + 1, \mu)}{x!} $$

    where $\Gamma$ is the **==upper incomplete gamma function==**, a special function that is normally defined in terms of an integral

    $$ \Gamma(s,x) = \int_x^\infty t^{s - 1}e^{-t} dt $$
<BR>

=== "Mean"
    $$ E(X) = \mu $$
=== "Variance"
    $$ V(X) = \mu $$

!!! warning ""
    Poisson distribution approaches normal distribution when
    $$ \lim_{\mu \to \infty} p \biggl(a \leq \frac{X - \mu}{\sqrt{\mu}} \leq b \biggl) = \frac{1}{\sqrt{2 \pi}} \int_a^b e^{-u^2/2}du $$
    where $\frac{X - \mu}{\sqrt\mu}$ is the standardized random variable

### Students T-Distribution
#### Degrees of Freedom

$$df = n − 1$$

where $n$ is the sample size

Also see [CI for Difference of Means](#confidence-interval-for-difference-of-means) and [CI for Pooled Procedures](#confidence-interval-for-pooled-procedures) for T Distribution for degrees of freedom for two sample tests.

## Sampling
### Finite Correction Factor (FPC)
=== "Variance"
    $$ \frac{N - n}{N - 1} $$
=== "Standard Deviation"
    $$ \sqrt \frac{N - n}{N - 1} $$

### Sampling Distribution of the Sample Mean(SDSM)
=== "Mean"
    $$ \mu_{\overline X} = \mu_{\overline x} = \mu $$
=== "Variance"
    $$ \sigma_{\overline X}^2 = \sigma_{\overline x}^2 = \frac{\sigma^2}{n} \approx \frac{s^2}{n} $$
=== "Standard Deviation"
    $$ \sigma_{\overline X} = \sigma_{\overline x} = \frac{\sigma}{\sqrt n} \approx \frac{s}{\sqrt n} $$
    This is also called the ==**Standard Error (SE)**==
=== "Z-Score"
    $$ z = \frac{\overline x - \mu}{\frac {\sigma}{\sqrt n}} $$

### Sampling Distribution of the Sample Proportion(SDSP)
=== "Mean"
    $$ \mu_{\hat p} = p $$
=== "Variance"
    $$ \sigma_{\hat p}^2 = \frac{p (1 - p)}{n} $$
=== "Standard Deviation"
    $$ \sigma_{\hat p} = \sqrt  \frac{p (1 - p)}{n} $$
=== "Z-Score"
    $$ z_{\hat p} = \frac{\hat p - p}{\sigma_{\hat p}} $$

### Sample Distribution of the Difference of Means (SDDM)
=== "Mean"
    $$ \mu_{\overline x_1 - \overline x_2} = \mu_{\overline x_1} - \mu_{\overline x_2} $$
=== "Standard Deviation"
    $$ \sigma_{\overline x_1 - \overline x_2} = \sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}} $$

### Pooled Procedures
=== "Variance"
    $$ \sigma_p^2 = \frac{(n_1 - 1)\sigma_1^2 + (n_2 - 1)\sigma_2^2}{n_1 + n_2 - 2} $$
=== "Standard Deviation"
    $$ \sigma_{\overline x_1 - \overline x_2} = \sigma_p \sqrt{\frac{1}{n_1} + \frac{1}{n_2}} $$

    where
    $$ \sigma_p = \sqrt{\frac{(n_1 - 1)\sigma_1^2 + (n_2 - 1)\sigma_2^2}{n_1 + n_2 - 2}} $$

### Sample Distribution of the Difference of Proportions (SDDP)
=== "Mean"
    $$ \hat p_1 - \hat p_2 = \frac{x_1}{n_1} - \frac{x_2}{n_2} $$
=== "Standard Deviation"
    $$ \sigma_{\hat p_1 - \hat p_2} = \sqrt{\frac{\hat p_1 (1 - \hat p_1)}{n_1} + \frac{\hat p_2 (1 - \hat p_2)}{n_2}} $$

## Confidence Interval
<p id="cust-id-cs-alpha-val"></p>
!!! warning ""
    $$ \alpha = 1 - CL $$
    where CL is the Confidence Level

=== "Normal Distribution"
    !!! warning ""
        For a normal distribution with mean $\mu$ and standard deviation $\sigma$
        $$ CI = \overline x \pm z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} $$
        where $\overline x$ is the point estimate of mean $\mu$

    !!! warning ""
        A **100(1 - $\alpha$)% CI** for the $\mu$ of a normal distribution with standard deviation $\sigma$ is

        $$\overline x - z_{\alpha/2} \cdot \frac{\sigma}{\sqrt n} \lt \mu \lt \overline x + z_{\alpha/2} \cdot \frac{\sigma}{\sqrt n}$$

=== "Normal with [FPC](../stats-sampling/#finite-correction-factor-fpc)"
     
    $$ CI = \overline x \pm z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} \sqrt{\frac{N - n}{N - 1}} $$

=== "T Distribution"
    
    $$ CI = \overline x \pm t_{\alpha, n - 1} \cdot \frac{s}{\sqrt n} $$

Also see [Confidence Interval for One and Two Tailed Tests](#confidence-interval-for-one-and-two-tailed-tests)

==**Bound on the error of estimation, B** or **Margin of Error, ME**==
$$ ME = z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} $$

$$ \implies CI = \overline x \pm ME $$

Required sample size to estimate $\mu$ with a $100(1 - \alpha)$% confidence and a fixed ME
$$ n = \biggl(\frac {z_ {\alpha/2} \cdot \sigma}{ME}\biggl)^2 $$

### Confidence Interval for the Proportion
=== "Normal Distribution"
    $$ CI = \hat p \pm z_ {\alpha/2} \cdot \sqrt {\frac {\hat p (1 - \hat p)}{n}} $$

    where $\hat p$ is the percentage of the subjects that meet the criteria 
    $$ \hat p = \frac {number \ of \ subjects \ meeting \ the \ criteria}{n} $$

    See [SDSP Condition for Inferences](../stats-sampling/#sampling-distribution-of-the-sample-proportionsdsp)

=== "Normal with [FPC](../stats-sampling/#finite-correction-factor-fpc)"

    $$ CI = \hat p \pm z_ {\alpha/2} \cdot \sqrt {\frac {\hat p (1 - \hat p)}{n}} \sqrt{\frac{N - n}{N - 1}} $$

**Margin of Error**

$$ z_ {\alpha/2} \cdot \sqrt{\frac {\hat p (1 - \hat p)}{n}} $$

### Confidence Interval for Difference of Means
=== "Normal Distribution"
    $$ CI = (\overline x_1 - \overline x_2) \pm z_{\alpha/2}\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}} $$

=== "T Distribution"
    $$ CI = (\overline x_1 - \overline x_2) \pm t_{\alpha/2}\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}} $$

    with degree of freedom

    $$ df = \frac{\biggl(\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2} \biggl)^2}{\frac{1}{n_1 - 1}\biggl(\frac{s_1^2}{n_1}\biggl)^2 + \frac{1}{n_2 - 1}\biggl(\frac{s_2^2}{n_2}\biggl)^2} $$

    $$ = \frac{[(se_1)^2 + (se_2)^2]^2}{\frac{(se_1)^4}{m - 1} + \frac{(se_2)^4}{n - 1}} $$
    where $se_1 = \frac{s_1}{\sqrt n_1}, se_2 = \frac{s_2}{\sqrt n_2}$<BR>
    ==**Note: Round down when degree of freedom is not an integer, so that the estimate is more conservative**==

### Confidence Interval for Pooled Procedures
=== "T Distribution"
    $$ CI = (\overline x_1 - \overline x_2) \pm t_{\alpha/2} * s_p\sqrt{\frac{1}{n_1} + \frac{1}{n_2}} $$

    with degree of freedom
    $$ df = n_1 + n_2 - 2 $$

### Confidence Interval for Matched-Pair Test
=== "Normal Distribution"
    $$ CI = \overline d \pm z_{\alpha/2} * \frac{\sigma_d}{\sqrt n} $$
    where $\overline d$ is the mean difference for the matched pair.

=== "T Distribution"
    $$ CI = \overline d \pm t_{\alpha/2} * \frac{s_d}{\sqrt n} $$

    with degree of freedom
    $$ df = n - 1 $$

### Confidence Interval for Difference of Proportions
=== "Normal Distribution"
    $$ CI = (\hat p_1 - \hat p_2) \pm z_{\alpha/2}\sqrt{\frac{\hat p_1 (1 - \hat p_1)}{n_1} + \frac{\hat p_2 (1 - \hat p_2)}{n_2}} $$

## Hypothesis Testing
### Type 1 Error Rate
$$ \alpha=P(rejecting \ H_0|H_0) $$

$$ =P(p-value \leq \text{significance level} | H_0) $$

### Power
$$ 1 - \beta $$

### One and Two Tailed Tests
=== "Upper Tailed Test"

    $$ H_A: \mu \gt \mu_0 $$

    $$ H_0: \mu \leq \mu_0 $$ 


=== "Lower Tailed Test"

    $$ H_A: \mu \lt \mu_0 $$

    $$ H_0: \mu \geq \mu_0 $$ 

=== "Two Tailed Test"

    $$ H_A: \mu \neq \mu_0 $$ 

    $$ H_0: \mu = \mu_0 $$ 

#### Confidence Interval for One and Two Tailed Tests
=== "Upper Tailed Test"
    **Normal Distribution**
    $$ CI = \overline x + z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} $$

    **T Distribution**
    $$ CI = \overline x + t_{\alpha, n - 1} \cdot \frac{s}{\sqrt n} $$

=== "Lower Tailed Test"
    **Normal Distribution**
    $$ CI = \overline x - z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} $$

    **T Distribution**
    $$ CI = \overline x - t_{\alpha, n - 1} \cdot \frac{s}{\sqrt n} $$

=== "Two Tailed Test"
    **Normal Distribution**
    $$ CI = \overline x \pm z_ {\alpha/2} \cdot \frac{\sigma}{\sqrt n} $$

    **T Distribution**
    $$ CI = \overline x \pm t_{\alpha, n - 1} \cdot \frac{s}{\sqrt n} $$

### Test Statistic
=== "Normal Distribution"
    $$ z = \frac{\overline x - \mu_0}{\sigma/\sqrt n} $$
    where $\mu_0$ is the Null Hypothesis Mean

=== "T Distribution"
    $$ t = \frac{\overline x - \mu_0}{s/\sqrt {df}}  $$
    where $df$ is the [degrees of freedom](#degrees-of-freedom)

#### Test Statistic for the Proportion
$$ z = \frac{\hat p - p_0}{\sqrt{\frac{p_0 (1 - p_0)}{n}}} $$

#### Test Statistic for Difference of Means
=== "Normal Distribution"
    $$ z = \frac{(\overline x_1 - \overline x_2) - (\mu_1 - \mu_2)}{\sqrt {\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}} $$

=== "T Distribution"
    $$ t = \frac{(\overline x_1 - \overline x_2) - (\mu_1 - \mu_2)}{\sqrt {\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}} $$
    with degrees of freedom as shown in [CI for Difference of Means](#confidence-interval-for-difference-of-means)  

#### Test Statistic for Pooled Procedures
=== "Normal Distribution"
    $$ z = \frac{(\overline x_1 - \overline x_2) - (\mu_1 - \mu_2)}{s_p\sqrt {\frac{1}{n_1} + \frac{1}{n_2}}} $$

=== "T Distribution"
    $$ t = \frac{(\overline x_1 - \overline x_2) - (\mu_1 - \mu_2)}{s_p\sqrt {\frac{1}{n_1} + \frac{1}{n_2}}} $$
    with degrees of freedom as shown in [CI for Pooled Procedures](#confidence-interval-for-pooled-procedures)

#### Test Statistic for Matched-Pair Test
=== "Normal Distribution"
    $$ z = \frac{\overline d - \mu_d}{\sigma_d/\sqrt n} $$
    where $\mu_d$ is the Null Hypothesis Mean Difference

=== "T Distribution"
    $$ t = \frac{\overline d - \mu_d}{s_d/\sqrt n}  $$

#### Test Statistic for Difference of Proportions
=== "Normal Distribution"
    $$ z = \frac{(\hat p_1 - \hat p_2) - (p_1 - p_2)}{\sqrt {\hat p (1 - \hat p)(\frac{1}{n_1} + \frac{1}{n_2})}} $$

    with 
    $$ \hat p = \frac{\hat p_1 n_1 + \hat p_2 n_2}{n_1 + n_2} $$

    where $\hat p_1 n_1$ and $\hat p_2 n_2$ are the number of successes in each sample

### p-value
=== "Upper Tailed Test"

    The p-value is the area under the standard normal curve to the right of $z$ 
    $$ p = 1-\phi(z) $$


=== "Lower Tailed Test" 

    The p-value is the area under the standard normal curve to the left of $z$ 
    $$ p= \phi(z) $$

=== "Two Tailed Test"

    The p-value is sum of the area under the standard normal curve to the left and right of $z$
    $$ p = 2 * (1-\phi(z)) $$ 

## Simple Linear Regression Model

$$ y = \beta_0 + \beta_1 x + u $$

If all other factors (disturbance) are fixed, i.e. if $\Delta u=0$, then

$$ \Delta y = \beta_1 \Delta x $$

!!! warning ""
    **Simplified Form (Equation of Line)**

    $$ y = \beta_0 + \beta_1 x = a + bx $$

    Slope

    $$ \beta_1 = b = \frac{n \sum {xy} - \sum x \sum y}{n \sum x^2 - (\sum x)^2} $$

    where $n$ is the number of data points

    Y-Intercept

    $$ \beta_0 = a = \frac{\sum y - b \sum x}{n} $$

### Errors

$$ E(u) = 0 $$

$$ E(u|x)=E(u) \implies E(u|x) = 0 $$

### Residual

$$ \hat u = y_i - \hat y_i = y_i - \hat \beta_0 - \hat \beta_1x_i $$

where $\hat u$, $\hat y_i$,$\hat \beta_0$ and $\hat \beta_1$ are the estimated values. Here $\hat u$ is different from the error term $u$.


<p id="cust-id-cs-reg-res-prop"></p>
**Residual Properties**

$$ \sum_{i=1}^n \hat u_i = 0 $$

$$ \overline {\hat u} = 0 $$

$$ \sum_{i=1}^n x_i \hat u_i = 0 $$

$$ \overline y = \hat \beta_0 + \hat \beta_1 \overline x $$

### Measures of Variation

#### Sum of Squared Residuals
$$ \sum_{i=1}^n \hat u_i^2 = \sum_{i=1}^n (y_i - \hat y_i)^2= \sum_{i=1}^n (y_i - \hat \beta_0 - \hat \beta_1 x_i)^2 $$

#### Explained Sum of Squares
$$ SSE = \sum_{i=1}^n(\hat y_i - \overline y)^2 $$

#### Residual Sum of Squares
$$ SSR = \sum_{i=1}^n \hat u_i^2  = \sum_{i=1}^n (y_i - \hat y_i)^2 $$

#### Total Sum of Squares
$$ SST = \sum_{i=1}^n(y_i - \overline y)^2 $$

$$ SST = SSE + SSR $$

#### Coefficient of Determination
$$ R^2 = 1 - \frac{SSR}{SST} $$

#### Adjusted R-Squared
$$ Adj \ R^2 = 1 - (1 - R^2) * \frac{n -1}{n - k - 1} $$
where $n$ is the sample size and $k$ is the number of independent variables

#### Mean Square of Regression
$$ MSR = \frac{SSR}{degrees \ of \ freedom \ of \ SSR} $$

#### Mean Absolute Error
$$ MAE = \frac{\sum_{i=1}^n |y_i - \hat y_i|}{n} $$

#### Mean Square Error
$$ MSE = \frac{SSR}{n} $$

#### Root Mean Square Error
$$ RMSE = \sqrt {\frac{SSR}{n}} $$

## Multiple Linear Regression Model

$$ y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + ... + \beta_n x_n $$

### Tolerance
$$ T = 1 – R^2 $$
where $R$ is the [coefficient of determination](#coefficient-of-determination)

### Variance Inflation Factor
$$  VIF = \frac{1}{T} = \frac{1}{1 – R^2} $$

### Durbin Watson Statistic
$$ d = \frac{\sum_{t=2}^T (e_t - e_{t-1})^2}{\sum_{t=1}^T e_t^2} $$

### Homoscedasticity
$$ var(u|x_1,...,x_k) = \sigma^2$$

## Polynomial Regression Model

$$ y = \beta_0 + \beta_1 x_1 + \beta_2 x_1^2 + ... + \beta_n x_1^n $$

## Chi Square Tests
=== "Homogeneity and Association/Independence"
    **Expected Values**

    $$ Expected_i = \frac{Observed_{x_{itot}} * Observed_{y_{itot}}}{Observed_{tot}} $$

    where $Observed_{x_{itot}}$ and $Observed_{y_{itot}}$ are the total observed counts corresponding to the ith group of the categorical variables $x$ and $y$ respectively and $Observed_{tot}$ is the total count for all variables

    !!! warning ""
        $$ \chi^2 = \sum{\frac{(observed - expected)^2}{expected}} $$

    **Degrees of Freedom**
    $$ df = (number \ of \ rows - 1)(number \ of \ columns - 1) $$

=== "Goodness of Fit"
    **Expected Values**
    $$ Expected_i = \frac{Observed_{tot}}{n} $$
    where $Observed_{tot}$ is the total count for all variables

    **Degrees of Freedom**
    $$ df = n - 1 $$

## Support Vector Regression Model

$$ \frac{1}{2}||w||^2 + C \sum_{i=1}^m (\xi_i + \xi_i^*) $$

Minimize

$$ C \sum_{i=1}^m (\xi_i + \xi_i^*) $$

## Logistic Regression Model

$$ logit(p_i) = ln\biggl(\frac{p_i}{1 - p_i}\biggl) = \beta_0 + \beta_1x_{1,i}+\dots+\beta_Mx_{m,i} $$

where $p_i$ is the probability $\frac{p_i}{1 - p_i}$ is the odds of success and $ln \frac{p_i}{1 - p_i}$ is the log of the [odds](../prob-cheatsheet/#odds) of success

<p id="cust-id-cs-log-res-sig"></p>
**Sigmoid Function**

Solving the above for p, we get
$$ p = g(z) = \frac{e^z}{e^z + 1} = \frac{1}{1 + e^{-z}} $$ 
where $z = \beta_0 + \beta_1x_1+ \dots$

### Likelihood Function

**Intuition**
$$ likelihood = \hat y * y + (1 – \hat y) * (1 – y) $$

Also see `Mean` tab for [Binomial RV](#binomial-rv) and [Bernoulli RV](#bernoulli-rv)

Likelihood for samples labelled as `1`:
$$ \prod_{s \ in \ y_i = 1} p(x_i) $$

where $x_i$ represents the feature vector for the $i^{th}$ sample

Likelihood for samples labelled as `0`:
$$ \prod_{s \ in \ y_i = 0} (1 - p(x_i)) $$

<p id="cust-id-cs-likelihood"></p>
Overall Likelihood:
$$ L(\beta) = \prod_{s \ in \ y_i = 1} p(x_i) * \prod_{s \ in \ y_i = 0} (1 - p(x_i)) = \prod_s \biggl(p(x_i)^{y_i} * (1 - p(x_i))^{1 - y_i} \biggl) $$

Log Likelihood:
$$ l(\beta) = \sum_i^n {y_i log(p(x_i)) + (1 - y_i) log (1 - p(x_i))} $$

## KMeans Clustering
### WCSS
$$ WCSS = \sum_i^m distance(P_{i1}C_1)^2 + \sum_i^m distance(P_{i2}C_2)^2 + \dots + \sum_i^m distance(P_{in}C_n)^2 $$
where $P_{i1}$ is the $i^{th}$ point in cluster 1, $C_1$ is the center of cluster 1, $m$ is the number of points in a cluster, $n$ is the number of clusters and distance is the Euclidean distance between a point and the center of the cluster

## Gradient Descent
$$ f'(m, b) = \begin{bmatrix}
    \frac{df}{dm} \\
    \frac{df}{db}
\end{bmatrix} = 
\begin{bmatrix}
\frac{1}{N} \sum_i^N { -2x_i(y_i - (mx_i + b)) } \\
\frac{1}{N} \sum_i^N { -2(y_i - (mx_i + b)) }
\end{bmatrix} $$

### Cost Function
$$ f(m, b) = \frac{1}{N} \sum_i^N { (y_i - (mx_i + b))^2 }$$

## Time Series Concepts
### Exponential Smoothing
$$ F_{t + 1} = \alpha y_t + \alpha (1 - \alpha) y_{t -1} + \alpha (1 - \alpha)^2 y_{t -2} + \dots$$

where $0 \leq \alpha \leq 1$ is the smoothing constant

### Lag k Differencing
$$ Difference = Y_t - Y_{t-k} $$

### Log Transform
$$ \tilde y = log_b (y) \leftrightarrow y = b^{\tilde y}$$

When y = 0

$$ \tilde y = log_b (y + 1) \leftrightarrow y = b^{\tilde y} - 1$$

### Box Cox Transform
$$ y^{(\lambda)} = \begin{cases}
\frac{y^{\lambda} - 1}{\lambda} \ if \ \lambda \neq 0 \\
log(y) \ if \ \lambda = 0
\end{cases} $$

| $\lambda$ | Box Cox Formula        | Transform       |
|-----------|------------------------|-----------------|
| 0         | $log(y)$               | Log             |
| 1         | $y - 1$                | Shift by 1      |
| 2         | $\frac{1}{2}(y^2 - 1)$ | Square          |
| 0.5       | $2(\sqrt{y} - 1)$      | Square Root     |
| -1        | $-(y^{-1} - 1)$        | Inverse         |

where $-5 \lt \lambda \lt 5$ and $y \gt 0$
If $y \leq 0$, add a constant $c$ to make it positive, $y \to y + c$

#### Coefficient of Variation
$$ C_V = \frac{\sigma}{\mu} $$

where $\sigma$ is the standard deviation and $\mu$ is the mean, is a ==**scaled measure of the variability**== of a dataset

#### Guerrero Method
$$ C_V(\lambda) = \frac{\sigma [S_h(\lambda)]}{E[S_h(\lambda)]} $$

where 

$$ S_h (\lambda) = \frac{\sigma[y_t]}{E[y_t]^{1 - \lambda}} $$

and $\sigma[y_t]$ and $E[y_t]^{1 - \lambda}$ are the standard deviation and expectation respectively of the subseries $h$

### Moving Average
$$ Z_t = \frac{1}{m} \sum_{j=-k}^{j=k} y_{t + j} $$

where 
$$ m = 2k + 1 $$

is the order of the moving average and $k$ is the number of datapoints on either side of the point $t$ for which the moving average is being calculated

When $m$ is even,
$$ Z_t = \frac{1}{2m} \sum_{j=\pm {k_2}} y_{t + j} + \frac{1}{m} \sum_{j=-k_1}^{j=k_1} y_{t + j} $$

where 
$$ m = 2(k_1 + 1) = 2k_2 $$

### Piecewise Linear Regression
$$ y_t = \beta_0 + \beta_1 t_1 + \beta_2 t_2 + \dots + \beta_n t_n $$

where 
$$ t_n = \begin{cases}
0 \ if \ t \lt T_{n -1} \\
t - T_{n -1} \ if \ t \geq T_{n -1}
\end{cases} $$

and $\beta_1$ is the slope between 0 and $T_1$, $\beta_2$ is the slope between $T_1$ and $T_2 \dots \beta_n$ is the slope between $T_{n - 1}$ and $T_n$ 

and $T_1 \lt T_2 \lt \dots \lt T_n$

## Autoregressive Process (AR)

$$ y_t = c + \sum_{n=1}^p \phi_n y_{t - n} + \epsilon_t $$

where $t$ is the current period, $t - 1$ is the previous period, $y_t$ is the value for the current period, $y_{t - n}$ is the value for the nth previous period, $p$ is the number of previous periods to include in the series, $\phi_n$ is the coefficient for the previous period value, c is a constant term and $\epsilon_t$ is the residual error and should be just some unpredictable "white noise"

and $-1 \lt \phi \lt 1$

**Mean of AR1(p-1) process**
$$ \mu = \frac{c}{1 - \phi_1} $$

**Pct Change**
$$ 100 * \frac{x_t - x_{t - 1}}{x_{t - 1}} $$

## Moving Average Model (MA)

$$ y_t = c + \sum_{n=1}^q \theta_n  \epsilon_{t - n} + \epsilon_t $$

where $t$ is the current period, $t - 1$ is the previous period, $\epsilon_t$ is the residual for the current period, $\epsilon_{t - n}$ is the residual for the nth previous period, $q$ is the number of previous periods to include in the series, c is a constant term  and $\theta_n$ is the coefficient for the previous period value

and $-1 \lt \theta \lt 1$

## ARMA

$$ y_t = c + \sum_{n=1}^p \phi_n y_{t - n} + \sum_{n=1}^q \theta_n  \epsilon_{t - n} + \epsilon_t $$

where $-1 \lt \phi \lt 1$ and $-1 \lt \theta \lt 1$