---
title: "GenAI Frameworks"
category: genai
tags: [frameworks, langchain, litellm, routers, llmops]
sources: [raw/genai/frameworks.md]
confidence: 0.9
last_updated: 2026-04-19
stale: false
related: [[AI Agents]], [[LLM Concepts]], [[RAG]]
---

# GenAI Frameworks

Frameworks and abstraction layers simplify the development of LLM-powered applications by providing consistent APIs, handling complex chaining, and integrating observability.

## Routers

A remote process that routes requests to the appropriate LLM based on specific logic or availability.

- **Primary Benefit**: Single API interface for multiple LLMs.
- **Example**: **OpenRouter** — provides access to 25+ models through a unified API.

## Abstraction Layers (Frameworks)

These layers sit in the local codebase and abstract the complexity of individual LLM calls.

### [LangChain](https://www.langchain.com/)
The industry-leading framework for developing applications powered by large language models.
- **LangSmith**: Tools for **LLMOps**, including debugging, evaluation, and monitoring.
- **LangServe**: Allows deploying LangChain chains as REST APIs.

### [LiteLLM](https://docs.litellm.ai/docs/)
A lightweight library to call 100+ LLM APIs (OpenAI, Anthropic, Gemini, Llama, huggingface, etc.) using the standard OpenAI format.

---

## Source References
- `raw/genai/frameworks.md` — Frameworks and Abstraction Layers overview.
