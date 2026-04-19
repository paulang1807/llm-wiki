??? tip "Check api key env variable"
    ```python
    import os
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv())

    openai_api_key = os.getenv('OPENAI_API_KEY')
    anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
    google_api_key = os.getenv('GOOGLE_API_KEY')
    deepseek_api_key = os.getenv('DEEPSEEK_API_KEY')
    groq_api_key = os.getenv('GROQ_API_KEY')
    grok_api_key = os.getenv('GROK_API_KEY')
    openrouter_api_key = os.getenv('OPENROUTER_API_KEY')

    if openai_api_key:
        print(f"OpenAI API Key exists and begins with {openai_api_key[:8]}")
    else:
        print("OpenAI API Key not set")
        
    if anthropic_api_key:
        print(f"Anthropic API Key exists and begins with {anthropic_api_key[:7]}")
    else:
        print("Anthropic API Key not set")

    if google_api_key:
        print(f"Google API Key exists and begins with {google_api_key[:2]}")
    else:
        print("Google API Key not set")

    if deepseek_api_key:
        print(f"DeepSeek API Key exists and begins with {deepseek_api_key[:3]}")
    else:
        print("DeepSeek API Key not set")

    if groq_api_key:
        print(f"Groq API Key exists and begins with {groq_api_key[:4]}")
    else:
        print("Groq API Key not set")

    if grok_api_key:
        print(f"Grok API Key exists and begins with {grok_api_key[:4]}")
    else:
        print("Grok API Key not set")

    if openrouter_api_key:
        print(f"OpenRouter API Key exists and begins with {openrouter_api_key[:3]}")
    else:
        print("OpenRouter API Key not set")
    ``` 

??? tip "Connect Strings"
    ```python
    # For Gemini, DeepSeek and Groq, we can use the OpenAI python client
    # Because Google and DeepSeek have endpoints compatible with OpenAI
    # And OpenAI allows you to change the base_url

    anthropic_url = "https://api.anthropic.com/v1/"
    gemini_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
    deepseek_url = "https://api.deepseek.com"
    groq_url = "https://api.groq.com/openai/v1"
    grok_url = "https://api.x.ai/v1"
    openrouter_url = "https://openrouter.ai/api/v1"
    ollama_url = "http://localhost:11434/v1"

    openai = OpenAI()
    anthropic = OpenAI(api_key=anthropic_api_key, base_url=anthropic_url)
    gemini = OpenAI(api_key=google_api_key, base_url=gemini_url)
    deepseek = OpenAI(api_key=deepseek_api_key, base_url=deepseek_url)
    groq = OpenAI(api_key=groq_api_key, base_url=groq_url)
    grok = OpenAI(api_key=grok_api_key, base_url=grok_url)
    openrouter = OpenAI(base_url=openrouter_url, api_key=openrouter_api_key)
    ollama = OpenAI(api_key="dummy", base_url=ollama_url)
    ``` 

## LLMs
### [OpenAI](https://colab.research.google.com/drive/1aCKnhpmU3y2btDcp9V7jVq0GM8hTe-2d#scrollTo=bdf93334)
#### General Prompting
!!! abstract "Sample Code"
    ```python
    import os
    from dotenv import load_dotenv, find_dotenv
    from IPython.display import Markdown, display, update_display
    from openai import OpenAI

    model="gpt-5-nano"
    openai = OpenAI()  # Automatically uses the env variable OPENAI_API_KEY. 
    response_format={"type": "json_object"}

    # We can also specify the api_key parameter explicitly
    _ = load_dotenv(find_dotenv())
    # The following can also be used
    # load_dotenv(override=True)
    api_key  = os.getenv('OPENAI_API_KEY')
    openai = OpenAI(api_key=api_key)

    system_prompt = "You are an useful assistant."
    user_prompt_prefix = "Tell me a joke."

    # Helper function for message
    def get_message(user_prompt):
    return [{"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}]

    # Helper function for prompting
    def get_completion(prompt, response_format=None, model="gpt-3.5-turbo", temperature=1, max_tokens=200):
        response = openai.chat.completions.create(
            model=model,
            messages=get_message(prompt),
            max_tokens=max_tokens,
            temperature=temperature, 
            response_format=response_format
        )
        return response.choices[0].message.content

    prompt = user_prompt_prefix + " It should be about movies."

    response = get_completion(prompt)
    print(response)
    ```

