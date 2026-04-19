---
title: "Local LLM"
category: genai
tags: [local-llm, ollama, llamafile, llama-index, langchain, on-device, privacy]
sources: [raw/genai/local.md, raw/genai/frameworks.md]
confidence: 0.93
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[Open Source Models]], [[GenAI Frameworks]], [[RAG]]
---

# Local LLM

Running LLMs locally on your own hardware — no API keys, no data leaving your machine, no cloud costs. Essential for privacy-sensitive use cases and offline development.

## Why Local LLMs

- **Privacy** — data never leaves your machine
- **Cost** — no per-token API billing
- **Offline** — works without internet
- **Control** — choose any model, any version
- **Uncensored options** — models like `dolphin` have no content filters

> 💾 **Memory rule of thumb**: RAM needed ≈ model file size on disk (e.g., 7B model ~4GB requires ~4GB RAM)

## Ollama

The easiest way to run LLMs locally. Server-based; provides an OpenAI-compatible API.

### Setup
1. [Download Ollama](https://ollama.com/download)
2. Find model at ollama.com → copy CLI command → run in terminal
3. Models stored at: `~/.ollama/models/manifests/registry.ollama.ai/library/`

### Key Commands
| Command | Description |
|---------|-------------|
| `ollama list` | List downloaded models |
| `ollama run <model>` | Run a model interactively |
| `ollama serve` | Start local server at `http://127.0.0.1:11434` |
| `/bye` or `Ctrl+D` | Quit interactive session |

> 💡 `dolphin` models are uncensored variants of popular models.

### Python Usage (via OpenAI SDK)
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"    # required but unused
)

response = client.chat.completions.create(
    model="llama3.1:8b",
    messages=[{"role": "user", "content": "What is machine learning?"}]
)
print(response.choices[0].message.content)
```

## LlamaFile (Mozilla)

Single-file executable LLMs — download one file, run it anywhere.

### Setup
```bash
# Download llamafile (e.g. TinyLlama)
chmod +x TinyLlama-1.1B-Chat-v1.0.F16.llamafile
./TinyLlama-1.1B-Chat-v1.0.F16.llamafile
# → launches UI at http://127.0.0.1:8080
```

### Python Usage
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="no-key"    # cannot be empty string
)

response = client.chat.completions.create(
    model="TinyLLM",
    messages=[{"role": "system", "content": "You are a helpful assistant."},
              {"role": "user", "content": "What is LLM?"}]
)
print(response.choices[0].message.content)
```

## LlamaIndex (Local RAG)

Framework for building local RAG pipelines using local LLMs.

```bash
pip install llama-index llama-index-llms-llamafile llama-index-embeddings-llamafile
```

```python
from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.embeddings.llamafile import LlamafileEmbedding
from llama_index.llms.llamafile import Llamafile

# Configure
Settings.embed_model = LlamafileEmbedding(base_url="http://localhost:8080")
Settings.llm = Llamafile(base_url="http://localhost:8080", temperature=0, seed=0)

# Load, index, query
docs = SimpleDirectoryReader(input_dir='./docs/').load_data(show_progress=True)
index = VectorStoreIndex.from_documents(docs)
result = index.as_query_engine().query("Summarise the main topics")
print(result)
```

## LangChain (Local RAG)

```bash
pip install -U langchain langchain-openai langchain-community
```

```python
from langchain_community.llms.llamafile import Llamafile
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader

# Load and split
loader = PyPDFLoader('path/to/file.pdf')
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = loader.load_and_split(text_splitter=splitter)

# LLM + prompt
llm = Llamafile(temperature=0.7)
prompt = PromptTemplate.from_template("Summarise in 3 bullet points: {text}")

# Chain
from langchain.chains.summarize import load_summarize_chain
chain = load_summarize_chain(llm=llm, chain_type='stuff', prompt=prompt)
result = chain.invoke(docs)
```

### Text Splitters Comparison
| Splitter | Description |
|---------|-------------|
| `CharacterTextSplitter` | Splits on separator; preserves paragraphs/sentences |
| `RecursiveCharacterTextSplitter` | Recursively splits large chunks; better for arbitrary text |

## Custom Prompts in LlamaIndex

Most used templates: `text_qa_template` (initial Q&A) and `refine_template` (for multi-chunk refining).

## Relationships
- [[LLM Concepts]] — quantization enables running large models on consumer hardware
- [[Open Source Models]] — Llama, Mistral, Qwen are common local choices
- [[GenAI Frameworks]] — LangChain and LlamaIndex are the two main local RAG frameworks
- [[RAG]] — local LLMs + local vector stores = fully private RAG system

## Source References
- `raw/genai/local.md` — Ollama, LlamaFile, LlamaIndex, LangChain implementations
- `raw/genai/frameworks.md` — frameworks summary
