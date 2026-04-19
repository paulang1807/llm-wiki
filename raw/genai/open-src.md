## [Huggingface](https://huggingface.co/huggingface)
- Two API levels:

    - **Pipelines**: Higher level APIs to cary out standard tasks. These can primarily be of two types:
        - [Transformation](https://huggingface.co/docs/transformers/main_classes/pipelines): For out of the box inference tasks
            - Sentiment Analysis, Classifications, Named Entity Recognition (NER), Q&A, Summarization, Translation
        - [Diffusion](https://huggingface.co/docs/diffusers/en/api/pipelines/overview): For out of the box audio, video and image generation
    - **Tokenizers and Models**: Lower level APIs providing more control

### Pipelines
#### [Transformation Pipelines](https://colab.research.google.com/drive/1J7-GW790IlZqaNjYUycY3itzZFWjIkLc#scrollTo=6A09J6_NgvZb)
- Accepts the pipeline type, a model id and a device as parameters
    - Pipeline types: One of the supported types
        - Examples: **sentiment-analysis**, **text-classification**, **ner**, **question-answering**, **summarization**, **translation**, **text-generation** etc.
    - Model id: The id of the model to use
        - Optional
        - Can be a model id from Huggingface
        - Huggingface will select the model that's the default for the task if not specified
    - Device: The device to use for inference
        - Specify "cuda" for the device to use an NVIDIA GPU
        - Specify "mps" on a Mac
- Returns a pipeline object that can be used to perform inference
    - Can be used to perform inference on a single text or a list of texts

!!! example "Basic Pipeline Usage"
    ```python
    from huggingface_hub import login
    from transformers import pipeline

    # Login to Huggingface
    login(hf_token, add_to_git_credential=True)
    
    # Load a pipeline for the desired task
    nlp = pipeline("pipeline_type for desired task", model="model_id", device="device")
    
    # Use the pipeline to analyze a text
    result = nlp("text")
    print(result)
    ```

??? abstract "Sample Pipeline Code"
    ```python
    # Sentiment Analysis
    nlp = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device="cuda")
    result = nlp("I love this product!")
    print(result)
    ```
    ```python
    # Named Entity Recognition (NER)
    nlp = pipeline("ner", device="cuda")
    result = nlp("I love this product!")
    for entity in result:
        print(entity)
    ```
    ```python
    # Question Answering
    question="What ia apple?"
    context="Explain in context of computers"

    nlp = pipeline("question-answering", device="cuda")
    result = nlp(question=question, context=context)
    print(result)
    ```
    ```python
    # Summarization
    nlp = pipeline("summarization", device="cuda")
    text = """
    Some text to summarize
    """
    summary = nlp(text, max_length=50, min_length=25, do_sample=False)
    print(summary[0]['summary_text'])
    ```
    ```python
    # Translation
    translator = pipeline("translation_en_to_hi", model="facebook/m2m100_418M", device="cuda")
    result = translator("I am translating from English to Hindi.")
    print(result[0]['translation_text'])
    ```
    ```python
    # Text Classification
    classifier = pipeline("zero-shot-classification", device="cuda")
    result = classifier("Apple is looking at buying U.K. startup for $1 billion", candidate_labels=["tech", "sports", "movies"])
    print(result)
    ```
    ```python
    # Text Generation
    generator = pipeline("text-generation", device="cuda")
    result = generator("If there is a will, there")
    print(result[0]['generated_text'])
    ```

#### [Diffusion Pipelines](https://colab.research.google.com/drive/1J7-GW790IlZqaNjYUycY3itzZFWjIkLc#scrollTo=Z86kLJBfekfB)
!!! example "Basic Pipeline Usage"
    ```python
    from huggingface_hub import login
    from IPython.display import display
    from diffusers import DiffusionPipeline, AutoPipelineForText2Image
    import torch

    # Login to Huggingface
    login(hf_token, add_to_git_credential=True)
    
    # Load a pipeline for the desired task
    # NVIDIA's GPU technology is cuda. The .to("cuda") is used to run the pipeline on the GPU
    diffusion_pipe = DiffusionPipeline.from_pretrained("diffusion_model_id", torch_dtype=torch.float16, use_safetensors=True, variant="fp16").to("cuda")

    # Using AutoPipelineForText2Image
    diffusion_pipe = AutoPipelineForText2Image.from_pretrained("diffusion_model_id", torch_dtype=torch.float16, use_safetensors=True, variant="fp16").to("cuda")
    
    # Use the diffusionpipeline to generate an image
    prompt = "Prompt for image"
    image = diffusion_pipe(prompt=prompt, num_inference_steps=5 guidance_scale=0.0).images[0]
    display(image)

    # Adding a refiner to the pipeline
    refiner_pipe = DiffusionPipeline.from_pretrained("refiner_model_id", text_encoder_2=base.text_encoder_2, vae=base.vae, torch_dtype=torch.float16, use_safetensors=True, variant="fp16",).to("cuda")
    diffusion_pipe = diffusion_pipe.to_refiner(refiner_pipe)

    # Use both diffusion pipeline and refiner pipeline to generate an image
    n_steps = 40
    high_noise_frac = 0.8
    prompt = "Prompt for image"
    image = diffusion_pipe(prompt=prompt, num_inference_steps=n_steps, denoising_end=high_noise_frac, output_type="latent").images[0]
    image = refiner_pipe(prompt=prompt, num_inference_steps=n_steps, denoising_start=high_noise_frac, image=image).images[0]
    display(image)
    ```

### [Tokenizers](https://colab.research.google.com/drive/1J7-GW790IlZqaNjYUycY3itzZFWjIkLc#scrollTo=x7oMTBzVoqA0)
- Translates text to tokens and token ids (See [Tokenization](../#cust-id-nlp-concept-token))
- Contains a vocab with 
    - tokens and token ids
    - special tokens such as (beginning of the sequence) and (end of the sequence)
        - helps understand where a sequence starts and ends
- Uses `encode` and `decode` methods to translate text to tokens and token ids
    - `encode`: Translates text to tokens and token ids
    - `decode`: Translates tokens and token ids to text

!!! example "Basic Tokenizer Usage"
    ```python
    from huggingface_hub import login
    from transformers import AutoTokenizer
    import torch

    # Login to Huggingface
    login(hf_token, add_to_git_credential=True)
    
    # Load a tokenizer for the desired task
    tokenizer = AutoTokenizer.from_pretrained("tokenizer_model_id", trust_remote_code=True)
    
    # Use the tokenizer to encode and decode text
    text = "Text to encode and decode"
    token_ids = tokenizer.encode(text)
    decoded_text = tokenizer.decode(token_ids, skip_special_tokens=True) # skip_special_tokens=True removes special tokens
    decoded_tokens = tokenizer.batch_decode(token_ids)  # batch_decode decodes a list of tokens
    ```

??? tip "[How LLMs predict chat outputs](https://colab.research.google.com/drive/1J7-GW790IlZqaNjYUycY3itzZFWjIkLc#scrollTo=XEiIYEUOaIbs)"
    - We use a specific format as the input prompt for Chat models
    - The LLM does not know how to handle the messages list format we are familiar with
        - LLMs are Data Science models that take a sequence of numbers and predict the probability of the next number
    - The tokenizer has a utility method `apply_chat_template` that converts the messages list format into the right input prompt for the LLM
        - The right prompt format will contain a sequence of words with special tags to separate the System, User, Assistant prompt
    - Then the words are broken down into tokens
    - Then the tokens are replaced with token ids
    - The input to an LLM is this sequence of Token IDs
        - The output is the probability distribution of the next Token ID to follow this input

    ```python
    # Convert message to right input prompt for the LLM 
    # The add_generation_prompt=True parameter ensures that the LLM generates a response to the question, instead of just predicting how the user prompt continues.
    # See https://huggingface.co/docs/transformers/main/en/chat_templating#addgenerationprompt
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    
    # View tokenized right input prompt format
    prompt = tokenizer.apply_chat_template(messages)
    ```
### [Quantization](../concepts/#quantization)
- Huggingface uses a library called `bitsandbytes` for Quantization
!!! example "[Sample Model with Quantization](https://colab.research.google.com/drive/1J7-GW790IlZqaNjYUycY3itzZFWjIkLc#scrollTo=4myRPPFtWyml)"
    ```bash
    # accelerate is a companion library that allows LLMs to run effectively on GPUs
    !pip install -q --upgrade bitsandbytes accelerate
    ```
    ```python
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TextStreamer
    import torch

    messages = [
        {"role": "user", "content": "Tell me a joke"}
    ]

    # define the quantization config to load the model into memory and use less memory
    quant_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_quant_type="nf4"
    )

    # Load a tokenizer for the desired task
    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-1B-Instruct")

    # Set the special token for padding to the end of sentence token. If this is not set, the processing may result in errors
    tokenizer.pad_token = tokenizer.eos_token
    # The parameter return_tensors="pt" is used to convert the tokens to pytorch type data structures that are ready to be run by the GPUs
    inputs = tokenizer.apply_chat_template(messages, return_tensors="pt").to("cuda")

    # Initialize the model
    # Huggingface uses 'CausalLM' in the names for models that generate content
    # Downloads the full precision model and then reduces the precision based on the quant config
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-1B-Instruct", device_map="auto", quantization_config=quant_config)

    # Run the model and print the output tokens
    outputs = model.generate(inputs['input_ids'], max_new_tokens=80)
    outputs[0]

    # We can add a TextStreamer to stream the output tokens
    streamer = TextStreamer(tokenizer)
    outputs = model.generate(inputs['input_ids'], max_new_tokens=80, streamer=streamer)

    # print the decoded output
    print(tokenizer.decode(outputs[0], skip_special_tokens=True))
    ```

*[tokens]: chunks of text
*[token ids]: unique numeric id for each token