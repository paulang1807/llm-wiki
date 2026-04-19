---
title: "Python Testing"
category: python
tags: [python, testing, unittest, doctest, pylint, tdd]
sources: [raw/python/index.md]
confidence: 0.92
last_updated: 2026-04-19
stale: false
related: [[Python Basics]], [[Python OOP]]
---

# Python Testing

Testing strategies and tools for Python code. Covers style checking, unit testing, and docstring testing.

## Code Style — Pylint

Checks code quality, style (PEP 8), and basic logic errors. Generates a rating out of 10.

```bash
pylint python_file_name.py
```

## Unit Testing — unittest

Built-in module for automated testing:

```python
import unittest
import module_to_test

class TestModule(unittest.TestCase):
    def test_function_one(self):
        expected = 'some value'
        result = module_to_test.function(params)
        self.assertEqual(result, expected)

    def test_function_two(self):
        self.assertIsNotNone(module_to_test.other_function())
        self.assertRaises(ValueError, module_to_test.func_that_raises)

if __name__ == '__main__':
    unittest.main()
```

**Common assertions:**
| Method | Checks |
|--------|--------|
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` | `bool(x) is True` |
| `assertRaises(exc, fn)` | `fn()` raises `exc` |
| `assertIsNone(x)` | `x is None` |
| `assertIn(a, b)` | `a in b` |

## Doctest

Runs code examples embedded in docstrings:
```python
def add(a, b):
    """
    Add two numbers.
    >>> add(2, 3)
    5
    >>> add(-1, 1)
    0
    """
    return a + b

if __name__ == '__main__':
    import doctest
    doctest.testmod()
```

## Test Layout Best Practices
- One test file per module: `test_module_name.py`
- Test method names start with `test_`
- Each test should test one thing
- Use `setUp()` / `tearDown()` for shared state

## Relationships
- [[Python Basics]] — functions, error handling you'll be testing
- [[Python OOP]] — testing class methods and inheritance

## Source References
- `raw/python/index.md` — testing section
