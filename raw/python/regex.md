### Common methods

```python
import re

source = "To be or not to be, that is to be the question"
```
```python
# checks whether the source string begins with the pattern
re.match(pattern, source)

re.match("to be", source)
# does not return anything
re.match("To be", source)
# returns <re.Match object; span=(0, 5), match='To be'>
```
```python
# return the first match
re.search(pattern, source)

re.search("to be", source)
# returns <re.Match object; span=(13, 18), match='to be'>
```
```python
# return a list of all nonoverlapping matches
re.findall(pattern, source)

re.findall("to be", source)
# returns ['to be', 'to be']
```
```python
# iterate source and find match objects
re.finditer(pattern, source)

for match in re.finditer("to be", source):
    print(match.span()) 
```
```python
# precompile regex for performance gains. 
regex_pattern = re.compile(pattern)
re.search(regex_pattern,source)

regex_pattern = re.compile("to be")
re.search(regex_pattern,source)
# returns <re.Match object; span=(13, 18), match='to be'>
```
```python
# Precompile with named patterns
regex_pattern = re.compile(r'(?P<pattern_name1>pattern1)(?P<pattern_name2>pattern2)')

regex_pattern = re.compile(r"(?P<my_pattern_one>\w{2})\s(?P<my_pattern_two>\w{2})\s")
result = re.search(regex_pattern,source)
result.group("my_pattern_two")
# returns 'be'
```
```python
# return a list of strings that were split from the source string at the locations where the pattern was found
re.split(regex_pattern,source)

re.split(regex_pattern,source)
# returns ['To be or not ', ', that is ', ' the question']
```
```python
# return a string that has replaced instances of the pattern with a replacement string passed into the function
# number of instances replaced can be specified using count
re.sub(replacement, source[, count=0])

regex_pattern.sub("it is", source)
# returns 'To be or not it is, that is it is the question'
regex_pattern.sub("it is", source, count=1)
# returns 'To be or not it is, that is to be the question'
```

!!! tip 
    The identifier, specifier and quantifier based regex patterns should be enclosed with **r** (`r"regex_pattern"`). This is called a ==**raw string literal**==. It is similar to a regular string literal, but Python won't replace any characters when it is interpreted. For example, "\b" will remain as it is, instead of being replaced by a backspace character.

### Identifiers

| Pattern | Description | Anti-Pattern | Description |
| :---: | :--- | :---: | :--- |
| \d | A single digit | \D | A single non-digit |
| \w | An alphanumeric character | \W | A non-alphanumeric character |
| \s | A whitespace character | \S | A non-whitespace character |
| \b | A word boundary (between a \w and a \W, in either order) | \B | A non-word boundary |

```python
import re

source = "One of my phone numbers is (333) 666-9999 and the other one is (666) 999-1313"
```
```python
re.search(r'\d{4}', source)
# returns <re.Match object; span=(35, 39), match='9999'>
re.search(r'\D{4}', source)
# returns <re.Match object; span=(0, 4), match='One '>
```
```python
re.search(r'\w{4}', source)
# returns <re.Match object; span=(10, 14), match='phon'>
re.search(r'\W{2}', source)
# returns <re.Match object; span=(3, 4), match=' ('>
```
```python
re.search(r'\snumbers\s', source)
# returns <re.Match object; span=(15, 24), match=' numbers '>
re.search(r'\snumber\S', source)
# returns <re.Match object; span=(15, 23), match=' numbers'>
```
```python
# \b<pattern>\B is similar to \s<pattern>\S except that unlike the \s<pattern>\S pattern 
# it does not include the characters matching the \s and \S patterns
re.search(r'\bnumber\b', source)
# does not return anything. No occurence of 'number surrounded by space
re.search(r'\bnumbers\b', source)
# returns <re.Match object; span=(16, 23), match='numbers'>
re.search(r'\bnumber\B', source)
# returns <re.Match object; span=(16, 22), match='number'>
```

### Specifiers and Quantifiers

| Pattern | Description |
| :---: | :--- | 
| { m } | m consecutive matches of the pattern |
| { m, n } |m to n consecutive matches of the pattern, as many as possible |
| { m, n }? | m to n consecutive matches of the pattern, as few as possible |
| . | Any single character except \n |
| ^ | Starts with given pattern |
| $ | Ends with given pattern |
| ? | Zero or one matches of the pattern |
| * | Zero or more matches of the pattern, as many as possible |
| *? | Zero or more matches of the pattern, as few as possible |
| + | One or more matches of the pattern, as many as possible |
| +? | One or more matches of the pattern, as few as possible |
| ( pattern ) | Retunrs pattern match. Mostly used to make the regex pattern more readable |
| pattern1 \| pattern2 | pattern1 or pattern2 |
| [ abc ] | a or b or c (same as a|b|c) |
| [^ abc ] | not (a or b or c) |
| prev (?= next ) | prev if followed by next |
| prev (?! next ) | prev if not followed by next |
| (?<= prev ) next | next if preceded by prev |
| (?<! prev ) next | next if not preceded by prev |

