## Strings
```python
# Reverse word
word[::-1]

# Check if a string ends with a certain character/string
word.endswith('<char or string to test>')
```
```python
# Print all letters in the alphabet
string.ascii_lowercase
```
```python
# Capitalize the first alphabet of the first word in a sentence
text.capitalize()

# Capitalize the first alphabet of the all words in a sentence
text.title()
```
```python
# String check methods
isalnum() # returns True if all characters are alphanumeric

isalpha() # returns True if all characters are alphabetic

islower() # returns True if all cased characters are lowercase and there is at least one cased character

isupper() # returns True if all cased characters are uppercase and there is at least one cased character

isspace() # returns True if all characters are whitespace

istitle() # returns True if the string is title cased and there is at least one character
```

## [Variables](../#variables)
```python
# Get value of a variable whose name is stored in another variable

# variable whose value we want to get
var1Path = "Path for var1"  
var2Path = "Path for var2"  

# derived variable whose value depends on another temporary variable 'tempVar'
# it will result in the name of one of the varibales above
# for example, if tempVar = "var1", derivedVar will be "var1Path"
derivedVar = f"{tempVar}Path" 

# get the value of var1Path or var2Path
globals()[derivedVar] 
```


## Lists
```python
# Remove items in a list from another list
filtered_list = list(set(src_list).difference(remove_list))
```
```python
# Sorting
a_list = ['1', '5', '9', '11', '2', '100', '4']
# sort as if item is a string
a_list.sort()
# ['1', '100', '11', '2', '4', '5', '9']

# determine sort postition based on int value
a_list.sort(key=int)
# ['1', '2', '4', '5', '9', '11', '100']

b_list = ["Ajay", "basic", "Barnie", "alice"]
# sort alpha with uppercase
b_list.sort()
# ['Ajay', 'Barnie', 'alice', 'basic']

# sort but ignore uppercase
b_list.sort(key=str.lower)
# ['Ajay', 'alice', 'Barnie', 'basic']

```

## Dictionaries
```python
# Get value from a dict key
c = {}
c.get('some key',<default_value>) # returns the default_value if the key is not present

# The above can be achived using defaultdict as well
from collections import defaultdict
d = defaultdict(lambda: <default_value>)
d['some key']


# Print first n items in a dict
from itertools import islice
list(islice(my_dict.items(), n))
```

## Sets
```python
# Create a set
s1 = s2 = set()
s1 = {1,1,2,3,4,4,5}    # printing s1 returns {1,2,3,4,5}

# Add an element
set1.add(<element to add>)

# Remove an element
set1.discard(<element to remove>)

# Union of two sets. Returns a new set which is the union of the two sets
set1.union(set2)

# Updates set1 with the union of set 1 and 2
set1.update(set2)

# Empty a set
set1.clear()
```
```python
# Set comparison methods

set1.difference(set2)    # Returns elements in set1 that are not present in set2

set1.difference_update(set2)    # Return all elements in a set after removing matching elements from another set

set1.symmetric_difference(set2)    # Returns all elements present in only one of the two sets

set1.intersection(set2)    # Intersection between two sets

set1.intersection_update(set2)    # Return all elements in a set with matching elements from another set

set1.isdisjoint(set2) # Returns True if there is no common element between the two sets

set1.issubset(set2)    # Check if set1 is a subset of set2

set1.issuperset(set2)    # Check if set1 is a superset of set2
```

## Functions
```python
# Check if a function exists
# Using callable()
if callable(<function name>):
    <function name>()
# Using globals()
str_func = "func_name"
if str_func in globals():    # Check if the function exists
    globals()[str_func]()   # Call the function

# Pass arbitrary number of args to function
# Using positional arguments
def myFunc(*args):
    print(list(args))
myFunc(1,2,"abc")

# Using keyword arguments
def myFunc(**kwargs):
    print(kwargs)
myFunc(arg1="val1",arg2="val2")

# Using both together
def myFunc(*args, **kwargs):
    print(list(args))
    print(kwargs)
myFunc(1,2,"abc",arg1="val1",arg2="val2")
```
```python
# Convert a list of numbers to string
list(map(str,input_list))
```

## Loops
```python
# Make loops show a smart progress meter
from tqdm import tqdm
tqdm(iterable)
```

## Generators
```python
def generate_fibonnaci(n):
    """
    Generate a fibonnaci sequence up to n
    """
    a = 1
    b = 1
    for i in range(n):
        yield a
        a,b = b,a+b

# Print the first five fibonacci numbers
for i in generate_fibonnaci(5):
    # the for loop calls the next() function behind the scenes
    print(i)
```
```python
# Convert iterable such as string to iterator
iter(string_iterable)
```

## Operator Overloading
```python
# Operator overloading for Vectors
class Vector:
    def __init__(self,x,y):
        self.x=x
        self.y=y

    def __add__(self,inp):
        return Vector(self.x+inp.x,self.y+inp.y)
    
    def __sub__(self, inp):
        return Vector(self.x - inp.x, self.y - inp.y)

    def __mul__(self, inp):
        return Vector(self.x * inp, self.y * inp)
    
    def __eq__(self, inp):
        return self.x == inp.x and self.y == inp.y
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
# create objects of the Vector Class
v1=Vector(3,6)
v2=Vector(9,13)

print(v1+v2) # Vector(12, 19)
print(v1-v2) # Vector(-3, -7)
print(v1*3) # Vector(27, 78)
```
```python
# Operator overloading for Complex Numbers
class ComplexNumber:
    def __init__(self, real, imaginary):
        self.real = real
        self.imaginary = imaginary

    def __add__(self, inp):
        return ComplexNumber(self.real + inp.real, self.imaginary + inp.imaginary)

    def __sub__(self, inp):
        return ComplexNumber(self.real - inp.real, self.imaginary - inp.imaginary)

    def __mul__(self, inp):
        real_part = self.real * inp.real - self.imaginary * inp.imaginary
        imag_part = self.real * inp.imaginary + self.imaginary * inp.real
        return ComplexNumber(real_part, imag_part)

    def __truediv__(self, inp):
        denominator = inp.real**2 + inp.imaginary**2
        real_part = (self.real * inp.real + self.imaginary * inp.imaginary) / denominator
        imag_part = (self.imaginary * inp.real - self.real * inp.imaginary) / denominator
        return ComplexNumber(real_part, imag_part)

    def __eq__(self, inp):
        return self.real == inp.real and self.imaginary == inp.imaginary

    def __repr__(self):
        return f"{self.real} + {self.imaginary}i"

# Create objects of the ComplexNumber class
c1 = ComplexNumber(3, 6)
c2 = ComplexNumber(9, 13)

print(c1 + c2)  # 12 + 19i
print(c1 - c2)  # -6 + -7i
print(c1 * c2)  # -51 + 93i
print(c1 / c2)  # 0.42 + 0.06i
print(c1 == c2) # False
```
