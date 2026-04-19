---
title: "ML Deep Learning"
category: ml
tags: [deep-learning, neural-networks, ann, cnn, rnn, keras, tensorflow, pytorch]
sources: [raw/ml/ml-deepl.md, raw/ml/stats-deepl.md]
confidence: 0.9
last_updated: 2026-04-19
stale: false
related: [[ML Classification]], [[ML Regression]], [[ML Reinforcement Learning]], [[LLM Concepts]]
---

# ML Deep Learning

Neural networks with multiple hidden layers — the foundation of modern AI. Automatically learns feature representations from raw data.

## Why Deep Learning

- Learns hierarchical features automatically (no manual feature engineering for images/text)
- Outperforms traditional ML on unstructured data (images, audio, text)
- Powers LLMs, computer vision, speech recognition

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Neuron/Node** | Basic computational unit — weighted sum + activation function |
| **Layer** | Collection of neurons (input, hidden, output) |
| **Weights & Biases** | Learnable parameters updated during training |
| **Activation Function** | Introduces non-linearity (ReLU, Sigmoid, Tanh, Softmax) |
| **Forward Propagation** | Data flows input → output to make predictions |
| **Backpropagation** | Error flows output → input to update weights |
| **Gradient Descent** | Optimisation algorithm that minimises loss |
| **Epoch** | One complete pass through training data |
| **Batch Size** | Number of samples processed before weights are updated |
| **Learning Rate** | How much weights change per update step |

## Activation Functions

| Function | Formula | Use When |
|----------|---------|----------|
| **ReLU** | `max(0, x)` | Hidden layers (standard choice) |
| **Sigmoid** | `1 / (1 + e^-x)` | Binary output (0–1) |
| **Softmax** | `e^x / Σe^x` | Multi-class output (probabilities sum to 1) |
| **Tanh** | `(e^x - e^-x) / (e^x + e^-x)` | Hidden layers; centred around 0 |

## Network Types

| Type | Input | Typical Use |
|------|-------|-------------|
| **ANN** (Dense/Feedforward) | Tabular/structured | Classification, regression |
| **CNN** (Convolutional) | Images, 2D data | Image recognition, computer vision |
| **RNN** (Recurrent) | Sequences, time series | NLP, time series forecasting |
| **LSTM** (Long Short-Term Memory) | Long sequences | NLP, time series (solves vanishing gradient) |
| **Transformer** | Sequences | LLMs, BERT, GPT (attention mechanism) |

## Keras/TensorFlow Example (ANN)

```python
import tensorflow as tf
from tensorflow import keras

# Build model
model = keras.Sequential([
    keras.layers.Dense(units=6, activation='relu', input_shape=[X_train.shape[1]]),
    keras.layers.Dense(units=6, activation='relu'),
    keras.layers.Dense(units=1, activation='sigmoid')  # binary classification
])

# Compile
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train
model.fit(X_train, y_train, batch_size=32, epochs=100)

# Predict
y_pred = (model.predict(X_test) > 0.5).astype(int)
```

## Loss Functions

| Task | Loss Function |
|------|--------------|
| Binary classification | `binary_crossentropy` |
| Multi-class classification | `categorical_crossentropy` |
| Regression | `mean_squared_error` |

## Overfitting Prevention

| Technique | Description |
|-----------|-------------|
| **Dropout** | Randomly zeros out neurons during training |
| **L1/L2 Regularisation** | Penalises large weights |
| **Early Stopping** | Stop training when validation loss stops improving |
| **Batch Normalisation** | Normalises layer inputs; speeds up training |
| **Data Augmentation** | Artificially expand training data (images: flip, rotate, crop) |

## Transfer Learning

Reuse a pre-trained model's weights as a starting point:
```python
# Example: load pre-trained ResNet50 without top classification layer
base_model = keras.applications.ResNet50(weights='imagenet', include_top=False)
base_model.trainable = False  # freeze base layers

# Add custom classification head
x = keras.layers.GlobalAveragePooling2D()(base_model.output)
output = keras.layers.Dense(num_classes, activation='softmax')(x)
model = keras.Model(base_model.input, output)
```

## Relationships
- [[LLM Concepts]] — transformers are deep learning models; fine-tuning is deep learning
- [[ML Classification]] — ANNs are one approach to classification
- [[ML Reinforcement Learning]] — deep RL uses neural networks as value/policy functions
- [[ML Time Series]] — LSTM and temporal convolutional networks for sequence modelling

## Source References
- `raw/ml/ml-deepl.md` — deep learning model implementations
- `raw/ml/stats-deepl.md` — statistical foundations of deep learning