```python
import re

source = "One of my phone numbers is (333) 666-9999. (666) 999-1313 is the other one."
```
```python
re.search(r'\d{2,5}', source)
# returns <re.Match object; span=(28, 31), match='333'>
re.search(r'\d{2,5}?', source)
# returns <re.Match object; span=(28, 30), match='33'>
```
```python
# Wildcard
re.search(r'\s\d{3}.', source)
# returns <re.Match object; span=(32, 37), match=' 666-'>

# Starts With
re.search(r'^One', source)
# returns <re.Match object; span=(0, 3), match='One'>

# End With
re.search(r'\W$', source)
# returns <re.Match object; span=(73, 74), match='.'>
```
```python
re.search(r'\W\d', source)
# returns <re.Match object; span=(27, 29), match='(3'>
re.search(r'\W\d?', source)
# returns <re.Match object; span=(3, 4), match=' '>
re.search(r'\W\d*', source)
# returns <re.Match object; span=(3, 4), match=' '>
re.search(r'\W\d*?', source)
# returns <re.Match object; span=(3, 4), match=' '>
re.search(r'\W\d+', source)
# returns <re.Match object; span=(27, 31), match='(333'>
re.search(r'\W\d+?', source)
# returns <re.Match object; span=(27, 29), match='(3'>
```
```python
re.search(r'(\s)(the)', source)
# returns <re.Match object; span=(59, 63), match=' the'
re.search(r'(one|two)', source)
# returns <re.Match object; span=(12, 15), match='one'>

re.search(r'[\d\s\w]', source)
# returns re.Match object; span=(0, 1), match='O'>
re.search(r'[\d\s\w]+', source)
# returns re.Match object; span=(0, 27), match='One of my phone numbers is '>
re.search(r'[\d]+\s[\w]+', source)
# returns re.Match object; span=(52, 59), match='1313 is'>

re.search(r'[^\d\s\w]', source)
# returns re.Match object; span=(27, 28), match='('>
re.search(r'[^\d\s\w]+', source)
# returns re.Match object; span=(27, 28), match='('>
re.search(r'[^\d\w]+', source)
# returns <re.Match object; span=(3, 4), match=' '>
re.search(r'[^\d]+', source)
# returns re.Match object; span=(0, 28), match='One of my phone numbers is ('>
re.search(r'[^\d]+\s[^\w]+', source)
# returns re.Match object; span=(0, 28), match='One of my phone numbers is ('>

# Remove special characters
re.findall(r'[^\W]+', source)
# returns ['One', 'of', 'my', 'phone', 'numbers', 'is', '333', '666', '9999', '666', '999', '1313', 'is', 'the', 'other', 'one']
' '.join(re.findall(r'[^\W]+', source))
# returns 'One of my phone numbers is 333 666 9999 666 999 1313 is the other one'
```
```python
re.search(r'\d{3}(?=-)', source)
# returns re.Match object; span=(33, 36), match='666'>
re.search(r'\d{3}(?!-)', source)
# returns re.Match object; span=(28, 31), match='333'>
re.search(r'(?<=\s)\w{2}', source)
# returns re.Match object; span=(4, 6), match='of'>
re.search(r'(?<!\s)\w{2}', source)
# returns re.Match object; span=(0, 2), match='On'>
```

### Result Methods
```python
result = re.match(pattern, source)
result.span()   # returns the tuple (start position, end position)
result.start()   # returns the start position of the match
result.end()   # returns the end position of the match
result.group() # returns the first occurence of the actual text that matched
result.groups() # returns all occurences of the actual text that matched

# Multiple patterns and results
regex_pattern = re.compile(r'(pattern1)(pattern2)(pattern3)')
result = re.search(regex_pattern,source)
result.group(2) # returns the actual text that matched pattern2
```
```python
phone_pattern = re.compile(r'\W(?P<areacode>\d{3})\W\s(?P<prefix>\d{3})-(?P<number>\d{4})')
result = re.search(phone_pattern,source)
result.group()
# returns '(333) 666-9999'
result.groups()
# returns ('333', '666', '9999')
result.group(1)
# returns '333'
result.group('areacode')
# returns '333'
```