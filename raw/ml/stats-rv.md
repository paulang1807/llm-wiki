## Random Variables
**[Discrete Random Variable](../stats-cheatsheet/#discrete-random-variables):** A variable that can only take discrete values

**[Continuous Random Variables](../stats-cheatsheet/#continuous-random-variables):** A variable that can table on any value in a certain interval.

**[Expected Value](../stats-cheatsheet/#expected-or-mean-value):** The mean of a Random Variable.

### [Binomial Random Variables](../stats-cheatsheet/#binomial-rv)
A variable that can take on exactly two values, like a coin flip. 

!!! info
    In order for a variable X to be a binomial random variable,

    - each trial must be independent,
    - each trial can have only two outcomes - a “success” or “failure,”
    - there are a fixed number of trials, and
    - the probability of success on each trial is constant.

These follow the [Binomial Distribution](../stats-distributions/#binomial-distribution-x-sim-binnp).
Also see [Binomial Probability](../prob-cheatsheet/#binomial-probability)

#### [Bernoulli Random Variables](../stats-cheatsheet/#bernoulli-rv)
A ==special category of Binomial RV with exactly one trial with possible outcomes {0, 1}== where 0 signifies failure and 1 signifies success.

The PMF distrbution for a Bernoulli RV will be the distribution for $P(X=0)$ and $P(X=1)$.

### [Geometric Random Variables](../stats-cheatsheet/#geometric-rv)
Unlike the Binomial RV where we decide the number of trials ahead of time, ==in case of Geometric RV, we run an infinite number of trials until we get a success==.
The probablity of success on the nth attempt is given by the **[Geometric Probability](../prob-cheatsheet/#geometric-probability)**

The other three conditions for the Binomial RV are applicable to Geometric RV as well.

These follow the [Geometric Distribution](../stats-distributions/#geometric-distribution).