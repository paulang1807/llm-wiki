---
title: "Python Databases"
category: python
tags: [python, databases, sqlite, sql]
sources: [raw/python/db.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Database Integration

Python includes a built-in library for [SQLite](https://sqlite.org/index.html), a lightweight, disk-based database that doesn't require a separate server process.

## 🛢️ SQLite (`sqlite3`)

The standard approach is to use a context manager (`with`) to handle the connection, ensuring that changes are committed or rolled back correctly.

### Basic CRUD Operations

```python
import sqlite3

DB_NAME = "knowledge.db"

# 1. Connect and Create Table
with sqlite3.connect(DB_NAME) as conn:
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            content TEXT,
            priority REAL
        )
    ''')
    conn.commit()

# 2. Insert with Upsert Logic (ON CONFLICT)
with sqlite3.connect(DB_NAME) as conn:
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO notes (id, content, priority) 
        VALUES (?, ?, ?) 
        ON CONFLICT(id) DO UPDATE SET content = excluded.content
    ''', ('note_1', 'Sample content', 1.0))
    conn.commit()

# 3. Querying Data
with sqlite3.connect(DB_NAME) as conn:
    cursor = conn.cursor()
    
    # Fetch Single
    cursor.execute('SELECT content FROM notes WHERE id = ?', ('note_1',))
    row = cursor.fetchone()
    if row:
        print(f"Content: {row[0]}")
    
    # Fetch All
    cursor.execute('SELECT * FROM notes')
    rows = cursor.fetchall()
    for row in rows:
        print(row)
```

## 🛠️ Key Methods
- `cursor.execute()`: Runs a single SQL statement.
- `cursor.executemany()`: Runs a SQL command against all parameter sequences in a list.
- `conn.commit()`: Saves changes to the database.
- `cursor.fetchone()` / `fetchall()`: Retrieves query results.
