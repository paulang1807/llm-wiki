!!! tip 
    When working with images, Jupyter Notebook may sometimes show a warning related to the **IOPub data rate**  

    To get rid of the warning, stop the notebook and restart it with
    ```bash
    jupyter notebook --NotebookApp.iopub_data_rate_limit=1.0e10
    ```

### [pillow](https://pillow.readthedocs.io/en/stable/)
!!! danger "Remember"
    Image coordinates start at top left hand side, i.e. (x,y) = (0,0) on top left

    - x-coordinate increases from left to right
    - y-coordinate increases from top to bottom

```python
# Open Image file
# Since we are writing images, we need to use binary mode
my_img = Image.open('<Image name with path>','rb')
# Show the image
my_img.show()
# Save image
my_img.save('<Image name with path>')

# Get image details
my_img.size    # Returns a tuple of (width, height)
my_img.filename    # Image file name
my_img.format_description   # Image format

# Get RGB color details
r, g, b = my_img.getpixel((0, 0))

# Adding alpha layer to image
my_image.putalpha(alphavalue)
r, g, b, a = my_img.getpixel((0, 0))

# Cropping Images
my_img.crop((start_x, start_y, width, height))

# Pasting images
<target_image>.paste(im=<src_image>,box=(x_pos,y_pos))
# Masking one image with another
<target_image>.paste(<mask_image>,box=(x_pos,y_pos), mask=<mask_image>)

# Resize images
my_img.resize((resize_height,resize_width))

# Rotate images
my_img.rotate(<degree_to_rotate>)
```