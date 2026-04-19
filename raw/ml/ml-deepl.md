## Model Types
### [Artificial Neural Networks](../stats-deepl/#artificial-neural-networks-ann)

- Requires Feature Scaling
    - Scaling applied to all independent data points (including encoded ones)

!!! abstract "Sample Code"
    [Sequential Keras Model](https://www.tensorflow.org/api_docs/python/tf/keras/Sequential)

    [Dense Layer](https://www.tensorflow.org/api_docs/python/tf/keras/layers/Dense)

    ```python
    import tensorflow as tf

    # Initializing the ANN
    dl_ann = tf.keras.models.Sequential()

    # Adding the first hidden layer
    # Here we are using Dense layers 
    # units - neurons in hidden layer. its a hyperparameter and is determined by trial and error
    # relu is the rectifier activation function
    dl_ann.add(tf.keras.layers.Dense(units=6, activation='relu'))

    # Adding the second hidden layer
    dl_ann.add(tf.keras.layers.Dense(units=6, activation='relu'))

    # Adding the output layer
    # Since we are doing binary classification, the units in the output layer is set to 1
    dl_ann.add(tf.keras.layers.Dense(units=1, activation='sigmoid'))
    
    # Compile the ANN with an optimizer and loss function
    # Adam optimizer performs Stochastic Gradient Descent
    dl_ann.compile(optimizer = 'adam', loss = 'binary_crossentropy', metrics = ['accuracy'])

    # Training the ANN on the Training set
    # batch size and epochs are hyperparameters
    dl_ann.fit(X_train, y_train, batch_size = 32, epochs = 100)

    y_pred_ann = dl_ann.predict(sc.transform(X_test))
    # Convert predicted probability to prediction
    y_pred_ann = (y_pred_ann > 0.5)
    ```

### [Convolutional Neural Networks](../stats-deepl/#convolutional-neural-networks-cnn)

!!! abstract "Sample Code"
    [ImageDataGenerator](https://www.tensorflow.org/api_docs/python/tf/keras/preprocessing/image/ImageDataGenerator)

    [Conv2D Layer](https://www.tensorflow.org/api_docs/python/tf/keras/layers/Conv2D)

    [Maxpool2D Layer](https://www.tensorflow.org/api_docs/python/tf/keras/layers/MaxPooling2D)

    [Flatten Layer](https://www.tensorflow.org/api_docs/python/tf/keras/layers/Flatten)

    [Keras Utils](https://www.tensorflow.org/api_docs/python/tf/keras/utils)

    ```python
    import tensorflow as tf
    from keras.preprocessing.image import ImageDataGenerator
    import keras.utils as image
    
    # Preprocess training set
    # Image Augmentation - Transform data to avoid overfitting
    train_datagen = ImageDataGenerator(rescale = 1./255,     # Feature scale all pixels (divides by 255)
                                    shear_range = 0.2,
                                    zoom_range = 0.2,
                                    horizontal_flip = True)
    training_set = train_datagen.flow_from_directory('data/CNNData1/training_set',
                                                target_size = (64, 64),   # Final size of images before feeding to CNN; smaller size results in faster training
                                                batch_size = 32,          # Number of images in each batch
                                                class_mode = 'binary')    # cat/dog in this example

    # Preprocess test set
    # Only apply feature scaling to the test set. No transformations applied.
    test_datagen = ImageDataGenerator(rescale = 1./255)
    test_set = test_datagen.flow_from_directory('data/CNNData1/test_set',
                                                target_size = (64, 64),
                                                batch_size = 32,
                                                class_mode = 'binary')

    # Initializing the CNN
    cnn = tf.keras.models.Sequential()

    # Step1 - Add Convolution Layer
    # input shae is needed only for the first layer
    cnn.add(tf.keras.layers.Conv2D(filters=32, kernel_size=3, activation='relu', input_shape=[64, 64, 3]))

    # Step2 - Pooling
    cnn.add(tf.keras.layers.MaxPool2D(pool_size=2, strides=2))

    # Add a second convolution and pooling layer
    cnn.add(tf.keras.layers.Conv2D(filters=32, kernel_size=3, activation='relu'))
    cnn.add(tf.keras.layers.MaxPool2D(pool_size=2, strides=2))

    # Step3 - Flattening
    cnn.add(tf.keras.layers.Flatten())

    # Full Connection
    cnn.add(tf.keras.layers.Dense(units=128, activation='relu'))

    # Output Layer
    cnn.add(tf.keras.layers.Dense(units=1, activation='sigmoid'))

    # Compile the CNN with an optimizer and loss function
    cnn.compile(optimizer = 'adam', loss = 'binary_crossentropy', metrics = ['accuracy'])

    # Make a single prediction
    test_image = image.load_img('data/CNNData1/single_pred/cat_or_dog1.jpg', target_size = (64, 64)) # set size to 64 * 64 so that it matches the size used during training
    test_image = image.img_to_array(test_image)    # convert to array
    test_image = np.expand_dims(test_image, axis = 0)  # add a extra dummy dimension that will correspond to the batch size so that the format matches what the predict method expects 
    result = cnn.predict(test_image)
    training_set.class_indices  # allows us to know which index correspondes to which output. In this case, it will show that 1 is dog and 0 is cat
    if result[0][0] == 1:
    prediction = 'dog'
    else:
    prediction = 'cat'
    print(prediction)
    ```