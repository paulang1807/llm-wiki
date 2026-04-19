---
title: "Open Source Models"
category: genai
tags: [open-source, llama, mistral, gemma, huggingface, transformers, diffusers, quantization]
sources: [raw/genai/open-src.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[Local LLM]], [[GenAI Frameworks]]
---

# Open Source Models

A guide to the open-source model landscape, primarily focused on the **Hugging Face** ecosystem, which provides the industry-standard tools for model distribution, inference, and quantization.

## Hugging Face Architecture

Hugging Face provides two primary levels of API interaction:

1.  **Pipelines**: High-level, "out-of-the-box" APIs for standard inference tasks.
2.  **Tokenizers and Models**: Low-level APIs for fine-grained control over model behavior and memory management.

---

## 🛠️ Inference Pipelines

Pipelines handle the complexity of tokenization, model execution, and post-processing in a single object.

### NLP Pipelines (`transformers`)
Supports tasks like sentiment analysis, NER, Q&A, summarization, and text generation.

```python
# Source: raw/genai/open-src.md
from transformers import pipeline

# Load a specific task pipeline
# Device: "cuda" (NVIDIA), "mps" (Mac), or -1 (CPU)
nlp = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device="cuda")

result = nlp("I love this product!")
print(result) # [{'label': 'POSITIVE', 'score': 0.999}]
```

### Diffusion Pipelines (`diffusers`)
Used for generating images, audio, and video.

```python
# Source: raw/genai/open-src.md
from diffusers import AutoPipelineForText2Image
import torch

# Load a Text-to-Image pipeline at half precision (float16) to save memory
pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-base-1.0", 
    torch_dtype=torch.float16, 
    variant="fp16"
).to("cuda")

image = pipe(prompt="A futuristic city in the clouds").images[0]
image.show()
```

---

## 🔡 Tokenizers & Templates

Tokenizers translate text into numeric IDs that LLMs can process.

- **Encode**: Text → Token IDs
- **Decode**: Token IDs → Text
- **Chat Templates**: Essential for formatting multi-turn conversations for specific model architectures (e.g., Llama-3, Mistral).

```python
# Source: raw/genai/open-src.md
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-1B-Instruct")

# Format a chat messages list into the model's required prompt format
messages = [{"role": "user", "content": "How does quantization work?"}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
```

---

## 📉 Advanced Quantization (bitsandbytes)

Quantization reduces model memory footprint (VRAM) by lowering weight precision (e.g., from 16-bit to 4-bit).

### 4-bit (NF4) Loading Example
Using `bitsandbytes` and `accelerate` to run a Llama-3.2 model on consumer hardware.

```python
# Source: raw/genai/open-src.md
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

# 1. Define Quantization Config
quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4"
)

# 2. Load model with 'auto' device mapping to split across available RAM/VRAM
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.2-1B-Instruct", 
    device_map="auto", 
    quantization_config=quant_config
)
```

## Source References
- `raw/genai/open-src.md` — Detailed guide on Hugging Face Pipelines, Tokenizers, and Quantization.
