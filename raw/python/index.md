## Magic Methods

- Also known as `dunder methods`
- Special methods that start and end with double underscores. 
- Allow you to define how objects of your classes behave with built-in operations (**operator overloading**), such as addition, comparison, string representation etc. , enhancing the functionality of your custom classes

??? note "Common Dunder Methods"

    - `__init__()`: Used for Initializing Objects
    - `__new__()`: Used for Creating Objects 
    - `__str__()`: Used to define User-Friendly String Representationsof classes
    - `__repr__()`: Used to define Developer-Friendly String Representations of classes

!!! abstract "dir() function"
    Used to list the attributes and methods of an object, providing a way to inspect its properties

    - If called without arguments, it returns the names in the current local scope
    - If an object is passed, it returns the attributes of that object
    
## Modules
- When a python script is run by passing it as a command to the Python interpreter (`python myscript.py`), all of the code that is at indentation level 0 gets executed. 
    - Code for functions and classes that are defined do not get executed.
- The **dunder attibute** `__name__` returns the value `__main__` when a python script is invoked directly
    - It returns the name of the package when accessed after being imported in a different module

## Variables
We can check for local variables and global variables with the `locals()` and `globals()` functions.
!!! example "Globals and Locals"
    ```python
    # Print a dictionary of all global variables
    print(globals())
    # Print all keys for the global variables dictionary
    print(globals().keys())
    # Print the value of the global variable 'globalvar1'
    print(globals()['globalvar1'])

    # Print all local variables
    print(locals())
    ```

## Functions
### Map, Filter and Lambda
**Map**:  Allows you to "map" a function to an iterable object such as list. It applies the function to all the elements in the iterable.
```python
def get_len(strVal):
    return len(strVal) 

lstStr = ['Test','String','Length']

# Apply the function to each elelment in the list and return a list of the output values
list(map(get_len, lstStr))
# Returns [4,6,6]
```

**Filter**:  Applies a filter function to an interable object and returns the values filtered based on the function. 
```python
def get_even(num):
    return num % 2 == 0 

nums = [1,2,3,4,5,6,7,8,9]

# Apply the function to each elelment in the list and return a list of the output values
list(filter(get_even, nums))
# Returns [2,4,6,8]
```

**Lambda**:  Single line adhoc function. 
```python
# Multiple variables
add_func = lambda x,y: x + y
print(add_func(3,6))

# With Map
lstStr = ['Test','String','Length']
list(map(lambda x: len(x) , lstStr))
# Returns [4,6,6]

# Multiple iterables with map
lstNum1=[1,2,3]
lstNum2=[4,5,6]
list(map(lambda x,y:x + y,lstNum1,lstNum2))

# With Filter
nums = [1,2,3,4,5,6,7,8,9]
list(filter(lambda x: x % 2 == 0 , nums))
# Returns [2,4,6,8]
```

## Conditional Statement
```python
if condition:
    do something
elif another_condition:
    do something
else:    # if none of the above conditions match
    do something
```

## Loops
!!! tip "While vs For"
    - Use a “for” loop when there are a known set of items to iterate over. 
    - Use a “while” loop when the number of iterations is not known in advance.

### Else for Loops
- Used when using `break` within a loop to check some condition and exit the loop
- If the loop ends normally without the break being called, control passes to an optional else
```python
while condition:
    optionally do something
    if condition:
        break
# The following will be executed if the while loop never breaks
else:
    do something
```
```python
for condition:
    optionally do something
    if condition:
        break
# The following will be executed if the for loop never breaks
else:
    do something
```

### Pass, Break and Continue
- **pass**: Does nothing and continues with the rest of the program
- **break**: Breaks out of the current closest enclosing loop
- **continue**: Goes to the top of the closest enclosing loop

## Decorators
Decorators are functions which modify the functionality of another function.

- These take a function as a parameter and execute it. 
- It also executes some code before and / or after the original function that is passed as a parameter.

```python
def sample_decorator(func_to_decorate):   # Only function name (without paranthesis()) is passed as parameter.

    def wrapper_func():
        print("Optional code to execure before executing the function to be decorated")

        func_to_decorate()  # Function passed as parameter is executed

        print("Optional code to execure after executing the function to be decorated")

    return wrapper_func

@sample_decorator
def func_to_decorate():
    print("This function will be decorated")

# The @sample_decorator above reassigns func_to_decorate as below
# func_to_decorate = sample_decorator(func_to_decorate)

# This will run the decorated code
func_to_decorate()
```

## Generators
Generators allow us to generate as we go along, instead of holding everything in memory and hence is more **memory-efficient**.
```python
# Sample generator function to print n numbers
def generate_numbers(n):
    for num in range(n):
        # yield one number at a time instead of saving the entire output in memory 
        # and returning it all at one
        yield num  

# Print 100 numbers one at a time
for i in generate_numbers(100):
    print(i)

# Get the output in a list
list(generate_numbers(100))
```

## User Interactions
- `input`: Used to get user inputs
    - Input is visible as regular text
```python
user_input = input("Some text prompting for user input: ").strip()
```

- `getpass`: Used to get secure inputs
    - Input is masked
    - If the variable used to capture the input is printed, it will print in clear text
```python
import getpass
user_input = getpass.getpass("Some text prompting for user input: ")
```

## Error Handling
!!! abstract annotate "Try-Except-Else-Finally with While"

    ```python
    while True:
        try:
            # do something
        except [exceptionName as alias]:  # exceptionName is the name of the exception
            # execute if error
            continue  # execute the while loop again
        except Exception as ex:  # catch all errors using main exception class
            # execute if error
            continue  # execute the while loop again
        else:
            # execute if there is no error
            break  # break the while loop
        finally:
            # execute each time the statement in the try section is run
            # irrespective of if there is an error or not
            # this will execute even though there is a break statement in else
    ```

## Testing
### General Code Structure and Style

**[Pylint](https://www.pylint.org/)**: A simple tool that tests the code for style as well as some very basic program logic and generates a detailed **report** and a **rating**.
```bash
pylint python_file_name.py
```

### Unit Testing
Used to write tests that send sample data to your program, and compare what's returned to a desired outcome.

**[unittest](https://docs.python.org/3/library/unittest.html)**: Built in python module that supports test automation, sharing of setup and shutdown code for tests, aggregation of tests into collections, and independence of the tests from the reporting framework.

```python
import unittest
import file_to_be_tested  # import the python file to be tested

class TestFileToTest(unittest.TestCase):
    # Define test functions
    def test_one(self):
        # do something
        expected_value = 'some value'

        # call the function to be tested from the python file
        result = file_to_be_tested.function_to_test(params_if_any)

        # Check if the return value is as expected
        self.assertEqual(result, expected_value)
        
    def test_two(self):
        # do something
        another_expected_value = 'some value'

        # call the function to be tested from the python file
        second_result = file_to_be_tested.second_function_to_test(params_if_any)

        # Check if the return value is as expected
        self.assertEqual(second_result, another_expected_value)
        
if __name__ == '__main__':
    unittest.main()
```

**[doctest](https://docs.python.org/3/library/doctest.html)**: Built in python module that searches for pieces of text that look like interactive Python sessions, and then executes those sessions to verify that they work exactly as shown.

## Debugging
### [Python Debugger](https://docs.python.org/3/library/pdb.html)
- Implements an interactive debugging environment for Python programs
- Includes features to pause the program, look at the values of variables, and watch program execution step-by-step
- Alternative to adding a bunch of print statements for debugging
- Type `q` to quit the pdb debugging
```python
import pdb

# python code

# Set a trace using Python Debugger
pdb.set_trace()

# python code continued
```