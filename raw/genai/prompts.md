## Types

### Completion Prompts

- Suitable for ==**single-turn tasks**== where the model generates a response based on a single input prompt
- Conversation context/history and role seggregation is not essential
- Works well for content generation, summarization, question-answering etc.

### Chat Prompts

- Designed for ==**multi-turn conversations**== with multiple roles (user, assistant, system etc.)
    - **System prompt** - indicates what task the AI is performing and what tone it should use
    - **User prompt** - the prompt from user that the AI should reply to
- Maintains conversation context (see [context window](../concepts/#cust-id-genai-terminology)) by processing the entire conversation history
- Ideal for chatbot applications and tasks requiring back-and-forth interactions

## Prompting Guidelines
### Structure
- Break down large prompts into steps
    - Use **[delimiters](#cust-id-delimiters-prompt)** for organizing the prompt

        ??? tip "Stop Sequences"
            - Can be used to signal the end of an example in ==**[few-shot prompting](#cust-id-few-shot)**== 
            - Helps to structure the input data for the model
            - Triple backticks, quotes, double hashtags etc.

    - Break large prompts into "sub-prompts" if needed
- **Context**: Brief introduction or background information
    - Include topic, industry/field, relevant links, keywords, datasets, text chunks etc.
    - Constraints or restrictions
- **Persona**: Role or expertise/profession the prompt should use
    - Use phrases such as `Act as`, `Your role is to`, `Imagine you are` etc.
    - Add relevant details such as field of work, company name, time period, region etc.
- **Goal/Intent**: Define what the prompt should do
    - Describe objective
        - Use ==**action verbs**== such as `Analyze`, `Generate`, `Simplify`, `Summarize` etc.
    - Mention any focus areas using phrases such as `Focus on` etc.

    ??? info "Useful Action Verbs and Adjectives"
        - **Verbs**
            - Analyze, Compare, Convert, Customize, Describe, Evaluate, Explain, Generate, Improve, Optimize, Organize, Proofread, Provide, Revise, Rewrite, Share, Simplify, Translate, Write
        - **Adjectives**
            - Clear, Concise, Conversational, Professional

- **Output**
    - **Audience**: Layman, x year old, type of professional, demographics (age/gender/location) etc.
    - **Tone**: Formal, Business, Casual, Academic, Humorous etc.
        - As a Famous Personality e.g. Shakespeare, Tagore etc.
    - **Other Specs**: 
        - Specify constraints (Number of words, points, lines, paragraphs etc.): 
            - Summarize using x bullet points, numbered lists etc.
            - Make your response as short as possible.
        - Specify length of output
            - Use at most x words.
            - Use no more than x sentences.
            - Give your answer as a single word, either "this" or "that".
        - Ask for additional details 
            - examples and/or analogies
            - for and against arguments
        - Specify what not to do
            - Do not include x, y and z
- **Clarify**: Ask the prompt to ask clarification questions if needed
    - Ask me questions (one at a time) to (add relevant text based on the ask)
- **Validate**: Ask for proof for reducing hallucinations  and fabricated responses
    - Ask model to find relevant information, then answer the question based on the relevant information
    - Provide relevant sources and citations

??? tip "Code chunks in Prompts"
    Include code chunks in a prompt by enclosing them in single backticks followed by the name of the language:
    ```
    Some text
    `python
    some python code
    `
    More text
    ```

### Tactics[^1]
<p id="cust-id-delimiters-prompt"></p>
- **Tactic 1: Use delimiters**
    - Triple Quotes: `"""`
    - Triple backticks: ` ``` `
    - Triple dashes: `---`
    - Angle brackets: `<>`
    - XML tags: `\<tag>\</tag>`

    ??? abstract "Sample"
        ```
        text = f"""
        A paragraph of text
        """

        prompt = f"""
        Summarize the text delimited by triple backticks into a single sentence.
        ```{text}``` 
        """
        ```

- **Tactic 2: Ask for a structured output in a specified format**
    - JSON, HTML etc.
    - Markdown with structured sections and headings
        
    ??? abstract "Sample"
        ```
        # Example 1a - Simple JSON with specified keys
        prompt = f"""
        Generate a list of three bollywood movies along with their director and year of release. 

        Provide them in JSON format with the following keys: 
        Movie Name, Year of Release, Director.
        """
        ```

        ```
        # Example 1b - Simple JSON with example
        prompt = f"""
        Generate a list of three bollywood movies along with their director and year of release. 

        Provide them in JSON format as in this example:

        {
            "Movie Name": "Sholay",
            "Year of Release": 1975,
            "Director": "Ramesh Sippy"
        }
        """
        ```

        ```
        # Example 1c - Structured JSON
        prompt = f"""
        Your task is to perform the following actions: 
        1 - Write a parable.
        2 - Summarize it in a single line in Bangla.
        3 - State the moral of the parable.
        4 - Output a json object that contains the following keys: title, moral.

        Use the following format:
        Parable: <text to summarize>
        Summary: <summary>
        Moral: <moral of story>
        Output JSON: <json with title and moral>
        """
        ```

        ```
        # Example 2 - HTML Table with specified columns and datatype
        prompt = f"""
        Your task is to perform the following actions: 
        1. Prepare a list of 10 bollywood movies
        2. Find out year each of the movies was released
        3. Find out if the movie was a hit or a flop at the box office.

        Output the response as a table having three columns.
        In the first column include the name of the movie.  Use "Name" as the column title.
        In the second column include the year of release (Use "Year" as the column title ) and in the third column, include the box office result. Use "Hit or Flop" as the column title and format the value as a boolean.

        Give the table the title 'Movie Stats'.

        Format everything as HTML that can be used in a website. 
        Place the description in a <div> element.

        Output in markdown format as well. 
        """
        ```

        ```
        # Example 3 - Markdown
        prompt = f"""
        Respond to the following in markdown format. Do not wrap the markdown in a code block - respond just with the markdown: 
        ```{text}```
        """
        ```

- **Tactic 3: Ask the model to check whether conditions are satisfied**

    ??? abstract "Sample"
        ```
        text = f"""
        x=1 y=2 x+y=3
        """

        prompt = f"""
        You will be provided with text delimited by triple quotes. 
        If it contains mathematical equations, re-write the equation as a list of steps in the following format:

        Step 1 - ...
        Step 2 - …
        …
        Step N - …

        If the text does not contain contains a mathematical equation, then simply write \"No equation provided.\"

        \"\"\"{text}\"\"\"
        """
        ```

<p id="cust-id-few-shot"></p>
- **Tactic 4 - Few-Shot Prompting**
    - Provide examples of completing tasks. Then ask model to perform the task

    ??? abstract "Sample"
        ```
        prompt = f"""
        Your task is to answer in a consistent style.
        <question>: Sholay.
        <answer>: The movie "Sholay" was released in the 70s and started Amitabh and Dharmendra in the lead roles.
        <question>: Karz.
        <answer>: The movie "Karz" was released in the 80s and started Rishi Kapoor and Tina Munim in the lead roles.
        <question>: Mahaan.
        """
        ```

- **Tactic 5: Specify the steps required to complete a task**

    ??? abstract "Sample"
        ```
        prompt = f"""
        Perform the following actions: 
        1 - Write a parable.
        2 - Summarize it in a single line in Hindi.
        3 - State the moral of the parable.
        4 - Output a json object that contains the following keys: title, moral.

        Separate your answers with line breaks.
        """
        ```

- **Tactic 6: Instruct the model to work out its own solution before rushing to a conclusion**

    ??? abstract "Sample"
        ```
        prompt = f"""
        Your task is to determine if the student's solution is correct or not.
        To solve the problem do the following:
        - First, work out your own solution to the problem. 
        - Then compare your solution to the student's solution and evaluate if the student's solution is correct or not. Don't decide if the student's solution is correct until you have done the problem yourself.

        Use the following format:
        Question:
        - question here
        Student's solution:
        - student's solution here
        Actual solution:
        - steps to work out the solution and your solution here
        Is the student's solution the same as actual solution just calculated:
        - yes or no
        Student grade:
        - correct or incorrect

        Question:
        I'm producing a television show and need help
        working out the cost associated to the payments for the actors. 
        - Lead actor charges $100 / episode
        - Lead actress charges $90 / episode
        - I negotiated a contract for character actors that will cost me a flat $1K for the first 10 character actors for the entire show, and an additional $25 per additional character actor / episode
        What is the total amount I need to spend on the actors as a function of the number of episodes. Assume that I end up using a total of 12 character actors per episode.

        Student's solution:
        Let x be the number of episodes.
        Costs:
        1. Lead actor charges: 100x
        2. Lead actress charges: 90x
        3. Character actor charges: 1,000 + 300x
        Total cost: 100x + 90x + 1,000 + 300x = 490x + 1,000

        Actual solution:
        """
        ```

## Basic Examples
- **Provide context**
    - Here is some information to include in /for reference
- **[Summarize](../prompt-samples/#summarizing)**
    - Web Pages: Paste the link of the web page followed by the word `summarize`
    - Write a summary of the book xyz by abc
    - Provide an overview of some event
- **Compare**
    - Compare and contrast the concepts of (or the words ..) a and b
- **Explain/Describe** 
    - Explain the concept of xyz in simple terms
    - Explain the concept of xyz using abc analogy
    - Describe the top x abc
- **Generate**
    - Write a simple recipe for xyz
    - Share x tips for abc
    - Help me brainstorm xyz
- **[Translate/Convert](../prompt-samples/#transforming)**
    - Translate the following from one language to another language
    - Convert the following to xyz format
- **[Proofread/Review](../prompt-samples/#grammer-check)**
    - Proofread and correct any errors in the following
    - Rephrase/Structure the above for maximum impact
    - Review the above and suggest areas for improvement in terms of tone and engagement
    - Is there something I should add to make this resonate better?
- **Follow up Instructions**: Additional prompts to make changes to initial output
    - Provide x alternate versions for 
    - Make the content more/less xyz
    - Incorporate xyz to make the output more abc
    - Add more details / expand on xyz 
    - Focus on xyz

See [Prompt Samples](../prompt-samples) for more examples

## Prompt Caching
### [OpenAI](https://platform.openai.com/docs/guides/prompt-caching)
- Cache hits are only possible for **exact prefix matches** within a prompt
    - To realize caching benefits
        - Place static content like instructions and examples at the beginning of your prompt
        - Put variable content, such as user-specific information, at the end
        - Applies to images and tools as well
- Cached input is 4X cheaper
- [Pricing](https://openai.com/api/pricing/)

### [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- Have to tell Claude what you are caching
- Price is 25% MORE to "prime" the cache
    - Price is 10X less to reuse from the cache with inputs
- [Pricing](https://www.anthropic.com/pricing#api)

### [Gemini](https://ai.google.dev/gemini-api/docs/caching?lang=python)
- Supports both 'implicit' and 'explicit' prompt caching
    - Implicit caching 
        - Automatically enabled on most Gemini models
        - No cost saving guarantee
    - Explicit caching 
        - Can be manually enabled on most models
        - Cost saving guarantee
- To increase the chance of an implicit cache hit:
    - Try putting large and common contents at the beginning of your prompt
    - Try to send requests with similar prefix in a short amount of time
- [Pricing](https://ai.google.dev/gemini-api/docs/pricing?lang=python)

[^1]: Based on [DeepLearning.ai](https://learn.deeplearning.ai/chatgpt-prompt-eng/)