## Probability Basics
- Probability of an event occuring,
$$ p( E ) = \frac{number \ of \ ways \ in \ which \ ( E ) \ can \ occur}{total \ number \ of \ occurrences  (sample \ space, \Omega)} $$

- For any event E, 
    - $$ P(E) \geq \emptyset $$
    - $$ P(\Omega) = 1 $$
    - $$ P(E_1 \cup E_2 \cup ...) = \sum_{i = 1}^{\infty}P(E_i) $$
    - $$P(E) = 1 - P(E')$$

- Total number of outcomes = $x^y$ where $x$ is number of possible outcomes and $y$ is the number of tries

- Probability of an event not occuring,
$$ p(not \ E) = q(E) = 1 - p( E) $$

- If F is a subset of E, then 
$$ p(F) <= p( E ) $$

#### Partition of State Space $\Omega$
- If $B\subset \Omega$ and $A_1,A_2,\cdots, A_N$ is a partition of $\Omega$ then, 
$$ B = (A_1\cap B)\cup(A_2 \cap B) \cup \cdots \cup (A_N \cap B) $$

- If $A_i\cap A_j= \emptyset$ then 
$$B\cap(A_i\cap A_j) = (B\cap A_i)\cap(B\cap A_j) = \emptyset $$ 

- Combining all these gives
$$  P(B) = P\big[ (A_1\cap B)\cup(A_2 \cap B) \cup \cdots \cup (A_N \cap B) \big] = \sum_{i=1}^N P(A_i \cap B) $$

### Chain Rule
$$ P(X_1, X_2, ..., X_n) = P(X_1 | X_2,...,X_n)P(X_2,...,X_n) $$

$$ P(A,B,C) = P(A|B,C)P(B,C) $$

$$ = P(A|B,C)P(B|C)P(C) = P(B|A,C)P(C|A)P(A) $$

### Odds
If probability $P(E) = p$, then odds
$$ O(E) = \frac{p}{1 - p} = \frac{p}{p'} $$
<!-- $$ O(E) = q = \frac{p}{1 - p} = \frac{p}{p'} $$
$$ p = \frac{q}{1 + q} $$

* $0 \leq p \leq 1; \ 0 \leq q \leq \infty$
* $P(E^C) = 1 - P(E); \ O(E^C) = 1/O(E)$ -->

### Union and Intersection
- **A and B** ($P(A \cap B)$) is the set of outcomes in both A and B, which implies 
$$ P(A) >= P(A \cap B) $$ and  
$$ P(B) >= P(A \cap B) $$
- **A or B** ($P(A \cup B)$) is the set of outcomes in A or B, which implies 
$$ P(A) <= P(A \cup B) $$ and 
$$ P(B) <= P(A \cup B) $$
- If Events A and B are mutually exclusive, 
$$ P(A \cap B) = 0 $$
- If A and B are complimentary events,
$$ P(A ∩ B) = 0 $$ and  
$$ P(A ∪ B) = 1 $$
- Addition Rule

    !!! warning ""
        $$ P(A \ or \ B) = P(A) + P(B) − P(A \ and \ B) $$

        $$ P(A \cup B) = P(A) + P(B) − P(A \cap B) $$

    - For mutually exclusive events
    $$ P(A \cup B) = P(A) + P(B) $$
    - For any three events
    $$ P(X \cup Y \cup Z) =P(X) + P(Y) + P(Z) - P(X \cap Y) - P(Y \cap Z) - P(X \cap Z) + P(X \cap Y \cap Z) $$

### Independent and Dependent Events
- Multiplication Rule
    - For independent events,
    $$ P(X|Y) = P(X),  P(Y|X) = P(Y) $$

    !!! warning ""
        $$ P(A \ and \ B) = P(A \cap B) = P(A) P(B) $$

    $$ P(A \cup B) = P(A) + P(B) − P(A) P(B) $$

    $$ P(X, Y|Z) = P(X|Z)P(Y|Z) $$

    - For more than two independent events

    $$ P(A_1 \cap A_2 \cap...\cap A_n) = P(A_1) \cdot p(A_2) \cdot ... \cdot P(A_n) $$

    - For dependent events,
    !!! warning ""
        $$ P(A \ and \ B) = P(A \cap B) = P(A) P(B|A) $$

        $$ P(A \cup B) = P(A) + P(B) − P(A) P(B|A) $$

    - For any three dependent events
    $$ P(X \cap Y \cap Z) = P(Y)P(X|Y)P(Z|X \cap Y) $$

### Law of Total Probability
!!! warning ""
    $$ P(Y) = P(Y \cap X) + P(Y \cap X') $$

    $$ P(Y) = P(Y|X)P(X) + P(Y|!X)P(!X) $$

If $X_1, X_2,...,X_n$ are mutually exclusive and exhaustive, then
$$ P(Y) = P(Y|X_1)P(X_1) + P(Y|X_2)P(X_2) +...+ P(Y|X_n)P(X_n) $$
$$ =\sum_{i = 1}^nP(Y|X_i)P(X_i) $$

For a continuous parameter $\theta$ in the range $[a,b]$ and discrete random data x,
$$ p(x) = \int_a^b p(x|\theta)f(\theta)d\theta $$

### Bayes' Theorem
!!! warning ""
    $$ P(A|B)  = \frac{p(A \cap B)}{P(B)}  = \frac{p(B|A) P(A)}{P(B)} = \frac{P(B|A)P(A)}{P(B|A)P(A) + P(B|!A)P(!A)}$$

- For any three events
$$ P(C|A \cap B) = \frac{P(A \cap B \cap C)}{P(A \cap B)} $$

- **Bayesian Updating**

    Posterior Probability = $\frac{\text{Likelihood} \times \text{Prior}}{\text{Sum of products of Likelihood and Prior (also known as Normalizer)}}$ <BR>
    where Likelihood is P(Data|Hypothesis), i.e.P(B|A) and Posterior = P(Hypothesis|Data), i.e. P(A|B)

### Bayes Factor
$$ \frac{P(D|H)}{P(D|H')} $$

where D is the Data and H is the hypothesis.

### Beta Distribution
Probability Density Function (PDF) of the Beta Distribution is given by
$$ f(x;\alpha,\beta) = x^\alpha \cdot (1 - x)^\beta \cdot \frac{1}{B(\alpha + 1, \beta + 1)} $$
where $x$ is the probability of success and $\alpha$ and $\beta$ are the prior number of success and failures respectively

## Probability Distributions for Random Variables
### Binomial Probability
!!! warning ""
    $$ P(n,x)= \binom nx p^xq^{n-x} = \binom nx p^x(1-p)^{n-x} $$
    where $x$ is the exact number of times we want success, $n$ is the number of independent trials and $\binom nx$ is the combination ${}^{n}C_{x}$ 

If $X$ and $Y$ are independent random variables and $X \sim Bin(n,p)$ and $Y \sim Bin(m,p)$, then $$ X + Y \sim Bin(n + m , p) $$

### Geometric Probability
!!! warning ""
    $$ P(S = n) = p(1 - p)^{n - 1} $$
    where $n$ is the number of attempts required to get a success and $p$ is the probability of success.

The probability of success in **less than** $n$ attempts is given by
$$ P(S < n) = \sum_{i=1}^{n-1} P(S = i) $$

The probability of success in **at most** $n$ attempts is given by
$$ P(S \leq n) = P(S < n + 1) = \sum_{i=1}^{n} P(S = i) $$

The probability of success in **more than** $n$ attempts is given by
$$ P(S > n) = 1 - P(S \leq n) $$

The probability of success in **at least** $n$ attempts is given by
$$ P(S \geq n) = 1 - P(S \leq n - 1) $$


### Poisson Probability
!!! warning ""
    $$ P(x) = \frac{\lambda^x \cdot e^{-\lambda}}{x!} $$

where $x$ is the number of events observed during any particular time interval of length $t$, $\lambda = \alpha t$ and $\alpha$ is the rate of the event process, the expected number of events occuring in unit time

If $n \to \infty$ and $p \to 0$ in such a way that $np$ approaches a value $\lambda > 0$, i.e. in any binomial experiment in which n is large and p is small, $b(x;n,p) \approx p(x; \lambda)$. ==This can be safely applied when $n \gt 50, np \lt 5, \lambda = np$==. 

So we can express the ==**Poisson Probability of a Binomial Random Variable**== as 
$$ P(x) = \frac{{(np)}^x \cdot e^{-np}}{x!} $$
