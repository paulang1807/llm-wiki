## Concepts
!!! info "Hypothesis Testing Process"
    1. State the null and alternative hypotheses.
    2. Determine the level of significance, $\alpha$.
    3. Set up the decision rule (type of test and test statistic, $z$ or $t$, to be used)
    4. Calculate the test statistic.
    5. Find critical value(s) and determine the regions of acceptance and rejection.
    6. State the conclusion.

**Alternative hypothesis**: The abnormality we’re looking for in the data; it’s the significance we’re hoping to find

**Null hypothesis**: The opposite claim of the alternative hypothesis

!!! danger "Remember"
    The objective of Hypothesis Testing is to find enough evidence to reject the Null Hypothesis $H_0$. 

    - If $H_0$ can be confidently rejected, then the Alternative Hypothesis $H_a$ is true. 
    - If $H_0$ cannot be confidently rejected, then $H_a$ may or may not be true. 

## Type I and Type II errors
**<b id="cust-id-hyptst-typ1">[Type I error](../stats-cheatsheet/#type-1-error-rate)</b>**: 

- When we mistakenly REJECT a null hypothesis that’s actually true. 
    - The probability of making a Type I error is given by [Alpha $\alpha$](../stats-distributions/#cust-id-dst-alpha-val)
- In Machine Learning, this happens when the model incorrectly predicts a positive result (1) although the actual value is negative (0)
    - This is also referred to as ==**False Positives**==

**Type II error**: 

- When we mistakenly DO NOT REJECT a null hypothesis that’s actually false. 
    - The probability of making a Type II error is given by Beta $\beta$.
- In Machine Learning, this happens when the model incorrectly predicts a negative result (0) although the actual value is positive (1)
    - This is also referred to as ==**False Negatives**==

**[Power](../stats-cheatsheet/#power)**: The probability that we’ll reject the null hypothesis when it’s false. 

- ==We want our test to have a high power==

|             | $H_0$ is True                          | $H_0$ is False                            |
| :---------- | :-----------------------------------: |:-----------------------------------: |
| Reject $H_0$ | Type I Error<BR> P(Type I Error) = $\alpha$  | CORRECT <BR> **Power**  |
| Do Not Reject $H_0$ | CORRECT | Type II Error<BR> P(Type II Error) = $\beta$ |

## [One and Two Tailed Tests](../stats-cheatsheet/#one-and-two-tailed-tests)

**One Tailed Test** (One-Sided or Direction Test)

- ==**Upper-tailed test, right-tailed test**==: The alternative hypothesis states that one value is greater than another, while the null hypothesis states that one value is less than or equal to the other
    - ==**$z$ is positive**==
- ==**Lower-tailed test, left-tailed test**==: The alternative hypothesis states that one value is less than another, while the null hypothesis states that one value is greater than or equal to the other
    - ==**$z$ is negative**==
- Has a larger rejection region, as the entire rejection region is consolidated into one tail
- ==Used when we are confident about directionality and it does not make sense to run the test in both directions==
- ==enable more Type I errors (false positives) and also cognitive bias errors==

**Two Tailed Test** (Two-Sided or Non-Directional Test) - The alternative hypothesis states that one value is unequal to another, while the null hypothesis states that one value is equal to the other

- We do not predict any direction between the variables
    - Not trying to predict whether one value is greater or less than the other
- ==There are two region of rejections - one in each tail==
- Always more conservative than one tailed tests
- ==Used when we are not confident about the directionality==

### [Test Statistic](../stats-cheatsheet/#test-statistic)
$$ Test \ Statistic = \frac{Observed - Expected}{Standard \ Error} $$

## p-value (Observed Level of Significance)
The smallest level of significance at which we can reject the null hypothesis, assuming the null hypothesis is true. 

- ==It is the probability for the total area of the region of rejection==
- Because a p-value is a probability, its value is always between zero and one 

!!! danger "Remember"
    **The smaller the p-value, the more significant the result**

## Rejecting Null Hypothesis
!!! tip "Based on p-value"
    - If $p \leq \alpha$, reject the null hypothesis
    - If $p \gt \alpha$, do not reject the null hypothesis

<p id="cust-id-hyptst-null-reject-z"></p>
!!! tip "Based on  critical value"
    - Lower Tailed Test: Reject $H_0$ when $z \leq - z_\alpha$
    - Upper Tailed Test: Reject $H_0$ when $z \geq z_\alpha$
    - Two Tailed Test: Reject $H_0$ when $z \leq - z_{\alpha/2}$ or $z \geq z_{\alpha/2}$

Let $(\hat \theta_L, \hat \theta_U)$ be a confidence interval for $\theta$ with confidence level $100(1 —\alpha)$%. Then a test of $H_0: \theta = \theta_0$ versus $H_A: \theta \neq \theta_0$ with significance level $\alpha$ ==rejects the null hypothesis if the null value $\theta_0$ is not included in the $CI$ and does not reject $H_0$ if the null value does lie in the $CI$==.