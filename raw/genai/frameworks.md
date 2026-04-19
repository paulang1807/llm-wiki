## Routers and Abstraction Layers
- **Routers** - Remote process that routes requests to the appropriate LLM based on the input
    - Requires the use of a single router api
        - Separate API for each LLM not needed
    - Example: [OpenRouter](https://openrouter.ai) 
        - Includes 25+ free models ( has limits on number of requests per day)
        - [Code Sample](../prompt-code/#openrouter)

- **Abstraction Layers** - Part of the local codebase that abstracts the complexity of the LLM calls
    - Also known as frameworks
    - Examples: 
        - [LangChain](https://www.langchain.com/)
        - [LiteLLM](https://docs.litellm.ai/docs/)
    - Called with a consistent api 
    - Calls the LLM separately with the appropriate parameters

## [Frameworks (Abstraction Layers)](https://colab.research.google.com/drive/1HJDuNrnLAXUANi5_xfBrB-QDvfu5bgwb)
### [LangChain](https://www.langchain.com/)
- A framework for developing GenAI apps
    - Uses `LangSmith` for **LLMOps** (Debugging, Evaluation, Monitoring etc.)
    - Uses `LangServe` to create Chains as Rest APIs for depolyment

![Langchain Ecosystem](img/langchain_ecosystem.png)