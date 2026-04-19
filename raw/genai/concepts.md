<p id="cust-id-genai-terminology"></p>
!!! abstract "Terminology"
    - **GPT**: Generative Pre-Trained Transformers
    - **GAN**: Generative Adversarial Networks
    - **VAE**: Variational Autoencoders (Used in anomaly detection)
    - **RLHF**: Reinforcement Learning Human Feedback
    - **RAG**: Retrieval Augmented Generation
    - **Multimodal AI**: Allows inputs from muliple modalities (i.e. different types of data) such as images, video, audio and text
    - **Context Window**: Max number of tokens that the model can consider when generating the next token.[^2]

## Custom GPTs
- Creating customized GPTs by pre-setting instructions
    - Can be reused without having to repeat the instructions
    - Can be invoked using mentions

## LLMs
### API Parameters

- **Max Tokens**: Determines the maximum number of tokens that can be generated. This parameter helps control the verbosity of the response. The value typically ranges between 0 and 2048, though it can vary depending on the model and context.
- **Temperature**: Controls the randomness of the output. It influences how creative (less predictive responses) or deterministic (more predictive responses) the responses are. The value ranges between 0 and 2. ==The default value is 0.8.==
- **Top P (Nucleus Sampling)**: Dictates the variety in responses by only considering the top ‘P’ percent of probable words. It is an alternative to sampling with temperature and controls the diversity of the generated text. The value ranges between 0 and 1. ==The default value is 0.95.==
- **Frequency Penalty**: Reduces repetition by decreasing the likelihood of frequently used words. It penalizes new tokens based on their existing frequency in the text so far. The value ranges between -2.0 and 2.0. This setting is disabled by default (value 0)
- **Presence Penalty**: Promotes the introduction of new topics in the conversation. It penalizes new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. The value ranges between -2.0 and 2.0. Positive values encourage diverse ideas and minimize repetition. This setting is disabled by default (value 0)

??? note "Temperature and Top P sample values"

    | Use Case | Temperature | Top P | Description      |
    | :---------- | :---: |:---: |:-------------------------------------------------- |
    | Chatbot     | 0.5 | 0.5 | Generates responses that balance coherence and diversity resulting in a more natural and engaging conversational tone.      | 
    | Code Generation | 0.2  | 0.1 | Generates code that adheres to established patterns and conventions. Code output is more focussed and syntactically correct.      |
    | Code Comment Generation | 0.3 | 0.2 | Generates concise and relevant code comments that adhere to conventions.      | 
    | Creative Writing | 0.7 | 0.8 | Generates creative and diverse text less constrained by patterns.      |
    | Data Analysis Scripting | 0.2 | 0.1 | Generates focussed, efficient and correct analysis scripts.      |
    | Exploratory Code Writing | 0.6 | 0.7 | Generates creative code that considers and explores multiple solutions.      |

### Training
- Three phases of training:
    - **Pre Training** 
        - Model is trained on large volumes of text
        - Results in the creation of a parameter file 
            - For example the LLama2 model is trained on 10 TB of trxt and produces a compressed 140 GB parameter file. 
        - ==Open source LLMs have a run file in addition to the parameter file.==
            - The run file contains some code to run the parameter file.
                - Written in C or Python
    - **Fine Tuning** 
        - LLMs can be fine tuned with hundreds of thousands (roughly 100,000 in general) of high-quality prompts and completions (questions and expected answers)
        - Enhances the model's efficiency 
        - Allows models to respond without hallucinations
        - Allows superior results with less input and potentially using smaller models
        - ChatGPT uses the SGD optmizer (Stoichastic Gradient Descent) for fine tuning
    - **Reinforcement Training** 
        - Let the model know how good the response is and the model learns based on the feedback.

### Types

- Base 
    - Provide some basic instructions or examples 
        - Examples can be in terms of how to respond (A) when something is asked (Q)
    - Ask the desired question at the end and wait for the LLM to respond
    - Can be useful for fine tuning to learn new skills
- Chat / Instruct
    - Provide context in addition to the examples, otherwise similar to Base LLMs
    - Can be used for interactive use cases
        - Content generation
- Reasoning / Thinking
    - Include instruction to make the LLM think through and explain the steps
    - Adding the word `wait` in the instructions can make the LLM analyze its thought process
        - Can result in better outputs
    - More useful for problem solving
    - Uses ==**Inference Time Scaling**==[^1] ( as opposed to Training Time Scaling)

### Quantization
- Process of rounding the weights of the LLMs to a lower precision
- Reduces the memory(VRAM) footprint, inference time and compute required to run the LLMs without a significant loss in accuracy
- Commonly used for deploying LLMs on edge devices and consumer devices (mobiles, laptops etc.)

#### NF4 Quantization
- Specialized, "high-intelligence" way of rounding the weights of the LLMs to a lower precision
- Uses only 4 bits (instead of 16 bits) to represent the weights


## Retrieval Augmented Generation (RAG)

Rather than just relying on the LLMs to generate the response, RAG looks up the relevant context from the documents and uses it to generate the response

- Components for RAG Implementation
    - Document Ingestion
        - Ingestion
        - Transformation and Storage 
            - Required to handle the `context size` limitations of the LLMs
                - Once the LLM reaches the limit, it is not going to remember the previous content that was discussed with it
            - Transformation involves **Splitting** the input into Chunks
            - **Embedding** 
                - Input is converted to tokens which are then conversion to Vectors
                - Retains some reference to the original content the embeddings were created from
                - Aids in ==**Similarity Search**==
            - Storage in **Vector Database** (FAISS, ChromaDB, AstraDB etc.)
                - Vector embeddings stored as clusters in 3d space
    - User Query and Response
        - User query
            - Create embdedings from query using the same embedding model
        - Pre defined prompt
        - ==**Retrieval Chain**==
            - Interface for querying Vector Store DB
            - Perform Similarity Search
        - Prompt + User Query + Enhanced context from Retrieval Chain sent to LLM
        - Response from LLM

*[Similarity Search]: Embeddings from user query used to search vector store for similar vector embeddings

[^1]: Another technique for Inference Time Scaling is to provide more data in the input instructions
[^2]:
    - Includes the full conversation - all inputs and outputs
    - Model will fail to generate output if the Context Window is exceeded