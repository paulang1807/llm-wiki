import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string, modelName: string = "gemini-2.0-flash", multimodalPart?: any, jsonMode: boolean = false) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: modelName, generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined },
      { apiVersion: 'v1beta' }
    );
    
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

export async function callOllama(systemPrompt: string, userPrompt: string, modelName: string = process.env.OLLAMA_MODEL || "llama3", jsonMode: boolean = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        system: systemPrompt,
        prompt: userPrompt,
        stream: false,
        format: jsonMode ? "json" : undefined
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const hint = response.status === 404 ? " (Model not found. Try 'ollama pull " + modelName + "')" : "";
      throw new Error(`Ollama error: ${response.statusText}. Status: ${response.status}${hint}`);
    }
    const data = await response.json();
    return data.response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`AI Fallback Failed: Ollama request timed out after 10s.`);
    }
    const isConnectionError = err.message?.includes('fetch failed') || err.message?.includes('ECONNREFUSED');
    const hint = isConnectionError ? " Is Ollama running at http://127.0.0.1:11434?" : "";
    throw new Error(`AI Fallback Failed: ${err.message}.${hint}`);
  }
}

/**
 * Unified AI entry point with cascading fallback across Gemini models,
 * then finally falling back to Ollama.
 */
export async function callAI(systemPrompt: string, userPrompt: string, multimodalPart?: any, jsonMode: boolean = true) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const preferredModel = process.env.DEFAULT_MODEL || "gemini-1.5-flash";
  
  if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
    console.warn("GOOGLE_API_KEY is missing or placeholder. Falling back to Ollama.");
    return callOllama(systemPrompt, userPrompt, undefined, jsonMode);
  }

  // List of models to try in order (Verified for 2026 environment via v1 API)
  const modelsToTry = [
    preferredModel,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-pro"
  ].filter((v, i, a) => a.indexOf(v) === i); // Unique models

  console.log(`[AI CASCADE] Starting cascade with ${modelsToTry.length} models...`);

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout like Python

    try {
      console.log(`[AI CASCADE] Attempting ${modelName} (v1)...`);
      const responseText = await callGemini(systemPrompt, userPrompt, apiKey, modelName, multimodalPart, jsonMode);
      
      clearTimeout(timeoutId);
      console.log(`[AI CASCADE] SUCCESS with ${modelName}`);
      return responseText;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      
      if (err.name === 'AbortError') {
        console.warn(`[AI CASCADE] ${modelName} TIMEOUT after 90s.`);
        continue;
      }
      console.warn(`[AI CASCADE] ${modelName} FAILED: ${err.message}`);
      
      const isQuotaError = err.message?.includes('429') || err.message?.includes('Quota exceeded');
      if (isQuotaError) {
        console.warn(`${modelName} quota exceeded. Trying next model...`);
        continue;
      }
      
      const isUnavailable = err.message?.includes('503') || 
                             err.message?.includes('404') || 
                             err.message?.toLowerCase().includes('not found') ||
                             err.message?.includes('unsupported') ||
                             err.message?.includes('fetch failed') ||
                             err.message?.includes('ECONN');
                             
      if (isUnavailable) {
        console.warn(`${modelName} unavailable, not supported, or network glitch. Trying next model...`);
        continue;
      }
      
      console.error(`[AI CASCADE] Non-recoverable error with ${modelName}. Stopping cascade.`);
      throw err; 
    }
  }

  console.error(`[AI CASCADE] EXHAUSTED all Gemini models. Last error: ${lastError?.message}`);
  console.warn("Falling back to Ollama as a last resort. Ensure Ollama is running and the model is pulled.");
  
  try {
    return await callOllama(systemPrompt, userPrompt, undefined, jsonMode);
  } catch (ollamaErr: any) {
    throw new Error(`AI Synthesis Failed: All Gemini models failed (${lastError?.message}), and Ollama fallback also failed (${ollamaErr.message}).`);
  }
}