!!! example "Streaming Output"
    ```python
    # Helper function for prompting with streaming output
    def get_streaming_completion(prompt, model="gpt-3.5-turbo", temperature=1):
        stream = openai.chat.completions.create(
            model=model,
            messages=get_message(prompt),
            temperature=temperature, 
            stream=True
        )

        response = ""

        # Create an empty markdown handle for streaming output
        display_handle = display(Markdown(""), display_id=True)

        for chunk in stream:
            response += chunk.choices[0].delta.content or ''
            update_display(Markdown(response), display_id=display_handle.display_id)

    get_streaming_completion(prompt)
    ```

??? info "Using POST"
    ```python
    # The following represents the POST equivalent of the code chunk showin the Usage section above
    import os
    import requests

    api_key  = os.getenv('OPENAI_API_KEY')
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    payload = {
        "model": "gpt-5-nano",
        "messages": [
            {"role": "system", "content": "You are an useful assistant."},
            {"role": "user", "content": "Tell me a joke."}]
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )

    prompt_response = response.json()["choices"][0]["message"]["content"]
    print(prompt_response)
    ```

#### [Prompting for Images](https://colab.research.google.com/drive/1aCKnhpmU3y2btDcp9V7jVq0GM8hTe-2d#scrollTo=vEnpnPRTcbY2)

!!! abstract "Sample Code"
    ```python
    import base64
    from io import BytesIO
    from PIL import Image
    from IPython.display import display
    from openai import OpenAI

    openai = OpenAI()
    response = openai.images.generate(
        model="dall-e-3",
        prompt="A photo of an astronaut riding a horse.",
        n=1,
        size="1024x1024",
        response_format="b64_json",
    )
    image_base64 = response.data[0].b64_json
    image_data = base64.b64decode(image_base64)

    image = Image.open(BytesIO(image_data))
    display(image)
    # This will return the image file as a byte string. 
    # To save the image file, you can use the following code:
    with open("image.png", "wb") as f:
        f.write(image_data)
    ```

#### [Prompting for Speech](https://colab.research.google.com/drive/1aCKnhpmU3y2btDcp9V7jVq0GM8hTe-2d#scrollTo=Wax_i5yMgAwk)

!!! abstract "Sample Code"
    ```python
    from openai import OpenAI

    openai = OpenAI()
    response = openai.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="onyx",    # Some other options - alloy, coral
        input="Hello, how are you?"
    )
    response.content
    # This will return the audio file as a byte string. 
    # To save the audio file, you can use the following code:
    with open("audio.mp3", "wb") as f:
        f.write(response.content)
    ```

