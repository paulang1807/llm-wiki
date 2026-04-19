## Apriori

- Can be used for predicting associations between transactions
- Intution: Using prior knowledge of People who bought or did something to predict that they will also buy or do something else 

!!! abstract "Terminology"
    - **Support** 
    $$ Support = \frac{People \ who \ bought \ object1 \ or \ did \ action1}{Total \ Population \ buying \ or \ doing\ something} $$
    - **Confidence**
    $$ Confidence = \frac{Of \ the \ people \ who \ bought \ object2 \ or \ did \ action2 \ how \ many \ also \ bought \ object1 \ or \ did \ action1}{People \ who \ bought \ object2 \ or \ did \ action2} $$
    - **Lift**
    $$ Lift = \frac{Confidence}{Support} $$

- Steps
    - Set minimum support and confidence
    - Take all subsets of population having higher support than minimum
    - Take all rules of these subsets having higher confidence than minimum
    - Sort the rules by decreasing lift - select the rule with the highest lift
- It is a slow performing algorithm
    - Follows a "Breadth-First" Search

## Eclat

- Equivalence Class Clustering and Bottom-Up Lattice Traversal 
- Intution: If two or more items appear in a set for a given number of transactions, any new transaction containing one of the items in the set will probably have one of the other items as well
- Similar to apriori but only takes into account support, and not confidence and lift
- Steps
    - Set minimum support
    - Take all subsets of population having higher support than minimum
    - Sort the subsets by decreasing support 
- More efficient and scalable than Apriori
    - Follows a "Depth-First" Search