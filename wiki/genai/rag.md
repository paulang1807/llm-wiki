---
title: "RAG — Retrieval Augmented Generation"
category: genai
tags: [rag, retrieval, embeddings, vector-database, llm, faiss, chromadb]
sources: [raw/genai/concepts.md, raw/genai/index.md]
confidence: 0.92
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[NLP Basics]], [[AI Agents]], [[Prompting]]
---

# RAG — Retrieval Augmented Generation

RAG extends LLM knowledge beyond its training data by retrieving relevant context from external documents at query time, then using that context to generate a grounded response. Solves the problem of stale knowledge and hallucination on domain-specific topics.

## How It Works

Rather than relying solely on the LLM's parametric memory, RAG:
1. Ingests your documents into a **vector store**
2. At query time, **retrieves** the most relevant chunks
3. Injects retrieved context into the prompt before the LLM generates a response

## Components

### 1. Document Ingestion Pipeline

```
Raw Documents
     ↓
  Splitting (Chunking)
     ↓
  Embedding (text → vectors)
     ↓
  Storage (Vector Database)
```

**Splitting** — required because LLMs have context window limits. Documents are split into overlapping chunks (e.g., 500 tokens with 50-token overlap).

**Embedding** — each chunk is converted via an embedding model into a high-dimensional vector that captures semantic meaning. The embedding model must be the **same** at ingest time and query time.

**Vector Databases** — stores embeddings as clusters in multi-dimensional space for fast similarity lookup:
- **FAISS** — Facebook AI Similarity Search (local, fast)
- **ChromaDB** — open-source, easy to use locally
- **AstraDB** — managed cloud vector DB

### 2. Query & Response Pipeline

```
User Query
     ↓
  Embed query (same model as ingest)
     ↓
  Similarity Search in Vector Store
     ↓
  Retrieve top-k relevant chunks  ← Retrieval Chain
     ↓
  Combine: Prompt + Query + Retrieved Context
     ↓
  LLM generates response
```

**Retrieval Chain** — the interface that:
- Takes the embedded query
- Searches the vector store using similarity search
- Returns the most relevant document chunks

**Similarity Search** — compares the query vector to stored chunk vectors; returns chunks with highest cosine similarity.

## RAG vs. LLM-Only

| Aspect | LLM Only | RAG |
|--------|----------|-----|
| Knowledge scope | Training data cutoff | Any documents you provide |
| Hallucination risk | Higher | Lower (grounded in retrieved docs) |
| Setup complexity | Low | Medium |
| Cost per query | Low | Slightly higher (embedding + retrieval) |
| Best for | General knowledge | Domain-specific, proprietary, or recent data |

## RAG vs. LLM Wiki (Karpathy Pattern)

| Aspect | Classic RAG | LLM Wiki |
|--------|-------------|----------|
| Processing | At query time | At ingest time (compiled once) |
| Cross-linking | None built-in | Explicit wiki links |
| Scale | Handles thousands of docs | Works best up to ~100–150 sources |
| Synthesis | Rediscovered each query | Pre-synthesised and persistent |
| Search | Vector similarity | Index file → targeted page reads |

> 💡 **This wiki itself is an alternative to RAG** — by compiling knowledge into linked pages at ingest time, queries read pre-synthesised content rather than retrieving raw chunks.

## Python Implementation Sketch

```python
# Using LangChain + ChromaDB
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

# Ingest
loader = DirectoryLoader('./docs', glob='**/*.md')
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

# Embed and store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings, persist_directory='./chroma_db')

# Query
retriever = vectorstore.as_retriever(search_kwargs={'k': 4})
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
result = qa_chain.run("What is feature scaling?")
```

## Relationships
- [[LLM Concepts]] — context window, embeddings, temperature
- [[NLP Basics]] — tokenization and vectorization underpin embedding
- [[AI Agents]] — agents often use RAG as a memory/tool
- [[Prompting]] — RAG-augmented prompts have specific structure patterns

## Source References
- `raw/genai/concepts.md` — RAG components, pipeline description
- `raw/genai/index.md` — embeddings, vectorization background
