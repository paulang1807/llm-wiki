??? info "Useful Libraries and Packages"
    - [Natural Language Toolkit (NLTK)](https://www.nltk.org/) - NLTK is a leading platform for building Python programs to work with human language data. It provides easy-to-use interfaces to over 50 corpora and lexical resources such as WordNet, along with a suite of text processing libraries for classification, tokenization, stemming, tagging, parsing, and semantic reasoning, wrappers for industrial-strength NLP libraries
        - [Punkt](https://www.askpython.com/python-modules/nltk-punkt) - In NLTK, PUNKT is an unsupervised trainable model, which means it can be trained on unlabeled data. 

    - [TextBlob](https://textblob.readthedocs.io/en/dev/) - This library provides a simplified interface for exploring common NLP tasks including part-of-speech tagging, noun phrase extraction, sentiment analysis, classification, translation etc.

    - [spaCy](https://spacy.io/) - spaCy is a free, open-source library for advanced Natural Language Processing (NLP) in Python. It helps build applications that process and “understand” large volumes of text. It can be used to build information extraction or natural language understanding systems.

    - [Gensim](https://radimrehurek.com/gensim/) - It is one of the fastest library for training of vector embeddings . The core algorithms in Gensim use battle-hardened, highly optimized & parallelized C routines. Gensim can process arbitrarily large corpora, using data-streamed algorithms. There are no "dataset must fit in RAM" limitations.

    - [Universal Dependencies](https://universaldependencies.org/) - Universal Dependencies (UD) is a framework for consistent annotation of grammar (parts of speech, morphological features, and syntactic dependencies) across different human languages.

    - [BERTopic](https://maartengr.github.io/BERTopic/index.html) - BERTopic is a topic modeling technique that leverages transformers and c-TF-IDF to create dense clusters allowing for easily interpretable topics whilst keeping important words in the topic descriptions

## Modeling Steps
- Generate or Read data
- Preprocess and clean data
    - Remove stopwords
    - Remove links
    - Remove punctuations; keep only alpha characters
    - Remove double spacing
    - Extract word root
    - Convert to lowercase: One common method of reducing the number of features is converting all text to lowercase before generating features 
        - It might be useful not to convert them to lowercase if capitalization matters.
- Split training and test data
- Vectorize Data
- Apply ML Classifier
    - Model Training (`model.fit`)
- Get processing output

Also see [General ML Modeling Steps](https://paulang1807.github.io/learn-ml/#modeling-steps)

### [Tokenization](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=SadPkxiDCbJK)
#### With BERT
The BERT tokenizer has an `encode `function similar to `convert_tokens_to_ids` that includes special tokens such as <BOS>(beginning of the sequence) and <EOS>(end of the sequence). These special tokens help the model understand where a sequence starts and ends.

!!! abstract "Sample Code"

    ```python
    from transformers import BertTokenizer

    # Initialize pre trained tokenizer
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased",clean_up_tokenization_spaces=True)
    # Tokenize sentence
    tokens = tokenizer.tokenize("Apple is looking at buying U.K. startup for $1 billion")

    # convert the tokens to their corresponding numerical values
    token_ids = tokenizer.convert_tokens_to_ids(tokens)

    # use encode function to convert the tokens to their corresponding numerical values
    enc_token_ids = tokenizer.encode("Apple is looking at buying U.K. startup for $1 billion")

    # convert ids back to tokens to inspect the special token ids added by the encode function
    dec_tokens = tokenizer.convert_ids_to_tokens(enc_token_ids)
    ```

#### With spaCy
On parsing, the following components are identified for each token:

- `Text`: The original word text.
- `Lemma`: The base form of the word.
- `POS`: The simple UPOS part-of-speech tag.
- `Tag`: The detailed part-of-speech tag.
- `Dep`: Syntactic dependency, i.e. the relation between tokens.
- `Shape`: The word shape – capitalization, punctuation, digits.
- `is alpha`: Is the token an alpha character?
- `is stop`: Is the token part of a stop list, i.e. the most common words of the language?

Also see [spaCy Linguistic Annotations](https://spacy.io/usage/spacy-101#annotations)

!!! abstract "Sample Code"

    ```python
    import spacy
    from spacy import displacy   # for vizualizing dependencies

    # Load corpus
    nlp = spacy.load("en_core_web_sm")
    # Tokenize text using above corpus
    doc = nlp("Apple is looking at buying U.K. startup for $1 billion")

    # Vizualize dependencies
    from spacy import displacy
    html = displacy.render(doc, style="dep")

    # Print parsed building blocks
    for ix, token in enumerate(doc):
    print(ix, token.text, token.lemma_, token.pos_, token.tag_, token.dep_, token.shape_, token.is_alpha, token.is_stop)
    ```

#### With TitToken
!!! abstract "Sample Code"

    ```python
    import tiktoken

    encoding = tiktoken.encoding_for_model("gpt-4.1-mini")

    tokens = encoding.encode("Apple is looking at buying U.K. startup for $1 billion")

    for token_id in tokens:
        token_text = encoding.decode([token_id])
        print(f"{token_id} = {token_text}")
    ```

### [spaCy NER](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=rfyXXK9EGYIT)
spaCy can recognize various types of named entities in a document and show the label of the named entity as well as the position of the entity in the document. spaCy NER returns the following:

- `Text`: The original entity text.
- `Start`: Index of start of entity in the Doc.
- `End`: Index of end of entity in the Doc.
- `Label`: Entity label, i.e. type.

!!! abstract "Sample Code"

    ```python
    import spacy

    nlp = spacy.load("en_core_web_sm")
    doc = nlp("Apple is looking at buying U.K. startup for $1 billion")

    # Parse entities using .ents
    for ix, ent in enumerate(doc.ents):
        print(ix, ent.text, ent.start_char, ent.end_char, ent.label_)
    ```

### [spaCy Pipelines](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=nvEhbQ1UL83q)
spaCy uses a specific component such as `Tagger`, `DependencyParser`, `EntityRecognizer`, `Lemmatizer`, `TextCategorizer` etc. for these pipelines. Pipeline componets can be added and retrieved using the **add_pipe** and **get_pipe** methods respectively. 

- One of the componets called the [AttributeRuler](https://spacy.io/api/attributeruler) can be used to handle exceptions for token attributes and to map values between attributes such as mapping fine-grained POS tags to coarse-grained POS tags.

Also see [spaCy Pipeline documentation](https://spacy.io/usage/spacy-101#pipelines) and [spaCy Processing Pipeline documentation](https://spacy.io/usage/spacy-101#architecture-pipeline). 

!!! abstract "Sample Code"

    ```python
    import spacy

    nlp = spacy.load("en_core_web_sm")
    doc = nlp("I saw The Beatles perform. Who did you see?")

    # Get pipe for lemmatizer
    lemmatizer = nlp.get_pipe("lemmatizer")
    print(lemmatizer.mode)
    
    # Get pipe for attribute ruler and modify
    ruler = nlp.get_pipe("attribute_ruler")
    # Pattern to match "The Beatles"
    patterns = [[{"LOWER": "the"}, {"TEXT": "Beatles"}]]
    # The attributes to assign to the matched token
    attrs = {"TAG": "NNP", "POS": "PROPN"}
    # Add rules to the attribute ruler
    ruler.add(patterns=patterns, attrs=attrs, index=0)  # "The" in "The Beatles"
    ruler.add(patterns=patterns, attrs=attrs, index=1)  # "Beatles" in "The Beatles"
    ```

### [Vectorization](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=SF9gxZx7aJE-)

!!! abstract "Sample Code"

    ```python
    from sklearn.feature_extraction.text import CountVectorizer

    c_cv = CountVectorizer()
    X = c_cv.fit_transform(df_yelp.text)

    # Last 10 features
    print((c_cv.get_feature_names_out()[-10:]))

    # print first 10 items in the vocab
    from itertools import islice
    list(islice(c_cv.vocabulary_.items(), 10))
    ```

### [Embeddings](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=Dc3s5n8I8cvy)

!!! abstract "Sample Code"

    ```python
    import torch
    from transformers import BertModel

    model = BertModel.from_pretrained("bert-base-uncased")

    # get the embedding vector for the word "apple"
    token_id_apple = tokenizer.convert_tokens_to_ids(["apple"])[0]
    embedding_apple = model.embeddings.word_embeddings(torch.tensor([token_id_apple]))

    # get the embedding vector for the word "orange"
    token_id_orange = tokenizer.convert_tokens_to_ids(["orange"])[0]
    embedding_orange = model.embeddings.word_embeddings(torch.tensor([token_id_orange]))

    # Check similarity between two words based on their embeddings
    cos = torch.nn.CosineSimilarity(dim=1)
    similarity = cos(embedding_apple, embedding_orange)
    print(f"Cosine Similarity between 'apple' and 'orange': {similarity[0] * 100}%")
    ```