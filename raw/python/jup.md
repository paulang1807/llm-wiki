!!! tip
    View list of currently running notebooks or labs along with the corresponding tokens

    - **jupyter notebook list**
    - **jupyter labs list**

## Magic Commands
- Can be used by default without the percent sign
    - ==as long as no variable is defined with the same name as the magic function in question==
    - This feature is called ==**automagic**== and can be enabled or disabled with `%automagic`

??? info "Useful Magic Commands"
    | Command | Description |
    | :---: | :--- | 
    | %cpaste | Open a special prompt for manually pasting Python code to be executed |
    | %debug | Enter the interactive debugger at the bottom of the last exception traceback |
    | %hist | Print command input (and optionally output) history |
    | %load FILENAME | Loads the file in the current cell |
    | %magic | Display detailed documentation for all of the available magic commands |
    | %page OBJECT | Pretty-print the object and display it through a pager |
    | %paste | Execute preformatted Python code from clipboard |
    | %pdb | Automatically enter debugger after any exception |
    | %prunstatement | Execute statement with cProfile and report the profiler output |
    | %quickref | Display the IPython Quick Reference Card |
    | %reset | Delete all variables/names defined in interactive namespace |
    | %runscript.py | Run a Python script inside IPython |
    | %%timeit | Calc time taken to run a python code snippet |
    | %timeitstatement | Run a statement multiple times to compute an ensemble average execution time; useful for timing code with very short execution time |
    | %timestatement | Report the execution time of a single statement |
    | %who, %who_ls, %whos | Display variables defined in interactive namespace, with varying levels of information/verbosity |
    | %xdelvariable | Delete a variable and attempt to clear any references to the object in the IPython internals |
    

## [Widgets](https://ipywidgets.readthedocs.io/en/latest/)
!!! tip
    If the widgets don't display correctly, follow the steps [here](https://ipywidgets.readthedocs.io/en/stable/user_install.html) to ensure all relevant libraries are installed.

### Interact
- Passing a function with an integer or float argument or range to interact creates a slider
- Default step size is 1 for integers and 0.1 for floats
- When specifying `min and max` or `min, max and step` as the widget arguments, the default value can be set in the function definition
- We can also specify the min, max, step and default in the function itself
    - Interact can be called just with the function name in this case
    - When used as a decorator, no parameters are needed in this case
    
!!! example "Usage"
    ```python
    # Without specifying min, max, step and default in the function
    # Create a slider
    interact(function_name, x=intval) 
    interact(function_name, x=(min,max)) 
    interact(function_name, x=(min,max,step)) 
    # The above invokes the IntSlider widget in the following form
    interact(function_name, x=widgets.IntSlider(min=-intval,max=3 * intval,step=1,value=intval))

    # With min, max, step and default specified in the function
    # Create a slider
    interact(function_name)
    ```

??? abstract "Sample Code"
    ```python
    from ipywidgets import interact, fixed, interact_manual
    import ipywidgets as widgets

    # Sample function
    def f(x):
        return x

    # Slider
    interact(f, x=10) 

    # Specify min, max, step and val for the slider explicitly
    interact(f, x=widgets.IntSlider(min=-100,max=100,step=5,value=0))

    # Checkbox
    interact(f, x=True)

    # Textarea
    interact(f, x='Hello')

    # Dropdown
    interact(f, x=['listval1','listval2'])

    # Dropdown - displays dict key in dropdown and return value corresponding to selection
    interact(f, x={'key1':val1,'key2':val2})



    # Sample function with default value
    def g(x=14):
        return x

    # Specify min and max for the slider explicitly
    interact(g, x=(10,15)) 
    # Specify min, max and step for the slider explicitly
    interact(g, x=(10,20,2)) 

    # Sample function with min, max, step and default values
    def g1(x=14):  # same as def g1(x:14)
        return x
    def g1(x=(10,20)):  # same as def g1(x:(10,20))
        return x
    def g1(x=(10,20,2)):  # same as def g1(x:(10,20,2))
        return x
    def g1(x=widgets.IntSlider(min=-100,max=100,step=5,value=0)):  # same as def g1(x:idgets.IntSlider(min=-100,max=100,step=5,value=0))
        return x

    interact(g1)
    ```

??? abstract "Using interact as decorator"
    ```python
    # function name is not passed as argument when using interact as a decorator
    @interact
    def f(x:10):
        return x

    @interact(x=widgets.IntSlider(min=-100,max=100,step=5,value=0))
    def f(x):
        return x

    @interact
    def f(x:widgets.IntSlider(min=-100,max=100,step=5,value=0)):
        return x
    ```

The function `fixed` can be used to fix the value of arguments.
```python
# Here even though there are two arguments, only one interactive widget is displayed
@interact
def f(x=5, y=fixed(10)):
    return (x,y)
```

### Interactive
- Used if there is a need to reuse the widgets
- Returns a `Widget` instance rather than immediately displaying the widget
    - Use IPython's `display` function to display the widget

```python
from ipywidgets import interactive, fixed
import ipywidgets as widgets
from IPython.display import display

def f(x:widgets.IntSlider(min=-100,max=100,step=5,value=0), y:10):
    return (x,y)

w = interactive(f)

# Display the widget(s)
display(w)

# Print the widgets being used
w.children
# Returns
# (IntSlider(value=0, description='x', min=-100, step=5),
#  IntSlider(value=10, description='y', max=30, min=-10),
#  Output())

# Get the results
# Rerun this after every interaction with the widgets
w.result 
# Returns (0, 10)

# Get the arguments and values as a dict
w.kwargs
# Returns {'x': 0, 'y': 10}

# Close the widget
w.close()

# Once the widget is closed, display return the text representation of the widget
display(w)
# returns interactive(children=(IntSlider(value=0, description='x', min=-100, step=5), IntSlider(value=10, description='y', max=30, min=-10), Output()), _dom_classes=('widget-interact',))
# w.children, w.result and w.kwargs return the normal outputs
```

### Standalone Widgets
- Displayed using the `display()` method
- Values are accessed using the `value` property

```python
import ipywidgets as widgets
from IPython.display import display

# Create an integer slider
w = widgets.IntSlider()
# Create a float slider
w = widgets.FloatSlider()
# Create acheckbox
w = widgets.Checkbox()
# Create a text widget
w = widgets.Text()
# Create a textarea
w = widgets.Textarea()

# Display the widget
display(w)
# Interact with the widgets and access the value using the value property
w.value

# Pass disabled parameter or set disabled property to False to disable the widget
w = widgets.IntSlider(disabled=False)
# Enable the widget
w.disabled = False

# Initialize with default value
w = widgets.Text(value='Hello', disabled=True)

# View the full list of available properties
w.keys

# Linking widgets - Cannot link more than two widgets at a time
a = widgets.FloatText()    # widgets.Text() also works
b = widgets.FloatSlider()
display(a,b)

widgetlink = widgets.jslink((a, 'value'), (b, 'value'))

# Unlinking widgets
widgetlink.unlink()
```