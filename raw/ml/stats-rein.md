**Reinforcement Learning is used to solve interacting problems where the data observed up to time t is considered to decide which action to take at time t + 1**

- Used for Artificial Intelligence when training machines to perform various tasks
    - Machines learn through trial and error
        - Desired outcomes provide the AI with reward
        - Undesired with punishment

## The Multi Armed Bandit Problem

- There are $d$ **options** to achieve a goal
- Each time a mean is applied constitutes a **round**
- At each round $n$, one of the possible $d$ options are applied
- For each round $n$, 
    - if the application of the mean $i$ results in the goal being achieved, a reward (1) is given 
    - if the application of the mean $i$ does not result in the goal being achieved, no reward (0) is given 
- The objective of the algorithm is to maximize the total rewards over many rounds
- The Dilemma: **Exploration vs Exploitation**
    - If we continue to explore we may find a better option than the one selected
        - However we may have to deal with more sub-optimal options in the process while exploring for a longer perid
    - If we exploit the best option selected thus far, there is a chance that we are missing out on finding the optimal option

## Upper Confidence Bound

- Intuition: 
    - With $d$ options available, it is uncertain as to which one will lead to success
    - Try to predict the options that will lead to the goal being achieved in most cases
- It is a deterministic algorithm

!!! abstract "UCB Algorithm Steps"
    - At the end of each round, the following numbers are considered for each of the options
        - the number of times an option $i$ was selected ($N_i(n)$)
        - the sum of the rewards for each option, i.e. the number of times the option selection resulted in a reward ($R_i(n)$)
    - The above numbers are usd to calculate
        - the average reward value (observed average) for each option upto that round
        $$ \overline r_i(n) = \frac{R_i(n)}{N_i(n)} $$
            - As per the law of large numbers, it will converge to the expected value in the long run
        - The confidence interval $[\overline r_i(n) - \Delta_i(n), \overline r_i(n) + \Delta_i(n)]$ at round $n$ where
        $$ \Delta_i(n) = \sqrt {1.5 * \frac{log (n)}{N_i(n)}} $$
    - The algorithm selects the option with the highest upper bound ($\overline r_i(n) + \Delta_i(n)$ ) for the confidence interval

## Thompson Sampling Algorithm

- It is a probabilistic algorithm
- **Has more allowance for exploring less/unexplored options while exploiting the proven options**
- Uses the concept of ==**[Beta Distribution](../probability/#beta-distribution)**==
- Intuition
    - Start with a beta distributions of 0 wins and 0 losses for each option
    - In the first round, try each option and update the beta distribution based on the result - win or loss
    - In the subsequent rounds, use the option with the highest beta distribution and update the distrbution based on the result


!!! abstract "Thompson Sampling Algorithm Steps"
    - At the end of each round, the following numbers are considered for each of the options
        - the number of times selection of the option $i$ resulted in a reward ($N_i^1(n)$)
        - the number of times selection of the option $i$ did not result in a reward ($N_i^0(n)$)
    - For each option, we take a random draw from the beta distribution
        $$ \theta_i(n) = \beta(N_i^1(n) + 1, N_i^0(n) + 1) $$
    - The algorithm selects the option with the highest $\theta_i(n)$ 