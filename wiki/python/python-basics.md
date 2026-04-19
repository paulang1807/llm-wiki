---
title: "Python Basics"
category: python
tags: [python, fundamentals, functions, loops, generators, decorators, error-handling]
sources: [raw/python/index.md, raw/python/README.md]
confidence: 0.95
last_updated: 2026-04-19
stale: false
related: [[Python OOP]], [[Python Testing]], [[Python Regex]]
---

# Python Basics

Core Python language features covering functions, control flow, built-in patterns, and debugging. This is the reference page for foundational Python concepts.

## Key Concepts

### Magic Methods (Dunder Methods)
Special methods starting and ending with double underscores. Enable **operator overloading** — defining how custom objects behave with built-in operations.

| Method | Purpose |
|--------|---------|
| `__init__()` | Initialize objects (constructor) |
| `__new__()` | Create objects |
| `__str__()` | User-friendly string representation |
| `__repr__()` | Developer-friendly string representation |

- `dir(obj)` — lists all attributes and methods of an object
- `locals()` / `globals()` — inspect variable scopes

### Modules & `__name__`
- All code at indentation level 0 runs when a script is executed directly
- `__name__ == "__main__"` when script invoked directly; equals package name when imported

### Functions

**Map** — applies a function to every element of an iterable:
```python
list(map(get_len, lstStr))                    # Apply named function
list(map(lambda x: len(x), lstStr))          # Apply lambda
list(map(lambda x, y: x + y, lst1, lst2))   # Multiple iterables
```

**Filter** — returns elements where function returns `True`:
```python
list(filter(lambda x: x % 2 == 0, nums))    # Even numbers
```

**Lambda** — single-line anonymous functions:
```python
add_func = lambda x, y: x + y
```

### Loops

> 💡 Use `for` when iterating over known items; `while` when iteration count is unknown.

**Loop `else` clause** — executes when loop completes without hitting `break`:
```python
for item in collection:
    if condition:
        break
else:
    # runs if break was never hit
    handle_normal_completion()
```

**Loop control:**
- `pass` — do nothing, continue program
- `break` — exit innermost loop
- `continue` — jump to next iteration

### Decorators
Functions that wrap and modify other functions. Applied with `@decorator_name`.

```python
def sample_decorator(func_to_decorate):
    def wrapper_func():
        print("Before")
        func_to_decorate()
        print("After")
    return wrapper_func

@sample_decorator          # equivalent to: func = sample_decorator(func)
def my_func():
    print("Original function")
```

### Generators
Memory-efficient iterators — generate values one at a time with `yield` instead of storing everything in memory:

```python
def generate_numbers(n):
    for num in range(n):
        yield num              # yields one value at a time

for i in generate_numbers(100):
    print(i)

list(generate_numbers(100))   # materialise if needed
```

### User Input
```python
user_input = input("Prompt: ").strip()         # visible input
user_secret = getpass.getpass("Password: ")   # masked input
```

### Error Handling
```python
while True:
    try:
        # attempt something
    except SpecificError as e:
        continue           # retry
    except Exception as ex:
        continue           # catch-all
    else:
        break              # success — exit loop
    finally:
        pass               # always runs, even after break
```

## Debugging

### Python Debugger (pdb)
Interactive debugging — pause program, inspect variables, step through code:
```python
import pdb
pdb.set_trace()   # insert breakpoint here
# Type 'q' to quit pdb
```

## Relationships
- [[Python OOP]] — classes, inheritance, encapsulation
- [[Python Testing]] — unittest, doctest, pylint
- [[Python Regex]] — pattern matching with `re` module
- [[ML Workflow]] — Python is the primary language for ML pipelines

## Source References
- `raw/python/index.md` — main content
- `raw/python/README.md` — repo overview with Colab notebooks
