# LLM Wiki — Personal Knowledge Base

A self-maintaining personal knowledge base covering **software engineering, cloud infrastructure, data science, machine learning, and AI**.

Powered by Karpathy's LLM Wiki pattern — the LLM writes and maintains all wiki content; you curate sources and ask questions.

![LLM Wiki Web UI Demo](./assets/wiki_ui_overview.webp)

## 🏗️ Structure

```
llm-wiki/
├── raw/                    # IMMUTABLE source documents (LLM reads only)
│   ├── inbox/              # ← DUMPING GROUND — drop all new notes here
│   ├── python/             # Python programming docs
│   ├── ml/                 # Machine learning docs
│   ├── genai/              # Generative AI & NLP docs
│   └── onenote/            # OneNote exports
├── wiki/                   # LLM-MAINTAINED knowledge pages
│   ├── python/             # Python programming
│   ├── ml/                 # Machine learning
│   ├── genai/              # Generative AI & NLP
│   ├── infra/              # AWS, Cloud, Networking
│   ├── devops/             # Docker, CI/CD, Containers
│   ├── data/               # Spark, Big Data, Databases
│   ├── web/                # Web Development
│   ├── os/                 # Unix/Linux & Shell
│   ├── index.md            # ← START HERE — master catalog
│   ├── overview.md         # High-level synthesis
│   └── log.md              # Activity history
├── ui/                     # Web UI Application
└── CLAUDE.md               # Schema & workflow rules for LLM
```

## 🚀 Quick Start

### 1. View the Wiki (Web UI)
The wiki comes with a premium, interactive Web UI.
- **Access**: [http://localhost:3737](http://localhost:3737)
- **Features**: Hierarchical navigation, **Global Search** (press `/`), and an **Interactive Knowledge Graph**.

### 2. The "Dumping Ground" Workflow
You don't need to organize your raw notes. 
1. Drop any markdown, HTML, or DOCX file into **`raw/inbox/`**.
2. Tell your LLM agent: `Ingest inbox`
3. The agent will autonomously classify the topic and organize it into the correct `wiki/` subdirectory.

### 3. Ask a Question
Start a session with your LLM agent (Claude Code, etc.) and say:
```
Read CLAUDE.md and wiki/index.md, then answer: [your question]
```

## 🛠️ Maintenance

### Health-Check the Wiki
```
Read CLAUDE.md, then lint the wiki
```
The agent will find contradictions, orphan pages, and stale content.

### Adding OneNote Notes
1. In OneNote: **File → Export → Export as Word (.docx) or HTML**.
2. Convert to markdown: `pandoc -f docx -t markdown -o raw/onenote/notes.md notes.docx`.
3. Tell the LLM agent: `Ingest raw/onenote/notes.md`.

## 🧠 Wiki Schema Highlights
- **Autonomic Ingestion**: The AI determines categorization based on content analysis, not source path.
- **Confidence Scoring**: Pages are rated 0.0–1.0 based on sourcing quality.
- **Cross-links**: Uses standard Obsidian `[[Page Title]]` syntax for graph connectivity.
- **Immutability**: `raw/` files are never modified by the AI; `wiki/` files are never edited by humans.

## 📁 Knowledge Domains
- **Infrastructure**: AWS Services, Cloud-native patterns.
- **DevOps**: Docker, Containerization, Orchestration.
- **Data**: Spark, Big Data, Database systems.
- **Web**: Frontend, Backend, API Design.
- **OS**: Unix/Linux mastery, Shell scripting.
- **Python, ML, GenAI**: Deep language and AI foundations.
