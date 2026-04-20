---
title: "Python Jupyter & IPython"
category: python
tags: [python, jupyter, ipython, widgets, interactive]
sources: [raw/python/jup.md, raw/python/jup_snip.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Jupyter Notebook & IPython

IPython provides a rich interactive environment for Python, which is the foundation for Jupyter Notebooks.

## 🪄 Magic Commands
Magic commands are special functions that allow you to interact with the OS or perform internal notebook operations. Most can be used with "Automagic" (without the `%` prefix) if no variable name conflicts exist.

### Useful Magics
| Command | Description |
| :---: | :--- | 
| `%debug` | Enter the interactive debugger after an exception. |
| `%hist` | Print input (and optionally output) history. |
| `%load` | Load code from a file into a cell. |
| `%timeit` | Measure the execution time of a code snippet. |
| `%whos` | List all variables in the namespace with details. |
| `%reset` | Clear all variables from the current namespace. |

---

## 🏗️ Interactive Widgets (`ipywidgets`)
Widgets allow you to create interactive UI elements like sliders, dropdowns, and checkboxes directly in your notebook.

### Using `interact`
The simplest way to create a widget. It automatically infers the widget type from the argument type.

```python
from ipywidgets import interact, widgets

def f(x):
    return x

# Creates a slider (int inferred)
interact(f, x=10) 

# Creates a dropdown
interact(f, x=['option1', 'option2'])

# Using as a decorator
@interact(x=(0, 100, 5))
def g(x):
    return x
```

### Standalone Widgets
For more control, you can create and display widgets manually.

```python
import ipywidgets as widgets
from IPython.display import display

slider = widgets.IntSlider(value=50, min=0, max=100)
display(slider)

# Access value
print(slider.value)
```

---

## 🖼️ Advanced Display Functions

### HTML Dataframes
Display dataframes as professional HTML tables in the middle of a code chunk.

```python
from IPython.display import display, HTML
display(HTML(df.describe().to_html()))
```

### Images from URL
Download and display external images directly in a cell.

```python
from IPython.display import Image
Image(url='https://example.com/image.png')
```

## 📋 Session Management
To see all sessions and their security tokens:
- `jupyter notebook list`
- `jupyter labs list`
