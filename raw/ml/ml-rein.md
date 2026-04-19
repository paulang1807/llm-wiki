## Model Types
### [Upper Confidence Bound](../stats-rein/#upper-confidence-bound)

!!! abstract "Sample Code"

    ```python
    import math

    N = 5000   # Number of rounds for which to run the test (subset of rows in the dataset)
    d = 10      # Total number of options (columns in the dataset)
    ads_selected = []
    numbers_of_selections = [0] * d   # List of 10 0s, N_i(n)
    sums_of_rewards = [0] * d         # List of 10 0s, R_i(n)

    for n in range(0, N):
        ad = 0
        max_upper_bound = 0
        average_reward = 0
        
        # The first round (n=0) is a trial round where each of the 10 ads are selected once
        for i in range(0, d):

            # For the first round, ensure each ad is selected once
            if (numbers_of_selections[i] == 0):
                numbers_of_selections[i] += 1   # Increment the index of the selection by 1
                sums_of_rewards[i] = dataset.values[n, i]  # Check whether the selected ad has a reward in the actual dataset
                
            average_reward = sums_of_rewards[i] / numbers_of_selections[i]
            delta_i = math.sqrt(1.5 * math.log(n + 1) / numbers_of_selections[i])
            upper_bound = average_reward + delta_i

            # Select the ad with the max upper bound
            if (upper_bound > max_upper_bound):
                max_upper_bound = upper_bound
                ad = i   # Set the selected ad as the one with the maximum upper bound
            
        ads_selected.append(ad)  # Append the selected ad to the list of selected ads
        
        # For each subequent round after the first round
        if (n > 0):
            numbers_of_selections[ad] += 1   # Increment the index of the selected ad by 1
            reward = dataset.values[n, ad]   # Check whether the selected ad has a reward in the actual dataset
            sums_of_rewards[ad] = sums_of_rewards[ad] + reward

    # Visualize
    plt.hist(ads_selected)
    plt.show()
    ```

### [Thompson Sampling Algorithm](../stats-rein/#thompson-sampling-algorithm)

!!! abstract "Sample Code"

    ```python
    import random

    N = 5000   # Number of rounds for which to run the test (subset of rows in the dataset)
    d = 10      # Total number of options (columns in the dataset)
    ads_selected = []
    numbers_of_rewards_1 = [0] * d  # the number of times selection of the option i resulted in a reward ($N_i^1(n)$)
    numbers_of_rewards_0 = [0] * d  # the number of times selection of the option i did not result in a reward ($N_i^0(n)$)

    for n in range(0, N):
        ad = 0
        max_theta = 0
        for i in range(0, d):
            # random.betavariate returns a random point from the beta distribution based on the current wins and losses 
            random_beta = random.betavariate(numbers_of_rewards_1[i] + 1, numbers_of_rewards_0[i] + 1)

            if (random_beta > max_theta):
                max_theta = random_beta
                ad = i
        ads_selected.append(ad)
        reward = dataset.values[n, ad]

        if reward == 1:
            numbers_of_rewards_1[ad] = numbers_of_rewards_1[ad] + 1
        else:
            numbers_of_rewards_0[ad] = numbers_of_rewards_0[ad] + 1

    # Visualize
    plt.hist(ads_selected)
    plt.show()
    ```