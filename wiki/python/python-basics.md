---
title: "Python Basics"
category: python
tags: [python, programming, basic]
sources: [raw/python/bas_snip.md, raw/python/setup.md, raw/python/index.md, raw/python/use-mod.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python OOP], [Python File IO]]
---

# Python Foundations

A comprehensive guide to starting with Python, covering environment setup, core language features, and essential standard library modules.

## 🛠️ Environment Setup

### Virtual Environments (`venv`)
Isolate your project dependencies from the global Python installation.

```bash
# Create the environment
python -m venv my-env

# Activate (macOS/Linux)
source my-env/bin/activate

# Deactivate
deactivate
```

## ✨ Core Language Features

### Magic Methods (`dunder`)
Special methods that start and end with double underscores (`__`). They allow operator overloading and custom object behavior.

- `__init__`: Instance initialization.
- `__str__`: User-friendly string representation.
- `__repr__`: Developer-friendly string representation.
- `__len__`: Defines behavior for `len(obj)`.

### Exception Handling
Use `try-except-else-finally` blocks to handle errors gracefully.

```python
try:
    # Code that might raise error
    result = 10 / 0
except ZeroDivisionError:
    # Specific error handling
    print("Cannot divide by zero")
except Exception as e:
    # General error handling
    print(f"Error: {e}")
else:
    # Executes if no error occurred
    print("Success")
finally:
    # Always executes
    print("Cleanup")
```

---

## 🧰 Essential Standard Libraries

### Collections
Specialized container datatypes.
- **Counter**: Dict subclass for counting hashable objects.
- **NamedTuple**: Lightweight data structures similar to classes.

```python
from collections import Counter, namedtuple

# Counter
c = Counter('abracadabra')
print(c.most_common(2)) # [('a', 5), ('r', 2)]

# NamedTuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)
```

### Datetime & Time
```python
import datetime

today = datetime.date.today()
now = datetime.datetime.now()
delta = datetime.timedelta(days=7)
next_week = today + delta
```

### Random
```python
import random

num = random.randint(1, 10)
choice = random.choice(['A', 'B', 'C'])
random.shuffle(my_list) # In-place shuffle
```

## 🧪 Testing & Debugging
- **Pylint**: Static code analysis and style checking.
- **Unittest**: Built-in framework for automated testing.
- **PDB**: Python's interactive debugger (`pdb.set_trace()`).
