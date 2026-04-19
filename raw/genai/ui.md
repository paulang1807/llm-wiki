## [Gradio](https://www.gradio.app/) ([Colab](https://colab.research.google.com/drive/1dnXN35xnQbLL1ZC_rY-pigl3nqHFZNqW))
- Easily launch local web servers for your models
- Serve up react based UIs for your models
- Requires code to be implemented to be passed as a callback function
- Provides multiple options for launching the interface
    - `inbrowser=True` to launch the interface in the browser
    - `share=True` to launch a shareable link instead of a local server
        - Code is sent to Gradio in huggingface and run there
        - When user interacts with the interface, the code is accessed from the local machine
            - Uses tunneling to access the local machine
        - A more permanent solution is to use [Huggingface Spaces](https://huggingface.co/spaces)
- Provides simple mechanisms for adding authentication
    - Can pass multiple auths as a list of tuples
- Can generate output in multiple formats including markdown
    - Use `python generators` to stream output from LLM function calls ([colab example](https://colab.research.google.com/drive/1dnXN35xnQbLL1ZC_rY-pigl3nqHFZNqW#scrollTo=_kwvy8WCLgIG))

!!! example "Simple Gradio Interface"
    ```python
    import gradio as gr
    
    # Define interface for text input and text output
    # Pass function name as callback
    iface = gr.Interface(fn=myfunctionname, inputs="text", outputs="text")
    
    # Launch interface
    iface.launch()
    # Use share=True when launching from colab
    iface.launch(share=True)
    # Use inbrowser=True when running locally and want to open in browser
    iface.launch(inbrowser=True)
    # User debug=True to debug the interface
    iface.launch(debug=True)

    # Add authentication
    iface.launch(auth=[("username1", "password1"),("username2", "password2")])

    # Add more specifications for input and output
    inputs = gr.Textbox(label="Input Label:", info=f"Input message", lines=5)
    outputs = gr.Textbox(label="Output Label:", info=f"Output message", lines=5)
    # Get output in markdown format
    outputs = gr.Markdown(label="Output Label:")
    # Get image output
    outputs = gr.Image(height=500, interactive=False, label="Output Label:")
    # Get audio output
    output = gr.Audio(autoplay=True)
    # Get video output
    output = gr.Video(height=500, interactive=False)

    # Add more input types
    input_dropdown = gr.Dropdown(["Option1", "Option2", "Option3"], label="Select an option", value="Option1")  # value parameter sets default value
    ```

### Chat Interface
- The callbackfunction should be created with two parameters - message and history
- Gradio will automatically handle the history and pass it as a list of messages to the callback function 
    - The history contains the role and content as well as some additional attributes such as metadata and options

!!! example "[Gradio Chat Interface](https://colab.research.google.com/drive/1dnXN35xnQbLL1ZC_rY-pigl3nqHFZNqW#scrollTo=k0NNPnHwEr-H)"
    ```python
    import gradio as gr
    
    # Use a chat interface
    iface = gr.ChatInterface(fn=myfunctionname, type="messages").launch(share=True)
    ```

### [Multiple UI Components using Blocks](https://colab.research.google.com/drive/1dnXN35xnQbLL1ZC_rY-pigl3nqHFZNqW#scrollTo=NpamQHqAceoJ)

!!! example "Gradio Blocks"
    ```python
    import gradio as gr
    
    # Use a block interface with multiple UI components
    # Use Blocks to create a custom interface
    with gr.Blocks() as demo:
        # Use Row to create a horizontal layout
        with gr.Row():
            gr.Markdown("# My Gradio App")
        with gr.Row():
            chat_ui = gr.Chatbot(height=500, type="messages", allow_tags=False)
            img_ui = gr.Image(height=500, interactive=False)
        with gr.Row():
            audio_ui = gr.Audio(autoplay=True)
        with gr.Row():
            user_msg_ui = gr.Textbox(label="Enter message here:")

    demo.launch(share=True)
    ```

## [Streamlit](https://streamlit.io/)
- 