# Object-Oriented Programming (OOP)

This page covers the fundamental concepts of OOP in Python using the example script `class_boilerplate.py`.

## [Classes and Objects](../code-samples/class_boilerplate.py#L4-L7)

A class is a blueprint for creating objects. Objects are instances of a class. It can contain **class level object attributes** which are same irrespective of instance.

```python
class ParentClass():
    # class level object attribute
    classAttr1 = 'same irrespective of instance'
```

## [The Constructor `__init__`](../code-samples/class_boilerplate.py#L8-L19)

The constructor method is called when an object of the class is created. It initializes the instance variables and can take parameters. 

```python
def __init__(self, var1="Val1", var2=True, **kwargs):
    for key, value in kwargs.items():
        # set self.key = value
        setattr(self,key,value)
    
    self.var1 = var1
    self.var2 = var2
```

## [Encapsulation](../code-samples/class_boilerplate.py#L20-L31)

Encapsulation involves bundling data and methods that operate on that data within a single unit. Python uses naming conventions to indicate visibility, though it does not have "true" private and protected variables.

### [Private Variables](../code-samples/class_boilerplate.py#L20-L24)
Private variables **CANNOT** be accessed outside the class. They are name-mangled to make accidental access harder (e.g., accessible as `_ParentClass__varP1`).

### [Protected Variables](../code-samples/class_boilerplate.py#L26-L31)
Protected variables are intended for internal use only. They are accessible in derived classes or subclasses and also from outside the class if you know the name.

```python
self.__varP1 = "private variable" 
self._varP2 = "protected variable"  
```

## [Methods](../code-samples/class_boilerplate.py#L37-L47)

### [Class Methods](../code-samples/class_boilerplate.py#L38-L41)
General class methods receive the class (`cls`) as the first argument and can access class level attributes.

### [Static Methods](../code-samples/class_boilerplate.py#L43-L47)
General static methods do not receive an implicit first argument.

```python
@classmethod
def class_meth1(cls):
    return f"class meth1 ret val: {cls.classAttr1}"

@staticmethod
def static_meth1():
    """Return a static method example string."""
    return "static meth1 ret val: static"
```

## [Inheritance](../code-samples/class_boilerplate.py#L71-L80)

Inheritance allows a class (subclass) to inherit attributes and methods from another class (superclass). The `super().__init__` call is used to initialize the parent class.

```python
class InheritedClass(ParentClass):
    def __init__(self, valX, valY, localvalX):
        # ...
        # Initialize parent class
        super().__init__(**data)
```

## [Multiple Inheritance and MRO](../code-samples/class_boilerplate.py#L116-L118)

Multiple inheritance can lead to the **diamond problem**, where a method is inherited from multiple parent classes. Python uses the **C3 linearization algorithm** to resolve this, ensuring a consistent **Method Resolution Order (MRO)**.

The order of inheritance matters, as it determines the MRO. In the case of `MultInheritedClass(ParentClass, ParentClass2)`, `ParentClass` will be checked first for methods and attributes.

```python
# [class_boilerplate.py:L148-154](../code-samples/class_boilerplate.py#L148-L154)
class MultInheritedClass(ParentClass, ParentClass2):
    def __init__(self, valX, valY, valX2, localvalX):
        self.localvalX = localvalX
        # Initialize parent classes
        ParentClass.__init__(self, var1=valX, var2=valY)
        ParentClass2.__init__(self, var1=valX2)
```

## [Polymorphism](../code-samples/class_boilerplate.py#L48-L52)

Polymorphism allows methods to be overridden in subclasses to provide a specific implementation. A method can have the same name as a method in the parent class but provide a different implementation.

```python
# [class_boilerplate.py:L88-89](../code-samples/class_boilerplate.py#L88-L89)
def subclass_meth(self):
    print("A method with same name exists in the second inherited class as well")
```

## [Abstract Base Classes (ABC)](../code-samples/class_boilerplate.py#L121-L140)

Abstract Base Classes are used to define a common interface for subclasses. An **abstract method** usually does not have an implementation in the parent class; subclasses **must** implement it to provide a specific implementation. This enforces that subclasses adhere to a contract.

If a subclass does not implement an abstract method, it will raise a `NotImplementedError` when instantiated.

```python
class ParentClass2(ABC):
    @abstractmethod
    def abs_meth(self):
        pass
```

## [Magic Methods](../code-samples/class_boilerplate.py#L67-L70)

Special methods that start and end with double underscores, providing "magic" functionality.

- **`__str__`**: Prints a user-friendly message when the class name is being printed.
- **`__del__`**: The opposite of `__init__`. Used for cleanup or to destroy the object; automatically called at the end of the program.

```python
def __str__(self):
    # Print user friendly message when the class name is being printed
    return f"Class name is {self.__class__.__name__}"
```
