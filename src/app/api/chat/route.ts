import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getRagContext } from "@/lib/engine";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // Get context from wiki
    const context = await getRagContext(lastMessage);

    const model = genAI.getGenerativeModel({ 
      model: process.env.DEFAULT_MODEL || "gemini-2.0-flash" 
    });

    const systemPrompt = `You are a helpful AI assistant for a personal knowledge base called LLM Wiki. 
User notes are indexed and provided below as context. 
Answer the user's question based on the provided context if possible. 
If the answer is not in the context, use your general knowledge but mention it's not in the wiki.

CONTEXT FROM WIKI:
${context || "No specific context found in the wiki for this query."}

Keep your responses concise and formatted in Markdown.`;

    // Filter history to ensure it starts with a user message
    const history = messages.slice(0, -1)
      .map((m: any) => ({
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
    const modelsToTry = [
      process.env.DEFAULT_MODEL || "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ].filter((v, i, a) => a.indexOf(v) === i);

    let success = false;
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history: validHistory });
        const result = await chat.sendMessage(`${systemPrompt}\n\nUSER QUESTION: ${lastMessage}`);
        const res = await result.response;
        text = res.text();
        success = true;
        break;
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('Quota exceeded') || err.message?.includes('503')) {
          console.warn(`Chat model ${modelName} throttled. Trying next...`);
          continue;
        }
        throw err;
      }
    }

    if (!success) {
      console.warn("All Chat models throttled. Falling back to Ollama...");
      const { callOllama } = require("@/lib/ai");
      text = await callOllama(systemPrompt, `History: ${JSON.stringify(validHistory)}\n\nUser: ${lastMessage}`);
    }

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
