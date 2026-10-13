import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getRagContext } from "@/lib/engine";
import { callOllama, isApiKeyConfigured } from "@/lib/ai";

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // Get context from wiki
    const context = await getRagContext(lastMessage);

    const systemPrompt = `You are a helpful AI assistant for a personal knowledge base called LLM Wiki. 
User notes are indexed and provided below as context. 
Answer the user's question based on the provided context if possible. 
If the answer is not in the context, use your general knowledge but mention it's not in the wiki.

CONTEXT FROM WIKI:
${context || "No specific context found in the wiki for this query."}

Keep your responses concise and formatted in Markdown.`;

    // Filter history to ensure it starts with a user message
    const history = messages.slice(0, -1).map((m: ChatMessage) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    
    // Gemini requires history to start with 'user'
    const validHistory = [];
    let foundFirstUser = false;
    for (const h of history) {
      if (h.role === 'user') foundFirstUser = true;
      if (foundFirstUser) validHistory.push(h);
    }

    let text = "";
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
    const modelsToTry = [
      process.env.DEFAULT_MODEL || "gemini-2.5-flash",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.0-flash",
      "gemini-2.5-pro"
    ].filter((v, i, a) => a.indexOf(v) === i);

    let success = false;
    if (isApiKeyConfigured(apiKey)) {
      for (const modelName of modelsToTry) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({ history: validHistory });
          const result = await chat.sendMessage(`${systemPrompt}\n\nUSER QUESTION: ${lastMessage}`);
          const res = await result.response;
          text = res.text();
          success = true;
          break;
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          if (
            error.message?.includes('429') ||
            error.message?.includes('Quota exceeded') ||
            error.message?.includes('503') ||
            error.message?.includes('404') ||
            error.message?.toLowerCase().includes('not found') ||
            error.message?.includes('fetch failed')
          ) {
            console.warn(`Chat model ${modelName} unavailable/throttled. Trying next...`);
            continue;
          }
          throw error;
        }
      }
    }

    if (!success) {
      console.warn("Falling back to Ollama for chat...");
      text = await callOllama(systemPrompt, `History: ${JSON.stringify(validHistory)}\n\nUser: ${lastMessage}`);
    }

    return NextResponse.json({ role: "assistant", content: text });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
