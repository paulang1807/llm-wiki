# LLM Wiki — Schema & Workflow

This file tells the LLM agent how to maintain the wiki. Read it at the start of every session.

## Domain
Software engineering, information technology, data science, machine learning, and AI/GenAI. The wiki covers both conceptual knowledge and practical code patterns.

## Directory Structure

```
llm-wiki/
├── raw/                    # IMMUTABLE source documents — LLM reads only, never modifies
│   ├── python/             # Python programming docs (from learn-python)
│   ├── ml/                 # Machine learning docs (from learn-ml)
│   ├── genai/              # Generative AI & NLP docs (from learn-genai)
│   └── assets/             # Images and binary attachments
├── wiki/                   # LLM-OWNED — all files here created and maintained by LLM
│   ├── python/             # Python concept and topic pages
│   ├── ml/                 # Machine learning topic pages
│   ├── genai/              # GenAI and NLP topic pages
│   ├── concepts/           # Cross-cutting concept pages (stats, math, data structures)
│   ├── index.md            # Master catalog of all wiki pages (update on every ingest)
│   ├── log.md              # Append-only activity log (update on every operation)
│   └── overview.md         # High-level synthesis of the entire knowledge base
├── CLAUDE.md               # This file — schema and workflow
└── README.md               # Human-readable setup and usage guide
```

**Critical rules:**
- `raw/` is immutable. Never write to it. Never modify files in it.
- `wiki/` is LLM-owned. You create, update, and maintain all files here.
- If a user wants to correct wiki content, they either update a raw source or update `CLAUDE.md`.
- Never delete wiki pages — mark them as `stale: true` in frontmatter instead.

## Frontmatter Schema

Every wiki page MUST have YAML frontmatter:

```yaml
---
title: "Page Title"
category: python | ml | genai | concepts
tags: [tag1, tag2, tag3]
sources: [raw/python/index.md, raw/python/oop.md]
confidence: 0.9          # 0.0–1.0, based on source quality and coverage
last_updated: YYYY-MM-DD
stale: false             # set true if source has been superseded
related: [[Other Page]], [[Another Page]]
---
```

## Page Types

### Topic Pages (`wiki/python/`, `wiki/ml/`, `wiki/genai/`)
One page per major topic or concept. Structure:
1. **Overview** — 1-3 sentence summary of what this is and why it matters
2. **Key Concepts** — bullet list of sub-concepts with brief explanations
3. **Code Patterns** — practical code examples extracted from source docs
4. **Relationships** — links to related wiki pages using `[[Page Name]]` syntax
5. **Source References** — links back to raw source files

### Concept Pages (`wiki/concepts/`)
Cross-cutting concepts that appear across multiple domains (e.g., statistics, probability, data preprocessing). Same structure as topic pages but emphasize cross-domain connections.

### `wiki/index.md` — Master Catalog
Updated on every ingest. Format:
```markdown
## Python
| Page | Summary | Tags | Updated |
|------|---------|------|---------|
| [[Python Basics]] | Core language features ... | python, fundamentals | 2026-04-19 |

## Machine Learning
...
```

### `wiki/log.md` — Activity Log
Append-only. Each entry:
```markdown
## [YYYY-MM-DD] operation | target
- Files touched: list of wiki pages created/updated
- Notes: anything notable
```

## Ingest Workflow

When told to "ingest" a source file or folder:
1. Read the source file(s) in `raw/`
2. Discuss key takeaways with user if interactive, otherwise proceed
3. Identify which existing wiki pages this content touches
4. Create new wiki page(s) for new topics
5. Update existing wiki pages to incorporate new information
6. Note contradictions with a `> ⚠️ Contradiction with [[Other Page]]` callout
7. Update `wiki/index.md` with any new/changed pages
8. Append an entry to `wiki/log.md`
9. A single ingest should typically touch 5–15 wiki pages

## Query Workflow

When asked a question:
1. Read `wiki/index.md` to identify relevant pages
2. Read those specific pages
3. Synthesize an answer with citations to wiki pages and raw sources
4. If the answer is valuable and reusable, offer to file it as a new wiki page
5. Append a query entry to `wiki/log.md`

## Lint Workflow

When told to "lint" the wiki:
1. Check for contradictions between pages
2. Find orphan pages (no inbound `[[links]]`)
3. Find concepts mentioned but lacking their own page
4. Flag pages with `confidence < 0.7`
5. Flag pages with `last_updated` older than 90 days
6. Suggest new sources to look for
7. Log findings in `wiki/log.md`

## Naming Conventions

- Wiki page filenames: lowercase kebab-case (`python-decorators.md`, `ml-regression.md`)
- Category prefixes: `python-`, `ml-`, `genai-`, no prefix for `concepts/`
- Tags: lowercase, hyphenated, specific (`time-series`, `deep-learning`, `rag`)
- Cross-links: always use `[[Page Title]]` Obsidian-style wikilinks

## OneNote Integration

When OneNote exports arrive in `raw/onenote/`:
1. Files will be in HTML or DOCX format converted to markdown via pandoc
2. Treat as any other raw source — read and ingest into relevant wiki pages
3. Note the source as `raw/onenote/[filename]` in frontmatter
4. Tag with `source:onenote` in addition to topic tags

## Code Example Conventions

Always preserve code examples from source docs. Format:
```python
# Brief description of what this does
# Source: raw/python/filename.md
from module import something
# ... example code
```

## Confidence Scoring Guide

| Score | Meaning |
|-------|---------|
| 0.9–1.0 | Well-sourced, multiple consistent sources, verified content |
| 0.7–0.9 | Single good source, content looks reliable |
| 0.5–0.7 | Sparse sourcing, needs more verification |
| < 0.5 | Mostly inferred, flag for review |
