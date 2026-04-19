---
title: "LLM Concepts"
category: genai
tags: [llm, gpt, fine-tuning, quantization, training, inference, parameters]
sources: [raw/genai/concepts.md, raw/genai/index.md, raw/genai/README.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[NLP Basics]], [[RAG]], [[Prompting]], [[AI Agents]], [[Local LLM]]
---

# LLM Concepts

Core concepts for understanding, configuring, and working with Large Language Models (LLMs). Covers architecture types, training phases, API parameters, and quantization.

## Terminology

| Term | Definition |
|------|-----------|
| **GPT** | Generative Pre-Trained Transformers |
| **GAN** | Generative Adversarial Networks |
| **VAE** | Variational Autoencoders (used in anomaly detection) |
| **RLHF** | Reinforcement Learning from Human Feedback |
| **RAG** | Retrieval Augmented Generation |
| **Multimodal AI** | Accepts inputs from multiple data types (images, video, audio, text) |
| **Context Window** | Max tokens the model can consider at once (includes full conversation) |
| **Inference Time Scaling** | Improving output quality by increasing compute at inference vs. training time |

## LLM Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| **Base** | Requires examples/instructions; responds by completing the prompt | Fine-tuning, skill learning |
| **Chat / Instruct** | Context-aware; tuned for conversation | Interactive apps, content generation |
| **Reasoning / Thinking** | Prompted to think step-by-step; may use `wait` to force re-analysis | Complex problem solving |

> 💡 Adding the word `wait` in reasoning model instructions can trigger the model to re-analyze its own thinking process, often improving output quality.

## Training Phases

1. **Pre-Training** — trained on massive text corpus; produces a parameter file (e.g., LLaMA 2 = 10TB data → 140GB params). Open-source models include a run file (C or Python) alongside the parameters.

2. **Fine-Tuning** — trained on ~100K high-quality Q&A pairs to specialize the model. Reduces hallucinations, improves instruction following, allows smaller models to outperform larger base models on specific tasks. ChatGPT uses SGD (Stochastic Gradient Descent).

3. **Reinforcement Training (RLHF)** — model learns from feedback on response quality.

## API Parameters

| Parameter | Range | Default | Effect |
|-----------|-------|---------|--------|
| **Max Tokens** | 0–2048+ | varies | Controls max response length |
| **Temperature** | 0–2 | 0.8 | Higher = more creative/random; Lower = more deterministic |
| **Top P** | 0–1 | 0.95 | Nucleus sampling — limits vocab to top P% of probable tokens |
| **Frequency Penalty** | -2 to 2 | 0 | Penalises repeated tokens |
| **Presence Penalty** | -2 to 2 | 0 | Encourages introducing new topics |

### Recommended Parameter Settings by Use Case

| Use Case | Temperature | Top P |
|----------|------------|-------|
| Chatbot | 0.5 | 0.5 |
| Code generation | 0.2 | 0.1 |
| Code comments | 0.3 | 0.2 |
| Creative writing | 0.7 | 0.8 |
| Data analysis scripts | 0.2 | 0.1 |
| Exploratory code | 0.6 | 0.7 |

Process of reducing weight precision to lower memory/compute requirements without significant accuracy loss. Key for running LLMs on edge/consumer devices.

**NF4 Quantization** — uses only 4 bits (vs. standard 16 bits) per weight using a "high-intelligence" rounding scheme. 

> 💡 See [[Open Source Models]] for a concrete code implementation using `bitsandbytes` and `NF4`.

Benefits:
- Reduced VRAM footprint
- Faster inference
- Lower compute cost

## Custom GPTs
- Pre-configured GPTs with specific instructions baked in
- Reusable without repeating setup instructions
- Invokable via `@mentions` in supporting platforms

## Relationships
- [[RAG]] — technique to extend LLM knowledge without retraining
- [[Prompting]] — controlling LLM behavior through input design
- [[AI Agents]] — LLMs as reasoning cores in autonomous systems
- [[Local LLM]] — running LLMs on local hardware
- [[NLP Basics]] — foundational concepts that LLMs build on
- [[Open Source Models]] — model landscape and options

## Source References
- `raw/genai/concepts.md` — LLM concepts, training, API parameters, quantization
- `raw/genai/index.md` — NLP building blocks, tokenization, RAG
- `raw/genai/README.md` — Colab notebooks for hands-on learning
