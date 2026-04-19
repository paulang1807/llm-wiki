## K-Nearest Neighbors
### Euclidean Distance
$$ \sqrt {(x_2^2 - x_1^2) + (y_2^2 - y_1^2)} $$

## Model Evaluation
### Accuracy and Error Rates
Accuracy Rate
$$ AR = \frac{Correct}{Total} = \frac{TN + TP}{Total} $$
where $TN$ and $TP$ are the total true negatives and true positives respectively

Error Rate
$$ ER = \frac{Incorrect}{Total} = \frac{FN + FP}{Total} $$
where $FN$ and $FP$ are the total false negatives and false positives respectively

### Precision and Recall
Precision
$$ \frac{TP}{TP + FP} $$

Recall(Sensitivity)
$$ \frac{TP}{TP + FN} $$

### F1 Score
$$ F1 = \frac{2}{\frac{1}{Precision} + \frac{1}{Recall}} = \frac{2 * (Precision * Recall)}{Precision + Recall}$$

### MAPE
$$ MAPE = \frac{\sum_{i=1}^n \frac{|y_i - \hat y_i|}{y}}{n} $$

## ANN 
### Activation Functions
#### Threshold Functions
$$ \phi(x) = \begin{cases}
1 \ if \ x \geq 0 \\
0 \ if \ x \lt 0
\end{cases} $$

#### Sigmoid Function
$$ \phi(x) = \frac{1}{1 + e^{-x}} $$

- Anything below 0 drops off, above 0 approximates to 1

#### Rcctifier Function
$$ \phi(x) = max(x, 0) $$

#### Hyperbolic Tangent Function (tanh)
$$ \phi(x) = \frac{1 - e^{-2x}}{1 + e^{-2x}} $$

- Ranges from -1 to 1

#### Softmax Function
$$ f_j(x) = \frac{e^{x_j}}{\sum_k e^{x_k}} $$

### Cost Function
$$ C = \sum_i^n {\frac{1}{2} (\hat y_i - y_i)^2 }$$
where $n$ is the total number of rows in the dataset and $i$ is the $i^{th}$ row

Also see [Gradient Descent Cost Function](../stats-cheatsheet/#cost-function)