### [Google](https://colab.research.google.com/drive/1aCKnhpmU3y2btDcp9V7jVq0GM8hTe-2d#scrollTo=ml6va219X85-)
!!! abstract "Sample Code"
    ```python
    # Using OpenAI API wrapper
    from openai import OpenAI

    GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
    google_api_key = os.getenv("GOOGLE_API_KEY")

    gemini = OpenAI(base_url=GEMINI_BASE_URL, api_key=google_api_key)

    response = gemini.chat.completions.create(
                model="gemini-2.5-flash-lite", 
                messages=get_message(prompt))

    response.choices[0].message.content
    ```

    ```python
    # Using Gemini API wrapper
    from google import genai
    from google.genai import types

    gemini = genai.Client(api_key=google_api_key)

    # Helper function for adding prompts and responses to Content
    def get_content_from_messages(message, role):
        return types.Content(
            role=role,
            parts=[types.Part.from_text(text=message)]
        )

    # Helper function for generating streaming output
    def get_gemini_streaming_completion(message_content, config, model="gemini-2.5-flash-lite"):
        stream = llm.models.generate_content_stream(
            model=model,
            contents=message_content,
            config=config,
        )
            
        response = ""

        # Create an empty markdown handle for streaming output
        display_handle = display(Markdown(""), display_id=True)
            
        for chunk in stream:
            response += chunk.text or ''
            update_display(Markdown(response), display_id=display_handle.display_id)

    # System Prompt
    system_prompt_config = types.GenerateContentConfig(system_instruction=system_prompt)

    prompt_list = []

    # User Prompt
    prompt = user_prompt_prefix + f"""Tell me a joke"""
    user_message = get_content_from_messages(prompt, "user")

    prompt_list.append(user_message) 

    get_gemini_streaming_completion(prompt_list, system_prompt_config, model="gemini-2.5-flash-lite")
    ```

### Ollama
Ensure that [Ollama is running](../local/#cust-id-ollama-comm) before using this code.
!!! abstract "Sample Code"
    ```python
    # Check if Ollama is running
    # The statement below should return "Ollama is running"
    requests.get("http://localhost:11434").content
    
    OLLAMA_BASE_URL = "http://localhost:11434/v1"

    ollama = OpenAI(base_url=OLLAMA_BASE_URL, api_key='dummy')  # api_key just needs a dummy value

    response = ollama.chat.completions.create(
                model="llama3.1:8b", 
                messages=get_message(prompt))

    response.choices[0].message.content
    ```

### Anthropic
!!! abstract "Sample Code"
    ```python
    from anthropic import Anthropic

    client = Anthropic()

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "Tell me a joke."}],
    max_tokens=100     # This parameter is mandatory for Anthropic
    )
    print(response.content[0].text)
    ```

## Routers  
### [OpenRouter](https://colab.research.google.com/drive/1HJDuNrnLAXUANi5_xfBrB-QDvfu5bgwb#scrollTo=aHS_EAUQxuR_)
!!! abstract "Sample Code"
    ```python
    from openai import OpenAI

    openrouter = OpenAI(base_url=openrouter_url, api_key=openrouter_api_key)

    # Notice that the value for the model parameter is in the form <model_provider>/<model_name>
    response = openrouter.chat.completions.create(model="google/gemini-2.0-flash-exp:free", messages=[{"role": "user", "content": "Tell me a joke."}], reasoning_effort=None)  
    # the reasoning_effort parameter controls how much computational effort models put into their reasoning process
    print(response.choices[0].message.content)
    ```

    Also see [Open Router Reasoning](https://openrouter.ai/docs/api/reference/responses/reasoning)

## Frameworks (Abstraction Layers)

### [LangChain](https://colab.research.google.com/drive/1HJDuNrnLAXUANi5_xfBrB-QDvfu5bgwb#scrollTo=MUpNK1YTyfDg)
!!! abstract "Sample Code"
    ```python
    from langchain_openai import ChatOpenAI
    llm = ChatOpenAI(model="gpt-5-mini", api_key = openai_api_key)
    response = llm.invoke([{"role": "user", "content": "Tell me a joke."}])
    print(response.content)
    ```

### [LiteLLM](https://colab.research.google.com/drive/1HJDuNrnLAXUANi5_xfBrB-QDvfu5bgwb#scrollTo=KQbggbJZyiKa)
!!! abstract "Sample Code"
    ```python
    from litellm import completion
    # Notice that the value for the model parameter is in the form <model_provider>/<model_name>
    response = completion(model="openai/gpt-4.1-nano", messages=[{"role": "user", "content": "Tell me a joke."}], api_key=openai_api_key)
    print(response.choices[0].message.content)
    ```