## Artificial Neural Networks (ANN)
!!! abstract "Terminology"
    - **Input Layer**: The first layer in the network
        - Each point in the input layer is an independent variable
        - Each independent variable is for a single observation
            - Need to be normalized or standardized.
    - **Neuron**:  Basic building block
        - Receives signals (**synapses**) from **input or hidden layers** and transmit an **output value**
    - **Hidden Layer**: Intermediate layer(s) between input and output layer
        - Can be one or more
        - Don't need to be fully connected
    - **Output Value**: Can be Continuous, Binary or Categorical 
        - If categorical, there may be multiple output variables each representing a categorical value
    - **Synapses**: Signals passed from one neuron to another
        - Assigned weights used to determine which signals get passed and which don't 
    - **Epoch**: One round of training the neural network with all the rows of the dataset

### ANN Basics
- All weights are randomly initialized to small numbers close to 0 (but not 0)
- Within each neuron, the weights of the synapses from the previous layer get summed
- An **[activation function](../ml-cheatsheet/#activation-functions)** is applied to the weighted sum of the inputs ($x=\sum_i^n w_i x_i$)

    - Helps determine if the signal needs to be passed on the signal or not

    !!! tip "Activation Functions"
        - It is common to use the ==**rectifier function (relu)**== in the hidden layers 
        - For binary classification, the ==**sigmoid function**== is used in the output layer
            - The sigmoid activation returns the prediction as well as the probabilities
        - For non-binary classifications, the ==**softmax function**== is used in the output layer

### Perceptron
- It is a single layer feed forward network
- Tries to minimize the error (difference between the actual value $y$ and output value $\hat y$) calculated by the [cost function](../ml-cheatsheet/#cost-function)

    - Feeds the error back to the neural network and adjusts the weights after each **epoch**
        - All the weights are adjusted at the same time
    - The input values along with the adjusted weights are fed back to the neural network
    - The feedback and adjustment loop continues till the error is minimized (see [Gradient Descent](#gradient-descent))
        - This process is called ==**Back Propagation**==
    - Also see [A list of cost functions used in neural networks, alongside applications](https://stats.stackexchange.com/questions/154879/a-list-of-cost-functions-used-in-neural-networks-alongside-applications)

### [Gradient Descent](../stats-cheatsheet/#gradient-descent)
- Reference: [Read The Docs](https://ml-cheatsheet.readthedocs.io/en/latest/gradient_descent.html)
- An optimization algorithm used to minimize some function by iteratively moving in the direction of steepest descent as defined by the negative of the gradient (steepest descent)
- Commonly used to update the weights in neural networks
- The direction and slope of each move is determined based on the **slope** ($m$) and **bias** ($b$) parameters in a ==**[cost function](../stats-cheatsheet/#cost-function)**==
    - Requires the cost function to be convex
        - May result in finding a local minimum instead of a global one

    !!! note "Cost Function"
        - A Loss Functions that tells us how good our model is at making predictions for a given set of parameters 
        - Has its own curve and its own gradients
        - The slope of this curve tells us how to update our parameters to make the model more accurate

    !!! tip
        - For regressions, ==**mean squared error**== is commonly used as the loss function
        - For binary classifications, ==**binary_crossentropy**== is commonly used as the loss function
        - For non-binary classifications, ==**categorical_crossentropy**== is commonly used as the loss function

- The size of each step taken to move is determined by the ==**learning rate**== parameter

    !!! note "Learning Rate"
        - With a high learning rate we can move faster, but we risk overshooting since the slope is constantly changing. 
        - With a very low learning rate, we can be more precise but may end up taking a lot of time depending on how low the value is
            - Results in more frequent calculation of the negative gradient 

!!! info Gradient Descent Calculation Steps
    - Calculate the partial derivatives of the cost function with respect to the slope and bias parameters  
    - Store the results in a gradient
    - Iterate through the data points by updating the parameters using the new slope and bias

- Similar to [Perceptron](#perceptron), feeds the error back to the neural network and adjusts the weights after each **epoch**
- Also called ==**Batch Gradient Descent**==
- It is a deterministic algorithm

### Stochastic Gradient Descent
- Helps avoid local minimums and always finds the global minimum
- Unlike basic [Perceptron](#perceptron) or [Gradient Descent](#gradient-descent), instead of feeding the error back to the neural network and adjusting the weights after each **epoch**, ==feeds the error back to the neural network and adjusts the weights after each row==
- It is a stochastic algorithm

## Convolutional Neural Networks (CNN)
!!! abstract "Terminology"
    - **Feature Detector/Kernel/Filter**: A small matrix applied to input data for feature extraction
        - ==**During Backpropagation, these are also adjusted along with the weights**==
    - **Feature Map/Convolved Feature/Activation Map**: A visual representation of features learned by applying filters to an input image
    - **Stride**: The step size when sliding the convolutional filter/kernel over the input data during the convolution operation
    - **Spatial Invariance**: The CNN's ability to recognize patterns regardless of their position, scale or location in the input data
    - **Fully Connected Layer**: Hidden layer but unlike the ANN hidden layers, these are fully connected

### CNN Basics
#### Convolution
- Create Feature Map: Reduce the size of the input image (matrix)
    - Derive the reduced image (**Feature Map**) by element wise multiplying the input image by the **Feature Detector**
    - The bigger the **stride**, the more the reduction in the image
        - Common value  for stride is 2
    - The process of reducing the image to create the Feature Map allows us to get rid of the unnecessary details while emphasizing the important features at the same time
- Multiple Feature Maps are created by using different filters
- Use the **Rectifier activation** function on the filters to increase non-linearity
    - We want to increase non linearity as the images themselves are non linear

#### Pooling (DownSampling)
- Pool the features to achieve **Spatial Invariance** so that the CNN can identify the feature irrespective of where it is
    - Pooling is applied on the each reduced image feature map resulting from the convolution layer
    - Helps in further reducing the size
    - Also reduces the number of parameters thereby helping in avoiding overfitting

!!! note "Common Pooling Types"
    - **Max Pooling**: Extracts the maximum value from a group of neighboring pixels, emphasizing the most significant features
    - **Average Pooling**: Computes the average value from a group of neighboring pixels, offering a smoother down-sampling approach compared to max pooling

#### Flattening
- Flattens the pooled feature map into a single column
    - Each row in the column corresponds to a pooled feature map layer
- ==The flattened layer is used as the input layer for CNNs==

!!! info 
    - When there are multiple neurons in the output layer, each output neuron receives signals from each of the neurons in the last hidden layer
        - One neuron in the hidden layer will send the same signal to all the neurons in the output layer
        - However, the signals from each neuron in the last hidden layer can potentially be different
    - During training, the output neurons learn which of the neurons in the last hidden layer are more important and should be used for prediction.
    - Those neurons from the last hidden layer will be assigned more importance by the respective output layer neurons when making predictions on unseen data