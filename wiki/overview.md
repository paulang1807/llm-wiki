---
title: "Wiki Overview"
category: meta
last_updated: 2026-04-19
---

# Knowledge Base Overview

A self-maintaining personal wiki covering software engineering, information technology, data science, machine learning, and generative AI, with specialized sections for infrastructure, DevOps, and web development.

**Current state:** 59 initial source files ingested. Expanded to 8 major categories.

---

## 🏗️ Domain Coverage

### core Language & Logic
- **Python**: Core language features, OOP, and practical library usage.
- **Concepts**: The mathematical and statistical foundations of computing and data science.

### data & AI
- **Machine Learning**: Classical algorithms, deep learning, and evaluation workflows.
- **Generative AI**: LLMs, prompting tactics, RAG pipelines, and agentic orchestration.
- **Data & Databases**: SQL, NoSQL, and big data processing (Spark).

### Infrastructure & Operations
- **Infrastructure**: Cloud services (AWS), networking, and cloud-native architecture.
- **DevOps**: Containerization (Docker), CI/CD, and infrastructure as code.
- **OS & Computing**: Unix/Linux systems, shell scripting, and CLI mastery.

### Development
- **Web Development**: Modern web patterns, frontend frameworks, and API design.

---

## 📥 Autonomic Ingestion Workflow

This wiki uses a **Self-Organizing Ingestion** pattern. To add knowledge:

1. Dump any raw note (markdown, HTML, DOCX) into `raw/inbox/`.
2. Ask the LLM agent to "Ingest inbox".
3. The agent autonomously analyzes the content, determines the category, and files it into the correct directory in `wiki/`.

---

## 💡 Compounding Connections

- **DevOps + Web**: Containerizing web application deployments.
- **Infra + Data**: Running Spark clusters on AWS.
- **Python + OS**: Automation scripts and system-level programming.
- **AI + Web**: Integrating LLM APIs into web interfaces.

---

## Recent Activity

Last ingest: **2026-04-19** — Initial setup and domain expansion to include Cloud, DevOps, and Big Data topics.
