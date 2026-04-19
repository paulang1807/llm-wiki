## Model Types
### [Bag of Words](../#bag-of-words)

!!! abstract "Sample Code"
    [NTLK Corpus](https://www.nltk.org/api/nltk.corpus.html)

    [NTLK Stem](https://www.nltk.org/api/nltk.stem.html)

    [Count Vectorizer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html)

    [Notebook](https://colab.research.google.com/drive/1-fdy-dG8kTNS0fr5njYG_r5UIXbtwQ8i#scrollTo=efa9f818-cd1b-434a-9bc3-7f80e22f4ab3)

    ```python
    import nltk
    nltk.download('stopwords')
    from nltk.corpus import stopwords
    from nltk.stem.porter import PorterStemmer   # 'extracts' the root of the words from their variations

    # Clean Data and Build Corpus
    corpus = []
    ps = PorterStemmer()
        
    all_stopwords = stopwords.words('english')
    all_stopwords.remove('not')
    
    for i in range(0, 1000):
        review = re.sub('[^a-zA-Z]', ' ', data['Review'][i])  # replace all punctuations by space
        review = review.lower()    # convert to lowercase
        review = review.split()    # split each review into list of words
        
        review = [ps.stem(word) for word in review if not word in set(all_stopwords)]
        review = ' '.join(review)   # join back the stemmed words for the review
        corpus.append(review)

    # Build Model
    from sklearn.feature_extraction.text import CountVectorizer
    # max features set to a number lower than the total number of words so that it excludes the sparsely occuring words
    # total number of words can be found by checking the length of X after the fit transform step
    c_cv = CountVectorizer(max_features = 1500)  
    X = c_cv.fit_transform(corpus).toarray()
    y = data.iloc[:, -1].values

    # Train Test Split
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 0)

    # Train Model and Predict
    # This example uses Gaussian NB
    # Other classification models can also be used
    from sklearn.naive_bayes import GaussianNB
    c_gnb = GaussianNB()
    c_gnb.fit(X_train, y_train)
    y_pred_gnb = c_gnb.predict(X_test)
    ```

### [Latent Dirichlet Allocation (LDA)](../#latent-dirichlet-allocation-lda)

!!! abstract annotate "Sample Code (1)"

    ```python
    from sklearn.decomposition import LatentDirichletAllocation

    # Define X and y.
    X = df_yelp.review
    y = df_yelp.stars

    # Split the new DataFrame into training and testing sets.
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25 ,random_state=13)

    # Use CountVectorizer to create document-term matrices from X_train and X_test.
    vect = CountVectorizer(lowercase=False, min_df=25, token_pattern='\w+|\$[\d\.]+|\S+')
    X_train_dtm = vect.fit_transform(X_train)

    number_of_topics = 10

    model = LatentDirichletAllocation(n_components=number_of_topics, random_state=13)
    model.fit(X_train_dtm)

    no_top_words = 10
    topic_dict = {}
    for topic_idx, topic in enumerate(model.components_):
        topic_dict["Topic %d words" % (topic_idx)]= ['{}'.format(vect.get_feature_names_out()[i])
                        for i in topic.argsort()[:-no_top_words - 1:-1]]
        topic_dict["Topic %d weights" % (topic_idx)]= ['{:.1f}'.format(topic[i])
                        for i in topic.argsort()[:-no_top_words - 1:-1]]

    topic_df = pd.DataFrame(topic_dict)
    ```
    
1. [LatentDirichletAllocation](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.LatentDirichletAllocation.html)

    [Notebook](https://colab.research.google.com/drive/1-fdy-dG8kTNS0fr5njYG_r5UIXbtwQ8i#scrollTo=oijAFtRBiNXq)

### BERTopic

!!! abstract "Sample Code"
    [BERTopic](https://maartengr.github.io/BERTopic/index.html)

    [Notebook](https://colab.research.google.com/drive/1-fdy-dG8kTNS0fr5njYG_r5UIXbtwQ8i#scrollTo=JdBOjPxhDHnd)

    ```python
    from bertopic import BERTopic

    nlp = spacy.load('en_core_web_sm', exclude=['tagger', 'parser', 'ner', 'attribute_ruler', 'lemmatizer'])

    topic_model = BERTopic(embedding_model=nlp)
    topics, probs = topic_model.fit_transform(df_yelp['review'])

    topic_model.get_topic_info()
    ```