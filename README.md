# LLM Wiki — Personal Knowledge Base

A self-maintaining personal knowledge base covering **software engineering, information technology, data science, machine learning, and generative AI**.

Powered by Karpathy's LLM Wiki pattern — the LLM writes and maintains all wiki content; you curate sources and ask questions.

## Structure

```
llm-wiki/
├── raw/                    # Immutable source documents (LLM reads only)
│   ├── python/             # From learn-python repo
│   ├── ml/                 # From learn-ml repo
│   ├── genai/              # From learn-genai repo
│   └── onenote/            # OneNote exports (coming soon)
├── wiki/                   # LLM-maintained knowledge pages
│   ├── python/             # Python programming pages
│   ├── ml/                 # Machine learning pages
│   ├── genai/              # GenAI & NLP pages
│   ├── concepts/           # Cross-cutting concepts
│   ├── index.md            # ← START HERE — master catalog
│   ├── overview.md         # High-level synthesis
│   └── log.md              # Activity history
└── CLAUDE.md               # Schema & workflow rules for LLM
```

## Quick Start

### Browse the Wiki
Open this folder as an **Obsidian vault** — follow `[[wiki links]]` to navigate, use Graph View to see connections.

### Ask a Question
Start a session with your LLM agent (Claude Code, Cursor, etc.) and say:
```
Read CLAUDE.md and wiki/index.md, then answer: [your question]
```

### Add a New Source
1. Drop a markdown/PDF/HTML file into the appropriate `raw/` subfolder
2. Tell your LLM agent: `Ingest raw/[path/to/file]`
3. The agent will create/update wiki pages and update `wiki/index.md` and `wiki/log.md`

### Health-Check the Wiki
```
Read CLAUDE.md, then lint the wiki
```
The agent will find contradictions, orphan pages, and stale content.

## Source Repositories

| Source | Raw Path | What's In It |
|--------|----------|-------------|
| [learn-python](https://github.com/paulang1807/learn-python) | `raw/python/` | Python basics, OOP, regex, web scraping, databases, testing, Jupyter |
| [learn-ml](https://github.com/paulang1807/learn-ml) | `raw/ml/` | ML algorithms, statistics, time series, deep learning |
| [learn-genai](https://github.com/paulang1807/learn-genai) | `raw/genai/` | NLP, LLMs, prompting, RAG, agents, local inference |

## Adding OneNote Notes

1. In OneNote: **File → Export → Export as Word (.docx) or HTML**
2. Convert to markdown:
   ```bash
   # Install pandoc: https://pandoc.org/installing.html
   pandoc -f docx -t markdown -o raw/onenote/my-notes.md my-notes.docx
   # or from HTML:
   pandoc -f html -t markdown -o raw/onenote/my-notes.md my-notes.html
   ```
3. Clean up the markdown if needed (remove excess formatting)
4. Tell the LLM agent: `Ingest raw/onenote/my-notes.md`

## Key Wiki Pages

| Page | Description |
|------|-------------|
| `wiki/index.md` | Master catalog — start every session here |
| `wiki/overview.md` | Big-picture synthesis and gap analysis |
| `wiki/log.md` | Activity history |
| `CLAUDE.md` | Schema: conventions, workflow, frontmatter spec |

## Wiki Schema Highlights

- **Frontmatter**: Every page has `title`, `category`, `tags`, `sources`, `confidence`, `last_updated`, `stale`, `related`
- **Cross-links**: Obsidian `[[Page Name]]` syntax — works in graph view
- **Confidence scoring**: 0.0–1.0 based on source quality. Pages below 0.7 flagged during lint
- **Ingest rule**: One new source typically touches 5–15 wiki pages
- **Immutability**: Never edit `raw/` files — update source repos instead

## Conventions

- Raw files: **read only** — never modified by LLM
- Wiki files: **LLM-owned** — never manually edited (update raw sources instead)
- Corrections: update the raw source or add a note to `CLAUDE.md`
- If unsure whether to create a new page or update an existing one: update existing unless content is truly distinct enough to warrant its own page
