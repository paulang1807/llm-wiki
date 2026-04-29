import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string, modelName: string = "gemini-2.0-flash", multimodalPart?: any) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const parts = [{ text: systemPrompt + "\n\n" + userPrompt }];
    if (multimodalPart) parts.push(multimodalPart);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });
    return result.response.text();
  } catch (err: any) {
    if (err.message?.includes('429') || err.message?.includes('Quota exceeded')) {
      console.warn("Gemini Quota Exceeded. Attempting fallback to Ollama...");
      // For Ollama fallback, we currently only send text as most common models (llama3) are text-only
      // unless we explicitly check for vision models.
      return callOllama(systemPrompt, userPrompt);
    }
    throw err;
  }
}

export async function callOllama(systemPrompt: string, userPrompt: string, modelName: string = process.env.OLLAMA_MODEL || "llama3") {
  try {
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
      throw new Error(`Ollama error: ${response.statusText}. Is Ollama running?`);
    }
    const data = await response.json();
    return data.response;
  } catch (err: any) {
    throw new Error(`AI Fallback Failed: ${err.message}`);
  }
}

/**
 * Unified AI entry point with cascading fallback across Gemini models,
 * then finally falling back to Ollama.
 */
export async function callAI(systemPrompt: string, userPrompt: string, multimodalPart?: any) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const preferredModel = process.env.DEFAULT_MODEL || "gemini-2.0-flash";
  
  if (!apiKey) {
    return callOllama(systemPrompt, userPrompt);
  }

  // List of models to try in order
  const modelsToTry = [
    preferredModel,
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
  ].filter((v, i, a) => a.indexOf(v) === i); // Unique models

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI synthesis with ${modelName}...`);
      // We call the raw GoogleAI logic here to avoid the built-in fallback in callGemini
      // so we can control the cascade.
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const parts = [{ text: systemPrompt + "\n\n" + userPrompt }];
      if (multimodalPart) parts.push(multimodalPart);

      const result = await model.generateContent({
        contents: [{ role: 'user', parts }]
      });
      return result.response.text();
    } catch (err: any) {
      const isQuotaError = err.message?.includes('429') || err.message?.includes('Quota exceeded');
      if (isQuotaError) {
        console.warn(`${modelName} quota exceeded. Trying next model...`);
        continue;
      }
      // If it's a model-not-found error (503 or 404), also try next
      if (err.message?.includes('503') || err.message?.includes('not found')) {
        console.warn(`${modelName} unavailable. Trying next model...`);
        continue;
      }
      throw err; // For other errors (auth, etc.), stop and throw
    }
  }

  console.warn("All Gemini models exhausted or throttled. Falling back to Ollama...");
  return callOllama(systemPrompt, userPrompt);
}
