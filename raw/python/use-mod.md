## Collections Module
### Counter
- A dict subclass which helps count hashable objects 
- Stores elements as dictionary keys and the counts of the objects as the value
!!! example "Usage"
    ```python
    from collections import Counter
    Counter(lst)
    Counter('string')
    Counter(sentence.split(' '))
    ```
??? abstract "Sample Code"
    ```python
    Counter([1,2,2,2,2,3,3,3,4,4,7,7,9,9,9])
    # Returns Counter({2: 4, 3: 3, 9: 3, 4: 2, 7: 2, 1: 1})

    Counter('A sample sentence with sample words repeating in the sentence'.split(' '))
    # Returns Counter({'sample': 2,  'sentence': 2,  'A': 1,  'with': 1,  'words': 1,  'repeating': 1,  'in': 1,  'the': 1})

    ctr = Counter('sshhuffheeehfkkkgsdksd')
    print(ctr)
    # Returns Counter({'s': 4, 'h': 4, 'k': 4, 'f': 3, 'e': 3, 'd': 2, 'u': 1, 'g': 1})

    # convert to a regular dictionary
    dict(ctr)                         # Returns {'s': 4, 'h': 4, 'u': 1, 'f': 3, 'e': 3, 'k': 4, 'g': 1, 'd': 2}

    n=3
    # n most common words
    ctr.most_common(n)                # Returns [('sample', 2), ('sentence', 2), ('A', 1)]

    # n least common elements
    ctr.most_common()[:-n-1:-1]       # Returns [('g', 1), ('u', 1), ('d', 2)]

    # total of all counts
    sum(ctr.values())                 # Returns 22

    # list unique elements
    list(ctr)                         # Returns ['s', 'h', 'u', 'f', 'e', 'k', 'g', 'd']

    # convert to a set
    set(ctr)                          # Returns {'d', 'e', 'f', 'g', 'h', 'k', 's', 'u'}

    # convert to a list of (elem, cnt) pairs dict_items
    ctr.items()                       # Returns ([('s', 4), ('h', 4), ('u', 1), ('f', 3), ('e', 3), ('k', 4), ('g', 1), ('d', 2)])

    # convert from a list of (elem, cnt) pairs
    Counter(dict(ctr.items()))        # Returns Counter({'s': 4, 'h': 4, 'k': 4, 'f': 3, 'e': 3, 'd': 2, 'u': 1, 'g': 1})
    ```

### NamedTuple
- Provides a way to create simple, lightweight data structures similar to a class
- Does not require defining a full class
!!! example "Usage"
    ```python
    from collections import namedtuple
    # Declaring namedtuple
    ClassName = namedtuple('ClassName', ['class_attr1', 'class_attr2', 'class_attr3'])

    # Adding values
    ClassInstance = ClassName('class_attr1_val', 'class_attr2_val', 'class_attr3_val')

    # Access using index
    print(ClassInstance[1])

    # Access using name
    print(ClassInstance.class_attr1)
    ```
??? abstract "Sample Code"
    ```python
    Movie = namedtuple('Movie', ['actor', 'actress', 'villain'])
    Suhaag = Movie('Amitabh', 'Rekha', 'Amjad')
    print(Suhaag[1])
    print(Suhaag.actor)
    ```

## Datetime Modules
### datetime and time
```python
import datetime
# Set time 03:33:33
datetime.time(3,33,33)
# Set date 9/9/99
datetime.date(9,9,99)
# Today
datetime.date.today()
datetime.date.today().year
datetime.date.today().month
datetime.date.today().day

# Timedelta
start=datetime.date(2021,10,1)
end=datetime.date(2021,10,5)
# end - start returns timedelta
(end - start).days
# Using the timedelta method
yesterday=datetime.datetime.now()-datetime.timedelta(days=1)
print(yesterday)
```
```python
from datetime import datetime
# Current date and time
datetime.now()
# Current time
datetime.now().time()
datetime.now().hour
datetime.now().minute
datetime.now().second
# Replace
datetime.now().replace(year=1999)
```
```python
import time
# Current time
time.time()
```

### timeit
- Runs a given snippet of code n number of times and returns the average time taken to run the code
```python
import timeit

setup = '''
def sample_func(n):
    return [str(num) for num in range(n)]
'''

stmt = '''
sample_func(n)
'''

timeit.timeit(stmt, setup,number=1000000)
```

## Random Module
```python
# Random Integer
import random
print(random.randint(1,13))

# Random Choice
from random import choice
vals = ['opt 1','opt 2','opt 3']
print(choice(vals))

# Random Shuffle - shuffles values inplace
from random import shuffle
shuffle(vals)
print(vals)

import random
# Sample with Replacement
random.choices(population=mylist,k=3)
# Sample without Replacement
random.sample(population=mylist,k=3)
```

## JSON (For Data Serialization)
```python
import json

# Convert to String
json_str=json.dumps(data)

# Convert to dictionary
parsed_data=json.loads(json_str)
```

## File Operations
### [pyPDF](https://pypdf2.readthedocs.io/en/3.x/)
```python
import PyPDF2

# Read the pdf file as a binary file with 'rb'
pdf_file = open('FileName.pdf','rb')
pdf_reader = PyPDF2.PdfReader(pdf_file)

# Get number of pages
len(pdf_reader.pages)

# Get contents of first page
first_page = pdf_reader.pages[0]
first_page_content = first_page.extract_text()

# Write to pdf
pdf_write_file = open('WriteFileName.pdf','wb')
pdf_writer = PyPDF2.PdfWriter()
# Add the first page from the previous pdf
pdf_writer.add_page(first_page)
pdf_writer.write(pdf_write_file)

# Close the files
pdf_file.close()
pdf_write_file.close()
```