---
title: "Python Image Processing"
category: python
tags: [python, imaging, pillow, pillow-tutorial]
sources: [raw/python/img.md, raw/python/img_snip.md]
confidence: 1.0
last_updated: 2026-04-19
stale: false
related: [[Python Basics]]
---

# Python Image Processing (Pillow)

The [Pillow](https://pillow.readthedocs.io/en/stable/) library (a fork of PIL) is the standard for image processing in Python.

## 🧭 Coordinate System
> [!IMPORTANT]
> Image coordinates start at the **top-left** corner: (0,0).
> - **X-coordinate** increases from left to right.
> - **Y-coordinate** increases from top to bottom.

---

## 🛠️ Basic Operations

```python
from PIL import Image

# Open & Show
img = Image.open('image.jpg')
img.show()

# Details
print(img.size) # (width, height)
print(img.format_description)

# Save
img.save('output.png')
```

### Transformations
- **Resize**: `img.resize((width, height))`
- **Rotate**: `img.rotate(90)`
- **Crop**: `img.crop((left, top, right, bottom))`

---

## 🌈 Transparency & Layering

### Adding Alpha (Transparency)
You can set the transparency level (0-255) of an image using `putalpha`.

```python
img.putalpha(128) # 50% transparency
```

### Layering with Masks
Use `paste` with a `mask` to overlay images while respecting transparency.

```python
from PIL import Image

blue = Image.open('blue.png')
brown = Image.open('brown.png')

# Add transparency
blue.putalpha(210)
brown.putalpha(210)

# Overlay brown onto blue using itself as a mask
blue.paste(brown, box=(0,0), mask=brown)
```

## 📓 Jupyter Integration
If working in Jupyter and seeing **IOPub data rate** warnings, restart the notebook with:
```bash
jupyter notebook --NotebookApp.iopub_data_rate_limit=1.0e10
```
