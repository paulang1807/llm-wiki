---
title: "Python File IO & System"
category: python
tags: [python, files, io, system, automation]
sources: [raw/python/file.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python File IO & System Operations

Python provides several modules (`os`, `shutil`, `pathlib`) for interacting with the file system and performing input/output operations.

## 📂 File System Manipulation

### Traversal and Metadata (`os`)
```python
import os

# Context
cwd = os.getcwd()
os.chdir('../') # Move up

# Existence
os.path.exists('file.txt')
os.path.isfile('path') # True if file
os.path.isdir('path')  # True if directory

# Deep Traversal
for (root, dirs, files) in os.walk(top_path):
    for f in files:
        if f.endswith('.csv'):
            print(os.path.join(root, f))
```

### Copy and Move (`shutil`)
```python
import shutil

# Copying
shutil.copyfile("src.txt", "dst.txt")
shutil.copytree("src_dir", "dst_dir", dirs_exist_ok=True)

# Moving
shutil.move("old_path", "new_path")
```

### Safe Deletion
- **Hard Delete**: `os.unlink(path)` or `os.rmdir(path)`
- **Soft Delete (Trash)**: `send2trash.send2trash(path)` (Recommended)

---

## 🗄️ File Read & Write

### Standard Text Files
The `with` statement ensures the file is properly closed after operations.

| Mode | Description |
| :---: | :--- | 
| `r` | Read (default) |
| `w` | Write (overwrites) |
| `a` | Append |
| `w+` | Read and Write |
| `rb`/`wb` | Binary mode |

```python
with open('data.txt', 'r') as f:
    # Read entire file
    content = f.read()
    
    # Read line by line
    for line in f:
        print(line.strip())

with open('output.txt', 'w') as f:
    f.write("Line 1\n")
    f.writelines(["Line 2\n", "Line 3\n"])
```

### CSV Operations
```python
import csv

# Reading
with open('data.csv', 'r') as f:
    reader = csv.reader(f)
    lines = list(reader) # List of lists

# Writing
with open('output.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Header1', 'Header2'])
    writer.writerows([['V1', 'V2'], ['V3', 'V4']])
```

---

## 🤐 Compression

### Single Files (`zipfile`)
```python
import zipfile

with zipfile.ZipFile('archive.zip', 'w') as z:
    z.write('file.txt', compress_type=zipfile.ZIP_DEFLATED)

# Extract
with zipfile.ZipFile('archive.zip', 'r') as z:
    z.extractall('extracted_folder')
```

### Folders (`shutil`)
```python
import shutil

# Zip folder
shutil.make_archive('output_zip', 'zip', 'source_folder')

# Unzip folder
shutil.unpack_archive('archive.zip', 'destination', 'zip')
```
