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

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(
      `${systemPrompt}\n\nUSER QUESTION: ${lastMessage}`
    );
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
