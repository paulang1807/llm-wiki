import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export function isApiKeyConfigured(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return !lower.includes('your_') && !lower.includes('api_key_here');
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  modelName: string = "gemini-2.0-flash",
  multimodalPart?: Part,
  jsonMode: boolean = false,
  fallbackToOllama: boolean = true
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: modelName, generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined },
      { apiVersion: 'v1beta' }
    );
    
    const parts: Part[] = [{ text: systemPrompt + "\n\n" + userPrompt }];
    if (multimodalPart) parts.push(multimodalPart);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });
    return result.response.text();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (fallbackToOllama && (error.message?.includes('429') || error.message?.includes('Quota exceeded'))) {
      console.warn("Gemini Quota Exceeded. Attempting fallback to Ollama...");
      // For Ollama fallback, we currently only send text as most common models (llama3) are text-only
      // unless we explicitly check for vision models.
      return callOllama(systemPrompt, userPrompt, undefined, jsonMode);
    }
    throw error;
  }
}

export async function callOllama(
  systemPrompt: string,
  userPrompt: string,
  modelName: string = process.env.OLLAMA_MODEL || "llama3",
  jsonMode: boolean = false
) {
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
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err instanceof Error ? err : new Error(String(err));
    if (error.name === 'AbortError') {
      throw new Error(`AI Fallback Failed: Ollama request timed out after 10s.`);
    }
    const isConnectionError = error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED');
    const hint = isConnectionError ? " Is Ollama running at http://127.0.0.1:11434?" : "";
    throw new Error(`AI Fallback Failed: ${error.message}.${hint}`);
  }
}

/**
 * Unified AI entry point with cascading fallback across Gemini models,
 * then finally falling back to Ollama.
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  multimodalPart?: Part,
  jsonMode: boolean = true
) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const preferredModel = process.env.DEFAULT_MODEL || "gemini-2.5-flash";
  
  if (!isApiKeyConfigured(apiKey)) {
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
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    try {
      console.log(`[AI CASCADE] Attempting ${modelName} (v1)...`);
      const responseText = await callGemini(
        systemPrompt,
        userPrompt,
        apiKey!,
        modelName,
        multimodalPart,
        jsonMode,
        false
      );
      
      clearTimeout(timeoutId);
      console.log(`[AI CASCADE] SUCCESS with ${modelName}`);
      return responseText;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.warn(`[AI CASCADE] ${modelName} TIMEOUT after 90s.`);
        continue;
      }
      console.warn(`[AI CASCADE] ${modelName} FAILED: ${error.message}`);
      
      const isQuotaError = error.message?.includes('429') || error.message?.includes('Quota exceeded');
      if (isQuotaError) {
        console.warn(`${modelName} quota exceeded. Trying next model...`);
        continue;
      }
      
      const isUnavailable = error.message?.includes('503') || 
                             error.message?.includes('404') || 
                             error.message?.toLowerCase().includes('not found') ||
                             error.message?.includes('unsupported') ||
                             error.message?.includes('fetch failed') ||
                             error.message?.includes('ECONN');
                             
      if (isUnavailable) {
        console.warn(`${modelName} unavailable, not supported, or network glitch. Trying next model...`);
        continue;
      }
      
      console.error(`[AI CASCADE] Non-recoverable error with ${modelName}. Stopping cascade.`);
      throw error; 
    }
  }

  console.error(`[AI CASCADE] EXHAUSTED all Gemini models. Last error: ${lastError?.message}`);
  console.warn("Falling back to Ollama as a last resort. Ensure Ollama is running and the model is pulled.");
  
  try {
    return await callOllama(systemPrompt, userPrompt, undefined, jsonMode);
  } catch (ollamaErr: unknown) {
    const error = ollamaErr instanceof Error ? ollamaErr : new Error(String(ollamaErr));
    throw new Error(`AI Synthesis Failed: All Gemini models failed (${lastError?.message}), and Ollama fallback also failed (${error.message}).`);
  }
}

