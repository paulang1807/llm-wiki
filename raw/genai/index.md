??? abstract "Terminology"
    - **Corpus**: A large collection of text documents or spoken language data used for training and testing NLP models
    - **Dimensionality**: Number of dimensions in a word vector. A high-dimensional word vector would have many dimensions, allowing it to capture a wide range of characteristics and nuances of the word.
    - **[Embedding](./nlpb/#embeddings)**: Vectorization in multi dimensional space. To give tokens meaning, the model must be trained on them. This allows the model to learn the meanings of words and how they relate to other words. To achieve this, the word vectors are “embedded” into an embedding space.
    - **Named Entity Recognition(NER)**: A named entity is a “real-world object” that’s assigned a name – for example, a person, a country, a product or a book title. Also see [spaCy NER](./nlpb/#spacy-ner).
    - **Pipelines**: The steps used for processing a document and extract the constituent [building blocks](#building-blocks). Also see [spaCy Pipelines](./nlpb/#spacy-pipelines)
    - **Stemming / Lemmatization**: Reducing words to their base or root form to handle variations of the same word, such as singular/plural forms or verb tenses
    - **Stopwords**: Commonly used words (determinants, conjunctions, prepositions, pronouns, auxillary verbs etc.) in a language but do not carry much meaning or significance. 
    <p id="cust-id-nlp-concept-token"></p>
    - **[Tokenization](#tokenization)**: The process of parsing a statement and representing them as the constituent words or punctuations.  For example, dividing text by whitespace is one common approach, but there are many others. The purpose of tokenization is to create a vocabulary from a corpus. Each token is assigned a unique id to represent it as a number. Also see [spaCy Tokenization](./nlpb/#with-spacy)
    - **Transformers**: Deep learning models that are trained on vectors to understand the meaning of words and how they relate to each other.
    - **Vector / Word Vector**: Vector representation of a word in NLP. Each word vector can be thought of as a point in a multi-dimensional space, where each dimension represents a particular aspect or characteristic of the word. Combining all the dimensions in a vector allows the model to understand the word’s meaning and how it relates to other words.
    <p id="cust-id-nlp-concept-vector"></p>
    - **[Vectorization](#vectorization)**: Machine learning models typically require the data/features to be numeric. The process of transforming non-numeric data such as tokens into numeric features is called vectorization. During vectorization, the unique ids in the tokens are assigned to randomly initialized n-dimensional vectors.
    - **Vocabulary**: Set of unique tokens found within the corpus

## Building Blocks
- **Tokenization:** Breaking text into tokens (words, sentences, n-grams)
- **Stop-word removal:** a/an/the
- **Stemming and lemmatization:** root word and word relation detection
- **TF-IDF (Term Frequency Inverse Document Frequency):** word importance/uniqueness with regards to a given document
- **Part-of-speech tagging:** noun/verb/adjective
- **Noun Phrase Extraction:**
- **NER (Named Entity Recognition):** person/organization/location
- **Spelling correction:** "Santa Calra Country"
- **Word sense disambiguation:** "Apple stock price"
- **Segmentation:** "San Francisco City subway"
- **Language detection:** "translate this page"
- **Sentiment Analysis:**

## [Tokenization](./nlpb/#tokenization)
- **Character tokenization** - Treats each character as a separate token
- **Word tokenization** - Divides the text into individual words or even subwords
- **Subword tokenization** - Combines the benefits of character and word tokenization by breaking down rare words into smaller units while keeping frequent words as unique entities.
    - Allows the model to handle complex words and misspellings while keeping the length of the inputs manageable.
    - Typically **1 token ~ 4 characters** or **~ 0.75 words**
- **Sentence tokenization** - Divides the text into individual sentences

## [Vectorization](./nlpb/#vectorization)
### Bag Of Words
This is the simplest vectorization technique and involves three operations:

- Tokenization: The input is represented as a list of its constituent words, disregarding grammar and word order.
    - It is called `bag of words` because the document's structure is lost — as if the words are all jumbled up in a bag.
- Vocabulary creation: Of all the obtained tokenized words, only unique words are selected to create the vocabulary.
    - CountVectorizer creates a dictionary called `vocabulary_` that converts each word to its index in the sparse matrix.
- Vector creation: A sparse matrix is created out of the frequency of vocabulary words. In this sparse matrix, each row is a sentence vector whose length (the columns of the matrix) is equal to the size of the vocabulary.
    - The words are the features(columns) and the feature vectorization just involves marking the feature as a 0 or 1 depending on whether it appears in the document or not
    - Another approach is to count the number of times each word (feature) appears in the document.
    - ==The vectorization will be mostly zeros, since only a few unique words are in each document.==
        - ==For that reason, instead of storing all the zeros we only store non-zero values inside the 'sparse matrix' data structure.==

### Common Vectorization Options
#### N-Grams
Allows us to specify whether a group of words should be considered as a single feature

- We can specify a lower and upper boundary of the range of n-values for different n-grams to be extracted
- Adds all word combinations as specified by the lower and upper boundaries
    - For example, lower=1, upper=2 will include al single and double word combinations (multiple word combinations are only for consecutive words)
- When we produce n-grams from a document with  𝑊  words, we add a maximum of $𝑛−𝑊+1$ features. 
- May lead to `feature explosion`

## [Topic Modeling](https://colab.research.google.com/drive/17zJbut8FVMEGr9ElmaZ-ZVciqs60cXnT#scrollTo=XYXIAevyELc3)
A frequently used approach to discover hidden semantic patterns portrayed by a text corpus and automatically identify topics that exist inside it.

- A type of statistical modeling that leverages `unsupervised machine learning` to analyze and identify clusters or groups of similar words within a body of text.
- Topics are the latent descriptions of a corpus of text
    - Documents related to a specific topic are more likely to produce certain words more frequently
- Two popular topic modeling techniques:  **Latent Semantic Analysis (LSA)** and **Latent Dirichlet Allocation (LDA)**

### Latent Semantic Analysis (LSA)
A natural language processing technique used to analyze relationships between documents and the terms they contain. 

- Assumes words with similar meanings will appear in similar documents. 
- Constructs a matrix containing the word counts per document, where each row represents a unique word, and columns represent each document
- Uses ==Singular Value Decomposition (SVD)== to reduce the number of rows while preserving the similarity structure among columns
- Cosine similarity is used to determine the similarity between documents
    - A value close to 1 means the documents are very similar based on the words in them
    - A value close to 0 means they're quite different

### Latent Dirichlet Allocation (LDA)
A natural language technique used to identify topics a document belongs to based on the words contained within it.

- It is a Bayesian network i.e., it’s a generative statistical model that assumes documents are made up of words that aid in determining the topics
- Documents are mapped to a list of topics by assigning each word in the document to different topics
- This model ignores the order of words occurring in a document and treats them as a [bag of words](#bag-of-words)