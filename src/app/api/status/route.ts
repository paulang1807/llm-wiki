import { NextResponse } from 'next/server';

export async function GET() {
  const geminiReady = !!process.env.GEMINI_API_KEY;
  return NextResponse.json({
    geminiReady,
    defaultProvider: geminiReady ? "gemini" : "ollama"
  });
}
