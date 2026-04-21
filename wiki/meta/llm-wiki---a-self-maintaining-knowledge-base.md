---
title: LLM Wiki - A Self-Maintaining Knowledge Base
category: meta
tags: [llm wiki, knowledge base, rag, ai assistant, automated ingestion, graph visualization, python, gemini, ollama, workflow, self-maintaining, architecture, software engineering, personal knowledge management]
confidence: 1.0
related:
  - [[Retrieval Augmented Generation (RAG)]]
  - [[Large Language Models (LLMs)]]
  - [[Python]]
  - [[Ollama]]
  - [[Google Gemini]]
sources:
  - README.md
---
# LLM Wiki: A Self-Maintaining Knowledge Base

The LLM Wiki is a next-generation personal knowledge base designed for software engineering, cloud infrastructure, data science, machine learning, and AI. It operates on the principle of automated AI ingestion complemented by human curation.

## Core Features

*   **"Ask the Wiki" (RAG)**: An integrated AI assistant utilizing semantic search and Retrieval Augmented Generation (RAG) to provide context-aware responses from the knowledge base.
*   **Autonomic Ingestion**: AI automatically classifies, archives, and cross-links raw notes dropped into an inbox, streamlining knowledge organization.
*   **Interactive Graph**: A real-time BFS/DFS graph explorer visualizes connections between knowledge domains.
*   **Global Instant Search**: Provides millisecond-fast search across all categories and raw source documents.
*   **Premium Aesthetics**: Features a glassmorphic UI with dark mode, fluid animations, and a modern design system.

## Architecture

The system employs a lightweight, high-performance architecture:

*   **Backend**: A zero-external-dependency Python server (`http.server` + `urllib`).
*   **AI Engine**: Supports multiple providers, with Google Gemini as the default and Ollama available for offline fallback.
*   **Frontend**: Built with vanilla JavaScript and CSS transitions for efficiency.
*   **Structure**:
    *   `raw/`: Stores immutable source documents.
    *   `wiki/`: Contains AI-generated and human-maintained summaries.
    *   `tests/`: Comprehensive unit tests for RAG, API, and core logic.

## Workflow: The Inbox Pattern

The ingestion workflow is designed for simplicity:

1.  **COLLECT**: Place any note (Markdown, Text, HTML, RTF) into the `raw/inbox/` directory.
2.  **PROCESS**: Trigger AI ingestion via a command (e.g., `Ingest inbox`), optionally specifying a historical date.
3.  **MANAGE**: Directly update or create wiki pages through the web UI.
4.  **QUERY**: Use the built-in "Ask AI" drawer for natural language queries across the entire knowledge base.

## Meta-Management

The LLM Wiki includes advanced meta-management features to maintain knowledge quality and relevance:

*   **Confidence Scoring**: Each wiki page is assigned a `confidence` score (0.0–1.0) based on source coverage.
*   **Chrono-Accuracy**: Supports historical backdating and automatic modification time (`mtime`) fallbacks for accurate timelines.
*   **Pruning & Archiving**:
    *   `stale: true` frontmatter flag removes pages from search/RAG without deletion.
    *   Moving files to `archive/` permanently decommissions them while preserving history.
*   **Stale Detection**: Automated flagging of pages that haven't been updated after relevant new sources are added.
*   **Graph Metadata**: Automatic extraction of tags and categories for dynamic visualization.