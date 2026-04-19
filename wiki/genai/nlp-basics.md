---
title: "NLP Basics"
category: genai
tags: [nlp, tokenization, vectorization, embeddings, topic-modeling, bag-of-words, tfidf]
sources: [raw/genai/index.md, raw/genai/nlp.md, raw/genai/nlpb.md]
confidence: 0.93
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[RAG]], [[Prompting]], [[Open Source Models]]
---

# NLP Basics

Natural Language Processing — the field of making computers understand and generate human language. Forms the foundation for LLMs, GenAI, and search systems.

## Terminology

| Term | Definition |
|------|-----------|
| **Corpus** | Large collection of text documents used for training/testing NLP models |
| **Dimensionality** | Number of dimensions in a word vector |
| **Embedding** | Vectorisation in multi-dimensional space — gives tokens meaning by training |
| **NER** | Named Entity Recognition — identifying real-world objects (persons, places, products) |
| **Stopwords** | Commonly used words with little meaning (a, an, the, is, are) |
| **Stemming/Lemmatization** | Reducing words to their base/root form |
| **Tokenization** | Parsing text into tokens (words, subwords, characters, sentences) |
| **Transformers** | Deep learning models trained on vectors to understand word meaning and relationships |
| **Word Vector** | Vector representation of a word in N-dimensional space |
| **Vocabulary** | Set of all unique tokens in a corpus |

## NLP Building Blocks

| Building Block | Description |
|---------------|-------------|
| Tokenization | Splitting text into tokens |
| Stop-word removal | Filter out `a`, `an`, `the`, etc. |
| Stemming / Lemmatization | Reduce to root form (`running` → `run`) |
| TF-IDF | Word importance weighted by uniqueness in document vs. corpus |
| POS Tagging | Part-of-speech (noun, verb, adjective) |
| NER | Identify entities: person / organisation / location |
| Sentiment Analysis | Positive / negative / neutral classification |

## Tokenization Types

| Type | Description |
|------|-------------|
| **Character** | Each character is a token |
| **Word** | Each word (or subword) is a token |
| **Subword** | Hybrid — rare words split into parts, frequent words kept whole |
| **Sentence** | Each sentence is a token |

> 📐 Rule of thumb: **1 token ≈ 4 characters ≈ 0.75 words**

Subword tokenization benefits:
- Handles unknown words and misspellings
- Keeps input lengths manageable
- Used by GPT, BERT, and most modern LLMs

## Vectorization

Machine learning requires numeric inputs. Vectorization converts tokens → numeric features.

### Bag of Words (BoW)
Simple and effective for many tasks:
1. **Tokenize** — split document into words
2. **Build vocabulary** — unique words across all documents
3. **Create sparse matrix** — each row = document, each column = vocabulary word, value = count or 0/1

```python
from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer()
X = cv.fit_transform(corpus)
# cv.vocabulary_ maps each word to its column index
```

> ⚠️ The structure/order of words is lost. Result is mostly zeros (sparse).

### N-Grams
Extends BoW by treating consecutive word sequences as single features:
- `ngram_range=(1, 2)` → includes single words AND word pairs
- Can capture phrases but risks **feature explosion**

### TF-IDF
Weighs words by how unique they are to a specific document:
- High TF-IDF = common in this doc, rare across corpus → important discriminator
- Low TF-IDF = common everywhere (stopwords) → less useful

## Topic Modeling
Unsupervised technique to discover hidden themes in a collection of documents.

### Latent Semantic Analysis (LSA)
- Assumes similar words appear in similar documents
- Builds word-count matrix then reduces dimensions via **SVD (Singular Value Decomposition)**
- Uses **cosine similarity** to find similar documents
  - Score ≈ 1 → very similar; Score ≈ 0 → very different

### Latent Dirichlet Allocation (LDA)
- Bayesian network that assigns documents to topic distributions
- Each topic = distribution over words; each document = distribution over topics
- Treats documents as bag-of-words (order ignored)
- Common in news categorisation, document classification

## Embeddings

Unlike BoW, embeddings capture **semantic meaning** — similar words have similar vectors:
- Trained so that `king - man + woman ≈ queen` (vector arithmetic)
- Each unique token → unique ID → randomly initialised N-dimensional vector → trained via model
- Used in [[RAG]] for similarity search

## Relationships
- [[LLM Concepts]] — transformers, tokenization, context window
- [[RAG]] — embeddings are the core mechanism for retrieval
- [[Open Source Models]] — BERT, GPT, LLaMA model families
- [[Prompting]] — understanding tokenization helps write efficient prompts

## Source References
- `raw/genai/index.md` — building blocks, tokenization, vectorization, topic modeling
- `raw/genai/nlp.md` — NLP overview
- `raw/genai/nlpb.md` — NLP deep dive (spaCy, pipelines)
