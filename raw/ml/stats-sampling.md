## Central Limit Theorem (CLT)
Let $X_1, X_2,…, X_n$ be random samples from a distribution with mean $\mu$ and variance $\sigma^2$. Then even if the population distribution is non-normal (or if the shape of the population distribution is not known), as long as the sample is sufficiently large ($n\geq 30$), $\overline X$ has approximately a normal distribution and the distribution of the probabilities of the means of these samples ([SDSM](#sampling-distribution-of-the-sample-meansdsm)) also follows a normal distribution,

The larger the value of $n$, the better the approximation.

## Sampling Concepts
!!! tip
    When sampling with replacement, the number of possible samples when using a sample size of $n$ in a population $N$ is $N^n$

#### ==[Finite Correction Factor (FPC)](../stats-cheatsheet/#finite-correction-factor-fpc)==
Correction factor applied when sampling

- ==Without replacement==
- ==Infinite population==
- ==From more than 5% of a finite population ($\frac{n}{N} \leq 0.05$)==

#### [Sampling Distribution of the Sample Mean(SDSM)](../stats-cheatsheet/#sampling-distribution-of-the-sample-meansdsm)
The probability distribution of all possible sample means for a certain sample size $n$

!!! abstract "Conditions for Inference with SDSM"
    **Normal Condition**

    - Original population is normally distributed AND/OR
    - $n \geq 30$

    **Independent Condition**

    - Sample with replacement AND/OR
    - $n \leq \frac{N}{10}$ (Sample size less than 10% of total population - ==10% Rule==)

#### Standard Error(SE)
Gives an idea of how accurate the mean of a any given sample is likely to be as an estimate of the actual population mean. It is calculated as the Population Standard Deviation divided by the square root of the sample size (see Standard Deviation tab [here](../stats-cheatsheet/#sampling-distribution-of-the-sample-meansdsm)).

- Larger SE indicates that the sample means are more spread out, so it’s less likely that any given sample mean is an accurate representation of the true population mean
- Smaller SE indicates that the sample means are less spread out, so it’s more likely that any given sample mean is an accurate representation of the true population mean 

#### [Sampling Distribution of the Sample Proportion(SDSP)](../stats-cheatsheet/#sampling-distribution-of-the-sample-proportionsdsp)
The probability distribution of all possible sample proportions for a certain sample size $n$

**Sample Proportion** - The proportion of subjects in the sample that meet a cetain condition
$$ \hat p = \frac{x}{n} $$
where $x$ is the number meeting the condition and $n$ is the sample size

!!! abstract "Conditions for Inference with SDSP"
    **Normal Condition**

    - Original population is normally distributed AND/OR
    - $n \hat p \geq 10$ and $n(1 - \hat p) \geq 10 \implies np \geq 10$ and $nq \geq 10$

    **Independent Condition**

    - Sample with replacement AND/OR
    - $n \leq \frac{N}{10}$ (Sample size less than 10% of total population - ==10% Rule==)

### Working With Multiple Samples
#### [Sample Distribution of the Difference of Means (SDDM)](../stats-cheatsheet/#sample-distribution-of-the-difference-of-means-sddm)
The probability distribution of every possible difference of means for certain sample sizes $n_1$ and $n_2$ from populations 1 and 2 respectively

Also see: 

- [CI for Difference of Means](../stats-cheatsheet/#confidence-interval-for-difference-of-means)
- [Test Statistic for Difference of Means](../stats-cheatsheet/#test-statistic-for-difference-of-means)

#### [Pooled Procedures](../stats-cheatsheet/#pooled-procedures)
If the sample variances are equal or almost equal, then we assume that the population variances are approximately equal as well, and we calculate a ==**pooled variance**== by combining the two sample variances into one.

- Results in smaller $\beta$ for the same $\alpha$
- ==As a rule of thumb, we can use pooled variance when the two samples were taken from the same population, or when neither sample variance is more than twice the other.==

Also see: 

- [CI for Pooled Procedures](../stats-cheatsheet/#confidence-interval-for-pooled-procedures)
- [Test Statistic for Pooled Procedures](../stats-cheatsheet/#test-statistic-for-pooled-procedures)

#### Dependent Samples
Samples for which the observations from one sample are related to an the observations from the other sample

- ==Hypothesis test with dependent samples is referred to as **Matched-pair test**==

Also see: 

- [CI for Matched-Pair Test](../stats-cheatsheet/#confidence-interval-for-matched-pair-test)
- [Test Statistic for Matched-Pair Test](../stats-cheatsheet/#test-statistic-for-matched-pair-test)

#### [Sample Distribution of the Difference of Proportions (SDDP)](../stats-cheatsheet/#sample-distribution-of-the-difference-of-proportions-sddp)
The probability distribution of every possible difference of proportions for certain sample sizes $n_1$ and $n_2$ from populations 1 and 2 respectively

Also see: 

- [CI for Difference of Proportions](../stats-cheatsheet/#confidence-interval-for-difference-of-proportions)
- [Test Statistic for Difference of Proportions](../stats-cheatsheet/#test-statistic-for-difference-of-proportions)