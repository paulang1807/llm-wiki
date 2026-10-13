import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callAI, callOllama, isApiKeyConfigured } from '../lib/ai';

// Mock fetch globally
global.fetch = vi.fn();

describe('AI Utility Fallback & Key Detection Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_API_KEY = 'mock-key';
    delete process.env.GEMINI_API_KEY;
    process.env.DEFAULT_MODEL = 'gemini-2.5-flash';
  });

  it('isApiKeyConfigured returns false for missing or placeholder keys', () => {
    expect(isApiKeyConfigured(undefined)).toBe(false);
    expect(isApiKeyConfigured('')).toBe(false);
    expect(isApiKeyConfigured('your_api_key_here')).toBe(false);
    expect(isApiKeyConfigured('your_gemini_api_key_here')).toBe(false);
    expect(isApiKeyConfigured('YOUR_GEMINI_API_KEY_HERE')).toBe(false);
    expect(isApiKeyConfigured('valid-key-123')).toBe(true);
  });

  it('callOllama throws a descriptive error when fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('fetch failed'));

    await expect(callOllama('sys', 'user')).rejects.toThrow(
      'AI Fallback Failed: fetch failed. Is Ollama running at http://127.0.0.1:11434?'
    );
  });

  it('callAI falls back to Ollama when API key is a placeholder', async () => {
    process.env.GOOGLE_API_KEY = 'your_gemini_api_key_here';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'Ollama fallback response' })
    } as Response);

    const res = await callAI('sys prompt', 'user prompt');
    expect(res).toBe('Ollama fallback response');
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:11434/api/generate',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
