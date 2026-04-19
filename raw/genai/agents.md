# Agents
- Agents are LLMs that can 
    - Call other LLMs, APIs, and other tools to perform complex tasks
    - Control the workflow and orchestration via tools
        - Run tools in a loop to achieve a goal
        
## Tools

- Allows LLMs to connect with external functions
    - Enahces the LLMs capabilities 
        - Allows LLMs to fetch additional contextual data, perform actions and calculations, access files, run code, modify UI, etc.
    - Forms the basis of Agentic AI
        - Enables LLMs to call other LLMs, APIs, and other tools to perform complex tasks
        - Create and track a to do list to track progress towards and achieve a goal
- Tool specifications are provided as list of JSON schemas 
    - The JSON schema contains the type of the tool along with additional metadata specific to the type of tool
    !!! example "Simple Tool Specification"
        ```python
        tool_specs = [{"type": "function", "function": JSON_specs_of_function}]
        ```
        
??? info "Interacting with Tools"
    - LLMs can interact with tools in two ways:
        - Tool calls
            - The LLM is asked to call a tool
            - The tool is called
            - The tool returns a result
            - The LLM is asked to use the result
        - Tool use
            - The LLM is asked to use a tool
            - The tool is used
            - The tool returns a result
            - The LLM is asked to use the result

### [Function Calls](https://colab.research.google.com/drive/1EfHgDq6hD3yYmQ_QNWeUsPOFJbiYJvY1)

LLMs can call functions as a part of their response to a user query.

- Reqiures the functions to be described using a pre defined JSON schema
!!! example "Simple Function Call"
    ```python
    # This is the JSON schema for the function that will be passed to the tool list
    JSON_specs_of_function = {
        "name": "name_of_function",
        "description": "Description of the function.",
        "parameters": {
            "type": "object",
            "properties": {
            "param1": {
                "type": "string",
                "description": "Description of param1."
            },
            "param2": {
                "type": "string",
                "enum": ["list_of_options"],
                "description": "Description of param2."
            }
            },
            "required": ["list_of_required_params"],
            "additionalProperties": False
        }
    }
    ```
- A function defining how tool calls are handled is also needed
!!! example "Simple Tool Call Handler"
    ```python
    # This is the "tool call handler" function that will be passed to the LLM
    def handle_tool_calls(message):
        # Initialize responses list to store responses from multiple tool calls from the LLM
        responses = []
        # Iterate through tool calls
        for tool_call in message.tool_calls:
            # Check if function exists
            function_name = tool_call.function.name
            if not function_name in globals():
                print(f"Error: Function {function_name} not found.")
                return {
                    "role": "tool",
                    "content": f"Error: Function {function_name} not found.",
                    "tool_call_id": tool_call.id
            }
            # Get function arguments
            arguments = json.loads(tool_call.function.arguments)

            print(f"Calling function: {function_name} with arguments: {arguments}")
            result = globals()[function_name](**arguments)

            responses.append({
                "role": "tool",     # Notice that this is a different role type (not "system", "assistant" or "user")
                "content": result,
                "tool_call_id": tool_call.id
            })
        return responses
    ```
- When calling the LLM an additional parameter is needed to pass the tool specifications
!!! example "Simple LLM Call with Tool Specifications"
    ```python
    response = openai.chat.completions.create(model=MODEL, messages=messages, tools=tool_specs)
    ```
- Finally, the LLM call also needs to be configured to inspect the response and call the tool call handler if needed
    - This is done by inspecting the `finish_reason` of the response
    - If the `finish_reason` is `tool_calls`, the tool call handler is called
    - The tool call handler returns a response
    - The response is appended to the history
    - The LLM is called again with the updated history
    - This process is repeated until the `finish_reason` is `stop`
!!! example "Simple LLM Call with Tool Call Handler"
    ```python
    while response.choices[0].finish_reason=="tool_calls":
        message = response.choices[0].message
        response = handle_tool_call(message)
        messages.append(message)
        messages.extend(response)
        response = openai.chat.completions.create(model=MODEL, messages=messages)
    ```