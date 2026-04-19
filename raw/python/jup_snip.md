```python
# Print dataframe using html in middle of a code chunk (Jupyter)
from IPython.display import display, HTML
display(HTML(df.describe().to_html()))
```

```python
# Display image from url
from IPython.display import Image
Image(url='http://i.stack.imgur.com/GbJ7N.png')
```