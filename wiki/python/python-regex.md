---
title: "Python Regular Expressions"
category: python
tags: [python, regex, strings]
sources: [raw/python/regex.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Regular Expressions (`re`)

Regular expressions (regex) are a powerful tool for pattern matching and text manipulation. Python's `re` module provides full support for Perl-like regular expressions.

## 🛠️ Common Methods

| Method | Description |
| :--- | :--- |
| `re.match()` | Checks if the **beginning** of the string matches the pattern. |
| `re.search()` | Scans through the string to find the **first** location where the pattern matches. |
| `re.findall()` | Returns a **list** of all non-overlapping matches in the string. |
| `re.finditer()` | Returns an **iterator** yielding match objects for all non-overlapping matches. |
| `re.compile()` | Compiles a regex pattern into a reusable **regex object** for performance. |
| `re.split()` | Splits the string by the occurrences of the pattern. |
| `re.sub()` | Replaces pattern occurrences with a replacement string. |

> [!TIP]
> Always use **raw string literals** (e.g., `r"\d+"`) for regex patterns to avoid Python's escape character processing.

## 🔍 Identifiers

| Pattern | Description | Complement | Description |
| :---: | :--- | :---: | :--- |
| `\d` | Single digit (0-9) | `\D` | Non-digit |
| `\w` | Alphanumeric (`a-zA-Z0-9_`) | `\W` | Non-alphanumeric |
| `\s` | Whitespace (space, tab, newline) | `\S` | Non-whitespace |
| `\b` | Word boundary | `\B` | Non-word boundary |

## 🔢 Specifiers and Quantifiers

### Quantifiers
- `{n}`: Exactly `n` matches.
- `{m,n}`: Between `m` and `n` matches.
- `?`: Zero or one match.
- `*`: Zero or more matches (greedy).
- `+`: One or more matches (greedy).
- `*?` / `+?`: Non-greedy (minimal) versions of the above.

### Special Characters
- `.`: Any single character except `\n`.
- `^`: Matches start of the string.
- `$`: Matches end of the string.
- `|`: OR operator (e.g., `a|b`).
- `[abc]`: Matches any character in the set.
- `[^abc]`: Matches any character NOT in the set.

### 🛡️ Lookarounds
- `(?=...)`: Lookahead (pos) — matches if followed by pattern.
- `(?!...)`: Lookahead (neg) — matches if NOT followed by pattern.
- `(?<=...)`: Lookbehind (pos) — matches if preceded by pattern.
- `(?<!...)`: Lookbehind (neg) — matches if NOT preceded by pattern.

## 📦 Named Groups and Results

Using `(?P<name>...)` allows you to retrieve matches by name rather than index.

```python
import re

phone_pattern = re.compile(r'\W(?P<areacode>\d{3})\W\s(?P<prefix>\d{3})-(?P<number>\d{4})')
source = "Number is (333) 666-9999"

result = re.search(phone_pattern, source)
if result:
    print(result.group('areacode')) # Output: 333
    print(result.groups())          # Output: ('333', '666', '9999')
```

### Match Object Methods
- `span()`: Returns `(start, end)` tuple.
- `group()`: Returns the actual text matched.
- `groups()`: Returns a tuple containing all the subgroups.
