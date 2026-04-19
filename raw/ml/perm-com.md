## Permutation
- Number of ways in which we can arrange a set of things and ==**Order is important**==

$$ P(n,r) = {}^nP_r = {}_nP_r = \frac{n!}{(n - r)!} $$
where $n$ is the number of objects to choose from and $r$ is the number of objects actually selected to be arranged

## Combination
- Number of ways in which we can arrange a set of things but ==**Order is NOT important**==

$$ C(n,r) = {}^nC_r = {}_nC_r = \binom nr = \frac{n!}{r!(n - r)!} $$

## Binomial Expansion
$$(q + p)^n = q^n + \binom n1 q^{n -1}p + \binom n2 q^{n - 2}p^2 + ... + p^n = \sum_{x=0}^n \binom nx p^xq^{n-x} $$
