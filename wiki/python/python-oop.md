---
title: "Python OOP"
category: python
tags: [python, programming, oop]
sources: [raw/python/oop.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Object-Oriented Programming (OOP)

This page covers the fundamental concepts of OOP in Python, focusing on classes, inheritance, and advanced patterns like Abstract Base Classes.

## 🏗️ Classes and Objects

A **class** is a blueprint for creating objects. **Objects** are instances of a class.

### Class Level Attributes
Attributes that are shared across all instances of a class.

```python
class ParentClass():
    # class level object attribute
    classAttr1 = 'same irrespective of instance'
```

### The Constructor (`__init__`)
The constructor method initializes the instance variables when an object is created.

```python
def __init__(self, var1="Val1", var2=True, **kwargs):
    for key, value in kwargs.items():
        setattr(self, key, value)
    
    self.var1 = var1
    self.var2 = var2
```

## 🔒 Encapsulation
Python uses naming conventions to indicate variable visibility, though absolute privacy is not enforced by the language.

- **Private Variables (`__var`)**: Cannot be easily accessed outside the class (uses name mangling).
- **Protected Variables (`_var`)**: Intended for internal use and accessible in subclasses.

```python
self.__varP1 = "private variable" 
self._varP2 = "protected variable"  
```

## 🛠️ Method Types

| Type | Decorator | Purpose |
| :--- | :--- | :--- |
| **Class Method** | `@classmethod` | Receives `cls` as first argument; accesses class-level state. |
| **Static Method** | `@staticmethod` | No implicit first argument; behaves like a regular function. |

## 🧬 Inheritance and Polymorphism

### Inheritance
Subclasses inherit attributes and methods from a superclass. Use `super().__init__` to initialize the parent class.

### Multiple Inheritance and MRO
Python uses the **C3 linearization algorithm** to resolve method resolution order (MRO) in multiple inheritance scenarios (addressing the "diamond problem").

```python
class MultInheritedClass(ParentClass, ParentClass2):
    def __init__(self, valX, valY, valX2, localvalX):
        # Explicit initialization of parent classes
        ParentClass.__init__(self, var1=valX, var2=valY)
        ParentClass2.__init__(self, var1=valX2)
```

### Polymorphism
Polymorphism allows subclasses to provide specific implementations for methods defined in parent classes.

## 📋 Abstract Base Classes (ABC)
Used to define a contract for subclasses. If a subclass fails to implement an `@abstractmethod`, it cannot be instantiated.

```python
from abc import ABC, abstractmethod

class ParentClass2(ABC):
    @abstractmethod
    def abs_meth(self):
        pass
```

## ✨ Magic Methods
Special methods that start and end with double underscores (`dunder`).

- `__str__`: Returns a user-friendly string representation.
- `__del__`: Called when an object is destroyed (destructor).

```python
def __str__(self):
    return f"Class name is {self.__class__.__name__}"
```
