---
title: "AI Agents"
category: genai
tags: [agents, tools, function-calling, agentic-ai, orchestration, llm]
sources: [raw/genai/agents.md, raw/genai/frameworks.md]
confidence: 0.92
last_updated: 2026-04-19
stale: false
related: [[LLM Concepts]], [[Prompting]], [[GenAI Frameworks]], [[RAG]]
---

# AI Agents

AI Agents are LLMs equipped with tools that allow them to act autonomously — calling APIs, running code, orchestrating sub-tasks, and looping until a goal is achieved.

## What Makes an Agent

An agent is an LLM that can:
- Call other LLMs, APIs, and external functions
- Control workflow and orchestration via tools
- Run tools in a **loop** to achieve a goal
- Create and track a to-do list to monitor progress

## Tools

Tools extend LLM capabilities beyond text generation:

| Capability | Examples |
|-----------|---------|
| Fetch external data | Web search, database queries, API calls |
| Perform calculations | Code execution, math, data analysis |
| Take actions | File system access, UI modification, sending messages |
| Run code | Python interpreter, shell commands |

### Tool Specification (JSON Schema)
```python
tool_specs = [{"type": "function", "function": JSON_specs_of_function}]

JSON_specs_of_function = {
    "name": "name_of_function",
    "description": "Description of what this function does.",
    "parameters": {
        "type": "object",
        "properties": {
            "param1": {
                "type": "string",
                "description": "Description of param1."
            },
            "param2": {
                "type": "string",
                "enum": ["option1", "option2"],
                "description": "Description of param2."
            }
        },
        "required": ["param1"],
        "additionalProperties": False
    }
}
```

## Function Calling Pattern

Complete agentic loop using OpenAI API:

### 1. Define Tool Call Handler
```python
def handle_tool_calls(message):
    responses = []
    for tool_call in message.tool_calls:
        function_name = tool_call.function.name
        if function_name not in globals():
            responses.append({
                "role": "tool",
                "content": f"Error: Function {function_name} not found.",
                "tool_call_id": tool_call.id
            })
            continue
        arguments = json.loads(tool_call.function.arguments)
        print(f"Calling: {function_name} with {arguments}")
        result = globals()[function_name](**arguments)
        responses.append({
            "role": "tool",          # Note: different role type from user/assistant/system
            "content": result,
            "tool_call_id": tool_call.id
        })
    return responses
```

### 2. Call LLM with Tools
```python
response = openai.chat.completions.create(
    model=MODEL,
    messages=messages,
    tools=tool_specs    # pass tool specs here
)
```

### 3. Agentic Loop
```python
# Keep calling until LLM stops requesting tools
while response.choices[0].finish_reason == "tool_calls":
    message = response.choices[0].message
    tool_responses = handle_tool_calls(message)
    messages.append(message)
    messages.extend(tool_responses)
    response = openai.chat.completions.create(
        model=MODEL,
        messages=messages
    )
# finish_reason == "stop" → agent is done
```

## Agent Architecture Patterns

| Pattern | Description |
|---------|-------------|
| **ReAct** | Reason + Act: alternate between thinking and tool use |
| **Plan & Execute** | Create plan upfront, then execute steps |
| **Multi-Agent** | Orchestrator agent delegates to specialist agents |
| **RAG Agent** | Agent uses retrieval as one of its tools |

## Key Concepts

- **`finish_reason`** — signals why the model stopped:
  - `"tool_calls"` → model wants to call a tool
  - `"stop"` → response complete, no more tools needed
- **Tool role** — tool responses use `role: "tool"` (not user/assistant/system)
- **Tool call ID** — each tool call has an ID to match request with response

## Relationships
- [[LLM Concepts]] — temperature, context window affect agent behaviour
- [[Prompting]] — system prompts define agent persona and tool usage rules
- [[GenAI Frameworks]] — LangChain, LlamaIndex provide high-level agent abstractions
- [[RAG]] — retrieval is often implemented as an agent tool

## Source References
- `raw/genai/agents.md` — agent definition, tools, function calling pattern
- `raw/genai/frameworks.md` — agent frameworks overview
