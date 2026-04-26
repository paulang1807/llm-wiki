import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string, modelName: string = "gemini-2.5-flash") {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
    ]
  });
  return result.response.text();
}

export async function callOllama(systemPrompt: string, userPrompt: string, modelName: string = "llama3") {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      system: systemPrompt,
      prompt: userPrompt,
      stream: false
    })
  });
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.response;
}
