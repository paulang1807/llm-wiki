---
title: "Prompting"
category: genai
tags: [prompting, few-shot, chain-of-thought, prompt-engineering, prompt-caching, openai, anthropic, gemini]
sources: [raw/genai/prompts.md, raw/genai/prompt-code.md, raw/genai/prompt-samples.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[AI Agents]], [[RAG]], [[GenAI Frameworks]]
---

# Prompting

Prompt engineering — the craft of designing inputs that get reliable, high-quality outputs from LLMs. Covers prompt types, structural tactics, specific techniques, and prompt caching.

## Prompt Types

| Type | Use When | Key Feature |
|------|----------|-------------|
| **Completion** | Single-turn tasks (summarise, Q&A, generate) | No conversation context needed |
| **Chat** | Multi-turn conversation | Maintains full history; has System/User/Assistant roles |

### Chat Prompt Roles
- **System** — defines the AI's task, persona, tone, and constraints (read once at start)
- **User** — the human's input
- **Assistant** — the AI's previous responses

## Prompt Structure

A well-structured prompt includes:

| Component | Description | Example Phrases |
|-----------|-------------|----------------|
| **Context** | Background, industry, keywords, datasets | "Here is some information for reference..." |
| **Persona** | Role the model should adopt | `Act as`, `Your role is to`, `Imagine you are` |
| **Goal/Intent** | What the prompt should accomplish | Action verbs: `Analyze`, `Generate`, `Summarize`, `Explain`, `Convert`, `Optimize` |
| **Output specs** | Format, audience, tone, length | JSON, markdown, "for a 10-year-old", "max 100 words" |
| **Clarify** | Ask for clarification questions if needed | "Ask me questions one at a time to..." |
| **Validate** | Reduce hallucination | "Find relevant information, then answer based only on that" |

> 💡 **Action verbs**: Analyze, Compare, Convert, Describe, Evaluate, Explain, Generate, Improve, Optimize, Proofread, Simplify, Summarize, Translate, Write

## Prompting Tactics

### Tactic 1: Use Delimiters
Clearly separate input data from instructions:
```
Summarise the text delimited by triple backticks into a single sentence.
```{text}```
```
Delimiters: `"""`, ` ``` `, `---`, `<>`, `<tag></tag>`

### Tactic 2: Request Structured Output
```
Generate a list of three movies with director and year.
Provide in JSON format with keys: Movie Name, Year of Release, Director.
```
Formats: JSON, HTML, Markdown table

### Tactic 3: Conditional Checking
```
If the text contains a mathematical equation, rewrite as numbered steps.
If it does not contain an equation, write "No equation provided."
```

### Tactic 4: Few-Shot Prompting
Show examples before asking. The model learns the pattern from examples:
```
<question>: Example question 1.
<answer>: Example answer 1.
<question>: Example question 2.
<answer>: Example answer 2.
<question>: Your actual question.
```
Use **stop sequences** (`` ``` ``, `---`) to delimit examples in few-shot prompts.

### Tactic 5: Step-by-Step Task Specification
```
Perform the following actions:
1 - Write a parable.
2 - Summarise it in a single line in Hindi.
3 - State the moral.
4 - Output a JSON object with keys: title, moral.
```

### Tactic 6: Chain-of-Thought (Work Out Own Solution First)
Prevents the model from jumping to conclusions:
```
First, work out your own solution to the problem.
Then compare your solution to the student's and evaluate correctness.
Do NOT decide if the student's answer is correct until you have solved it yourself.
```

## Common Prompt Patterns

| Pattern | Prompt |
|---------|--------|
| Summarise | "Summarise in X bullet points..." |
| Compare | "Compare and contrast A and B" |
| Explain | "Explain X using Y analogy, for a layman" |
| Translate | "Translate from [language] to [language]" |
| Proofread | "Proofread and correct any errors in the following" |
| Follow up | "Provide 3 alternate versions of the above" / "Make the content more [tone]" |
| Validate | "Provide sources and citations for your claims" |

## Code Embedding
```
Some context text.
`python
some_python_code()
`
More text.
```

## Prompt Caching
Caching reuses expensive prefix computations to save cost. **Always put static content (instructions, examples) at the START, variable content at the END.**

| Provider | Cache Trigger | Cost |
|----------|-------------|------|
| **OpenAI** | Exact prefix match (automatic) | Cached input = 4× cheaper |
| **Anthropic** | Explicit — you declare what to cache | 25% MORE to prime; 10× LESS to reuse |
| **Gemini** | Implicit (automatic) + explicit option | Explicit = cost saving guarantee |

### Anthropic Cache Tip
```python
# Put large/static content first for better cache hits
# e.g., system prompt + reference docs → then user query
```

## Relationships
- [[LLM Concepts]] — temperature, Top P affect prompt output
- [[AI Agents]] — agents use structured system prompts + tool descriptions
- [[RAG]] — RAG-augmented prompts inject retrieved context before the user query
- [[GenAI Frameworks]] — LangChain and LlamaIndex have prompt template abstractions

## Source References
- `raw/genai/prompts.md` — prompt types, tactics, caching
- `raw/genai/prompt-code.md` — code examples (Ollama, OpenAI, Anthropic)
- `raw/genai/prompt-samples.md` — example prompts by use case
