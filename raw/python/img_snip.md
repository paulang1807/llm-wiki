```python
# Adding transparency to colors and overlaying colors to create new ones
from PIL import Image

# Open blue image file - rgb(84 166 216)
blue = Image.open('blue.png')
# Open brown image file - rgb(109 71 34)
brown = Image.open('brown.png')

# Add transparency to the images
blue.putalpha(210)
brown.putalpha(210)

# Overlay one image over other
# This will result in a new color
blue.paste(brown, box=(0,0), mask=brown)
```