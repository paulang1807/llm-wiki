import { NextResponse } from 'next/server';
import { isApiKeyConfigured } from '@/lib/ai';

export async function GET() {
  const geminiReady = isApiKeyConfigured(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
  return NextResponse.json({
    geminiReady,
    defaultProvider: geminiReady ? "gemini" : "ollama"
  });
}
