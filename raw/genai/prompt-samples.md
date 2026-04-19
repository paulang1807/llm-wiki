## General[^1]
### Summarizing

>
**Example 1** - Your task is to generate a short summary of a product review to give feedback to the pricing department.  
Summarize the review below, delimited by triple backticks, in at most 2 sentences, and focusing on any aspects that are relevant to the price and perceived value.  
` ```{text}``` `
---
>
**Example 2 (Use 'extract' instead of summarize)** - Your task is to generate a short summary of a product review to give feedback to the pricing deparmtment.  
From the review below, delimited by triple quotes extract the information relevant to the price and perceived value. Limit to 2 sentences.  
` ```{text}``` `

### Inferring
##### Sentiments and Emotions

>
**Example 1** - What is the sentiment of the writer in the following text, which is delimited with triple backticks?  
Give your answer as a single word, either "positive" or "negative".  
` ```{text}``` `
---
>
**Example 2** - Identify a list of emotions expressed by the writer of the following review . Include no more than three items in the list.  Format your answer as a comma separated list in upper case.  
` ```{text}``` `

##### Specific Pieces of Information
>
Identify the following items from the text delimited with triple backticks:  
- Movie Name  
- Year Of Release  
Format your response as a JSON object with "Name" and "Year" as the keys. 
If the information isn't present, use "unknown" as the value.  
` ```{text}``` `

##### Topics
>
**Example 1** - Determine five topics that are being discussed in the following text, which is delimited by triple backticks.  
Make each item one or two words long.  
Format your response as a list of items separated by commas.  
` ```{text}``` `
---
>
**Example 2 (Zero Shot Algorithm)** - Determine whether each item in the following list of topics is a topic in the text below, which is delimited with triple backticks.  
Give your answer as list with 0 or 1 for each topic. Format the response as a JSON  with the following keys: topic, included  
List of topics:  
\`python  
topic_list = ["topic1", "topic2", "topic3", "topic4", "topic5"]  
{", ".join(topic_list)}  
\`  
` ```{text}``` `

### Transforming
##### Language Translation
>
Translate the following text delimited by triple backticks to bengali.  
Provide both formal and informal translations.  
` ```Who are you``` `

##### Tone Transformation
>
Translate the following from slang to a business letter:  
'Holy shit, This stuff doesn't work. Get me a new one.'

##### Format Conversion
>
Translate the following python dictionary from JSON to an HTML table with column headers and title: {json_text}

##### Grammer Check
>
Proofread and correct the following text and rewrite the corrected version. Make it more compelling.  
` ```{text}``` `

### Email Response
>
Your task is to send an email reply to a valued customer.  
Given the customer email delimited by \`\`\`, identify the sentiment of the email.  
Generate a reply to thank the customer for their review.  
If the sentiment is positive or neutral, thank them for their review.  
If the sentiment is negative, apologize and suggest that they can reach out to customer service.  
Make sure to use specific details from the review.  
Write in a concise and professional tone.  
Sign the email as `AI customer agent`.  
` ```{email_text}``` `

## Coding
### [Python](https://colab.research.google.com/drive/146LYw3gjAQxpEkb3PoCvLkvle5wWALop)
##### Get Data
>
You are an expert in python and data analysis in pandas, numpy and matplotlib. We will be working with google collab for writing code. The project for today is to write the code to make a few plots. First we need to extract the data frame of passengers on titanic from the following link.  
https://en.wikipedia.org/wiki/Passengers_of_the_Titanic  
Give me the code to do that.  

##### Create Visuals
>
Let's create a histogram using the matplotlib library, ensuring that xlabels and ticks don't overlap and the graph is visually appealing for a PowerPoint presentation.

##### Generate Content
>
Run a python script to generate a pptx file containing the above visuals. Include 2 bullet points in each slide to summarize the insights from the visuals.

[^1]: Based on [DeepLearning.ai](https://learn.deeplearning.ai/chatgpt-prompt-eng/)