---
title: "Wiki Overview"
category: meta
last_updated: 2026-04-19
---

# Knowledge Base Overview

A self-maintaining personal wiki covering software engineering, information technology, data science, machine learning, and generative AI. Maintained by LLM; browsed via Obsidian.

**Current state:** 59 source files ingested from 3 repos. ~30 wiki pages across 4 categories.

---

## Python Programming

Core Python language for data science and scripting. Sources from `learn-python` repo (mkdocs-based documentation site).

**Key pages:** [[Python Basics]], [[Python OOP]], [[Python Regex]], [[Python Web Scraping]], [[Python Databases]], [[Python Testing]]

**Strengths of the knowledge base:** Strong coverage of functional Python (map/filter/lambda), OOP patterns, decorators/generators, error handling, testing (unittest/doctest), web scraping, database (SQLite), and Jupyter workflows.

**Gaps identified:** Advanced async Python, type hints, packaging/deployment not yet covered.

---

## Machine Learning

End-to-end ML workflows using scikit-learn, statsmodels, and Keras/TensorFlow. Sources from `learn-ml` repo (mkdocs-based documentation + Jupyter notebooks).

**Key pages:** [[ML Workflow]], [[ML Regression]], [[ML Classification]], [[ML Clustering]], [[ML Deep Learning]], [[ML Time Series]], [[ML Time Series Forecasting]], [[ML Dimensionality Reduction]], [[ML Reinforcement Learning]]

**Strengths:** Very strong coverage of classical ML algorithms, model evaluation, cross-validation, feature engineering, and time series (ARIMA, SARIMA, SARIMAX). Deep learning (ANN/CNN/RNN) covered at introductory-intermediate level.

**Gaps identified:** XGBoost/LightGBM not yet covered; MLOps/model deployment not covered.

---

## Generative AI & NLP

LLMs, prompting, RAG, AI agents, and local inference. Sources from `learn-genai` repo (mkdocs-based documentation + Jupyter notebooks).

**Key pages:** [[NLP Basics]], [[LLM Concepts]], [[RAG]], [[Prompting]], [[AI Agents]], [[Local LLM]], [[Open Source Models]], [[GenAI Frameworks]], [[GenAI UI]]

**Strengths:** Excellent prompting tactics coverage, RAG pipeline understanding, local LLM setup (Ollama, LlamaFile), LangChain and LlamaIndex implementations. Good NLP foundations (tokenization, vectorization, embeddings, topic modeling).

**Gaps identified:** Multimodal AI, image generation, fine-tuning workflows, evaluation frameworks (LangSmith, etc.) not yet covered.

---

## Cross-Cutting Concepts

Statistics, probability, and math that underpin all ML work.

**Key pages:** [[Statistics Basics]], [[Statistics for ML]], [[Probability]]

---

## Compounding Connections

Cross-domain links that make this wiki valuable:

- **Python → ML** — scikit-learn, pandas, numpy are Python libraries; all ML code is Python
- **Statistics → ML** — every ML model has statistical assumptions and evaluation metrics
- **NLP → LLMs** — tokenization/vectorization are NLP foundations that LLMs build on
- **RAG → ML** — RAG uses embedding models (ML) for similarity search
- **Local LLM → Deep Learning** — quantization, model architecture concepts from DL
- **Prompting → Agents** — system prompts + tool specs define agent behaviour

---

## OneNote Integration (Planned)

Source: `raw/onenote/` (not yet present)

**Planned export workflow:**
1. Export OneNote section as HTML or DOCX from OneNote for Mac/Windows
2. Convert to markdown: `pandoc -f docx -t markdown -o output.md input.docx`
3. Place in `raw/onenote/[section-name]/`
4. Ingest: tell LLM to process `raw/onenote/[section-name]/`
5. LLM will integrate content into existing wiki pages + create new pages as needed

---

## Recent Activity

See [[Wiki Log]] for the full activity history.

Last ingest: **2026-04-19** — Initial setup from learn-python, learn-ml, learn-genai repos.
