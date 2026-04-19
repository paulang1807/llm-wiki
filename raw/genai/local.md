
## Local LLMs

### [Ollama](https://ollama.com)
#### Setup

- [Download Ollama](https://ollama.com/download)
- Download model
    - Search for the desired model and go to the corresponding page
        - The `dolphin` models are uncensored (search for dolphin)
	- Click on the desired version, copy the cli command and execute in the terminal 
        - Make sure you have enough RAM for the LLM to work 
        - ==**Memory should be roughly equal to the size of the model**==
        ![Llama 3.1 download](img/ollama_model_example.png)
    - Once the terminal command executes we are ready to start using the LLM locally
        - When we run the 'ollama run' command for a model for the first time, it is downloaded in the `~/.ollama/models/manifests/registry.ollama.ai/library` folder in Mac

<p id="cust-id-ollama-comm"></p>
??? info "Useful Commands"
    | Command | Description |
    | :---------- |:-------------------------------------------------- |
    | /bye  (or Ctrl D)	| quit interacting with the LLM |
    | ollama | Lists all available commands |
    | ollama list | Lists the models available for use |
    | ollama run <model_name> | To run the model |
    | ollama serve | To start a local server[^1] |
    
??? tip "[Running Ollama in Colab](https://colab.research.google.com/drive/1aCKnhpmU3y2btDcp9V7jVq0GM8hTe-2d#scrollTo=f6b3ab3a)"
    - Install Ollama: Install the Ollama CLI in the Colab environment. This typically involves downloading and running an installation script.
    - Start Ollama Server: Start the Ollama server in the background. This will make the API endpoint available for use.
    - Download an Ollama Model: Download a specific language model (e.g., 'llama3.1:8b') using the Ollama CLI.

Also see [Ollama Prompting in Python](../prompt-code/#ollama)

### [LlamaFile](https://github.com/Mozilla-Ocho/llamafile)
#### Setup
- Download the `TinyLlama Llamfile from the [Other example llamafiles](https://github.com/Mozilla-Ocho/llamafile/tree/main?tab=readme-ov-file#other-example-llamafiles) section
- Grant permissions
    ```bash
    chmod +x TinyLlama-1.1B-Chat-v1.0.F16.llamafile
    ```
- Start llamafile server
    ```bash
    ./TinyLlama-1.1B-Chat-v1.0.F16.llamafile
    ```
    - This should launch the llamafile ui on http://127.0.0.1:8080

!!! abstract "Sample Code"

    ```python
    from openai import OpenAI

    client = OpenAI(
        base_url="http://127.0.0.1:8080/v1",  # local llamafile url
        api_key="no-key"   # empty string does not work
    )

    prompt = f"What is LLM?"
    messages = [{"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}]
    response = client.chat.completions.create(
        model="TinyLLM",
        messages=messages,
    )
    print(response.choices[0].message.content)
    ```

## Local Frameworks

### [LLamaIndex](https://www.llamaindex.ai/)
#### Implementation Steps Using LlamaFile

- Install required packages
```bash
# core package for LlamaIndex, which provides the framework for building and querying indexes
pip install llama-index
# package for integrating LLaMA models with LlamaIndex, allowing for the use of LLaMA models as the language model (LLM) component
pip install llama-index-llms-llamafile
# package for providing the embedding functionality using LLaMA models, which is essential for creating vector representations of documents
pip install llama-index-embeddings-llamafile
# package for openai integration (required only if using openai models)
pip install llama-index-llms-openai
```
- Set up LlamaIndex with LLaMAFile
- Define custom prompt using prompt templates (Optional)
- Load Local Data
- Build the Index
- Create a Query Engine
- Query the Index

!!! abstract "Sample Code"

    ```python
    from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
    from llama_index.embeddings.llamafile import LlamafileEmbedding
    from llama_index.llms.llamafile import Llamafile

    # configure LlamaIndex to use the LLaMAFile
    # create an embedding model that utilizes the LLaMAFile
    Settings.embed_model = LlamafileEmbedding(base_url="http://localhost:8080")
    # Set up the Llama model as the LLM component of LlamaIndex
    Settings.llm = Llamafile(base_url="http://localhost:8080", temperature=0, seed=0)

    # load local pdf docs
    # the `load_data` method loads the documents from the directory and returns them as a list. 
    local_reader = SimpleDirectoryReader(input_dir='DirPath/')
    docs = local_reader.load_data(show_progress=True)

    # create an index to store vector representations of the loaded documents. 
    # the `from_documents` method builds the index from the provided list of documents.
    index_pdf = VectorStoreIndex.from_documents(docs)

    # convert the index into a query engine that can handle queries and query the index
    query_engine_pdf = index_pdf.as_query_engine()

    # use the query engine to retrieve relevant information from the index
    query = "What is the main topic of the document?"
    response = query_engine.query(query)
    print(response)
    ```

##### [Custom Prompts](https://docs.llamaindex.ai/en/stable/module_guides/models/prompts/usage_pattern/#commonly-used-prompts)
The most commonly used prompts are `text_qa_template` (1) and `refine_template` (2).
{ .annotate }

1. :bulb: Used to get an initial answer to a query using retrieved nodes
2. :bulb: Used when the retrieved text does not fit into a single LLM call with `response_mode="compact"` (the default), or when more than one node is retrieved using `response_mode="refine"`
    - The answer from the first query is inserted as an existing_answer, and the LLM must update or repeat the existing answer based on the new context.
3. :bulb: This will show the ip and port of the server which can then be used as an endpoint to interact with the LLM.

??? abstract "Sample Code with Custom Prompts"
    === "Completion Prompts"

        ```python
        from llama_index.core import PromptTemplate

        text_qa_template_str = (
            "Context information is below.\n---------------------\n{context_str}"
            "\n---------------------\nUsing both the context information and also using"
            " your own knowledge, answer the question: {query_str}\nIf the context isn't"
            " helpful, you can also answer the question on your own.\n"
        )
        text_qa_template = PromptTemplate(text_qa_template_str)

        refine_template_str = (
            "The original question is as follows: {query_str}\nWe have provided an existing answer: "
            "{existing_answer}\nWe have the opportunity to refine the existing answer (only if needed)"
            " with some more context below.\n------------\n{context_msg}\n------------\nUsing both the"
            " new context and your own knowledge, update or repeat the existing answer.\n"
        )
        refine_template = PromptTemplate(refine_template_str)

        print(index_pdf.as_query_engine(
                    text_qa_template=text_qa_template,
                    refine_template=refine_template,
                ).query("What is the main topic of the document?"))
        ```

    === "Chat Prompts"

        ```python
        from llama_index.core.llms import ChatMessage, MessageRole
        from llama_index.core import ChatPromptTemplate

        qa_prompt_str = (
            "Context information is below.\n---------------------\n{context_str}\n---------------------\n"
            "Given the context information and not prior knowledge, answer the question: {query_str}\n"
        )

        refine_prompt_str = (
            "We have the opportunity to refine the original answer (only if needed) with some more context below.\n"
            "------------\n{context_msg}\n------------\nGiven the new context, refine the original"
            " answer to better answer the question: {query_str}. If the context isn't useful, output"
            " the original answer again.\nOriginal Answer: {existing_answer}"
        )

        # Text QA Prompt
        chat_text_qa_msgs = [
            ("system", "Always answer the question, even if the context isn't helpful.",),
            ("user", qa_prompt_str),
        ]
        text_qa_template = ChatPromptTemplate.from_messages(chat_text_qa_msgs)

        # Refine Prompt
        chat_refine_msgs = [
            ("system","Always answer the question, even if the context isn't helpful.",),
            ("user", refine_prompt_str),
        ]
        refine_template = ChatPromptTemplate.from_messages(chat_refine_msgs)

        print(index_pdf.as_query_engine(
                    text_qa_template=text_qa_template,
                    refine_template=refine_template,
                ).query("What is the main topic of the document?"))
        ```

### [LangChain](https://www.langchain.com/)
#### Implementation Steps Using LlamaFile
- Install required packages
```bash
pip install -U langchain langchain-openai langchain-community
```
- Set up Langchain with Llamafile
- Create prompt
- Invoke prompt using model

!!! abstract "Sample Code"

    ```python
    from langchain_community.llms.llamafile import Llamafile
    from langchain.prompts import PromptTemplate

    # Initialize Llamafile
    llm = Llamafile(temperature=0.7)

    # Define prompt
    prompt_template = PromptTemplate.from_template("What are LLMs?")

    # Invoke prompt
    prompt = prompt_template.invoke({})
    result = llm.invoke(prompt)
    ```

- For using local files as context:
    - Load local data and split into manageable chunks

        ??? info "Splitters"
            **CharacterTextSplitter:**

            - Tries to preserve paragraphs, sentences, and words as coherent units.
            - Can specify chunk_size, chunk_overlap, and separator.
            - Does not automatically handle very large chunks; instead, it relies on the user setting appropriate values for chunk_size and chunk_overlap.

            **RecursiveCharacterTextSplitter:**

            - Similar to CharacterTextSplitter, but adds recursive splitting capabilities.
            - Automatically handles very large chunks by attempting to split them according to the specified chunk_size and separator list.
            - If a chunk remains too large after the first round of splitting, it will try again with subsequent separators in the list.

        ??? abstract "Loading Files"

            ```python
            from langchain.document_loaders import PyPDFLoader
            from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter

            # Load local data
            pdf_path = 'DirPath/Filename'
            pdf_loader = PyPDFLoader(file_path = pdf_path)

            # Split using Recursive splitter
            # split is based on the specified chunk size
            splitter = RecursiveCharacterTextSplitter(chunk_size = 1000,chunk_overlap = 0)

            pdf_data_RS = pdf_loader.load_and_split(text_splitter=splitter)
            ```

    - Define custom prompt using prompt templates (Optional)
    - Instantiate chain
    - Generate response by invoking chain

    ??? abstract "Sample Code with Custom Prompts"
        === "Completion Prompts"

            ```python
            from langchain.chains.summarize import load_summarize_chain
            # create prompt
            template = """
            Write a summary that highlights the main ideas in 3 bullet points of the following:
            "{text}"
            SUMMARY:
            """
            # Create prompt
            prompt = PromptTemplate.from_template(template)
            # Instantiate chain
            chain = load_summarize_chain(
                llm=llm,
                chain_type='stuff',
                prompt=prompt,
                verbose=False   # Setting this to true will print the formatted prompt
            )
            # Invoke chain
            results = chain.invoke(pdf_data_RS)
            print(f"Result Keys: {results.keys()}")
            print(f"\nOutput: {results['output_text']}")
            ```

        === "Chat Prompts"

            ```python
            from langchain.chains.combine_documents import create_stuff_documents_chain
            from langchain.chains.llm import LLMChain
            from langchain_core.prompts import ChatPromptTemplate

            # Define prompt
            prompt = ChatPromptTemplate.from_messages(
                [("system", "Summarize the highlights of the following in 3 bullet points:\\n\\n{context}")]
            )

            # Instantiate chain
            chain = create_stuff_documents_chain(llm, prompt)

            # Invoke chain
            result = chain.invoke({"context": pdf_data_RS[1:5]})
            ```

*[prompt templates]: A predefined structure that combines static text with dynamic user inputs. This allows developers to create prompts that are not only contextually rich but also tailored to specific tasks.

[^1]:
    This will show the ip and port of the server which can then be used as an endpoint to interact with the LLM.

    - This should launch the ollama ui on http://127.0.0.1:11434
        - Accessing the above url should display the message "Ollama is running"
    - If it shows the error: `Error: listen tcp 127.0.0.1:11434: bind: address already in use`, it means that ollama is already running at port 11434
