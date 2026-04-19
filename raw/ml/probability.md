## Probability Basics
- Probability of an event that cannot happen or an impossible event is **0**
- Probability of a event that is certain to happen is **1**
- All other probabilities are between 0 and 1
- ==All **complementary events** are mutually exclusive but the opposite is not true==
- The word **or** is a key word for **addition** and the word **and** is a key word for **multiplication**

!!! success "Expression"
    P(at least 1 success) = 1 − P(all failures)
    
    P(at least 1 failure) = 1 − P(all successes)


### [Partition of State Space](../prob-cheatsheet/#partition-of-state-space-omega) $\Omega$
Is a collection of events $A_1,A_2,\cdots, A_N$ with 3 properties

1. $A_j \subset \Omega$ for all $j \in \{1,2,3,\cdots, N\}$

2. $A_i \cap A_j = \emptyset$ whenever $i \neq j$

3. $A_1 \cup A_2 \cup \cdots \cup A_N = \Omega$

In other words, each event $A_j$ is made up of outcomes in $\Omega$, No two $A_j$'s overlap/share the same outcome, together all $A_j$'s combine to equal $\Omega$  <BR>
    
Partitions allow us to take complex events which may be difficult to address directly and decompose it into simpler events which are easier to deal with.

### [Union and Intersection](../prob-cheatsheet/#union-and-intersection)
**Intersection:** The probability that ==Events A and B both occur== is the probability of the intersection of A and B. 

- The probability of the intersection of Events A and B is denoted by ==$P(A \cap B)$==.  
 
**Union:** The probability that ==Events A or B occur== is the probability of the union of A and B. 

- The probability of the union of Events A and B is denoted by ==$P(A \cup B)$==.

**Mutually Exclusive Events:** If there is ==no overlap between A and B==, they are called mutually exclusive.

### [Independent and Dependent Events](../prob-cheatsheet/#independent-and-dependent-events)
**Independent events:** Events that don’t affect one another, like two separate coin flips

**Dependent events:** Events that affect one another, like pulling two cards from a deck without replacing the first card before pulling the second

- The total occurrence for the second event will be less than the first event

#### Conditional Probability
The probability that Event A occurs, given that Event B has occurred, is referred to as ==**conditional probability**==. The conditional probability of Event A, given Event B, is denoted by ==$P(A|B)$==.

#### [Bayes' Theorem](../prob-cheatsheet/#bayes-theorem)
Used to calculate the probability of an event, given prior knowledge of related events that occurred earlier. 

!!! info
    In order to be able to use Bayes' theorem, the following should be true:

    - The sample space is partitioned into a set of mutually exclusive events { $A_1$, $A_2$, . . . , $A_n$ }.

    - Within the sample space, there exists an event B, for which P(B) > 0.

#### [Bayes Factor](../prob-cheatsheet/#bayes-factor)
It is the ratio of the likelihoods

!!! success "Expression"
    Posterior Odds = Bayes Factor * Prior Odds

* If BF  > 1  then  the  posterior  odds  are  greater  than  the  prior  odds.   So  the  data provides evidence for the hypothesis.
*  If BF < 1 then the posterior odds are less than the prior odds.  So the data provides evidence against the hypothesis.

### [Beta Distribution](../prob-cheatsheet/#beta-distribution)
It is a probability distribution on probabilities

- Gives the distribution of the probability of success given the number of past successes and failures
- Since Beta distribution models a probability, its domain is bounded between 0 and 1
- Left skewed for better success probabilities
- Right skewed for weaker success probabilities