## Model Types
### [Apriori](../stats-arl/#apriori)

!!! abstract "Sample Code"
    [Apriori](https://github.com/ymoch/apyori/tree/master)

    ```python
    # Read Data
    dataset = pd.read_csv('data.csv', header = None)

    # Get list of transactions from dataset as apriori expects the data as a list
    # Each element in the list of lists should be a string
    transactions = []
    for i in range(0, 7501):
        transactions.append([str(dataset.values[i,j]) for j in range(0, 20)])

    # Train model
    from apyori import apriori
    rules = apriori(transactions = transactions, min_support = 0.003, min_confidence = 0.2, min_lift = 3, min_length = 2, max_length = 2)
    results = list(rules)
    ```