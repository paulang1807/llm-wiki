import { NextResponse } from 'next/server';
import { callGemini, callOllama } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, RAW_DIR } from '@/lib/engine';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  
  try {
    const data = await request.json();
    const { title, date } = data;
    const ingestDate = date || new Date().toISOString().split('T')[0];
    
    // Simplistic ingestion for now, just to have parity
    let content = "";
    if (type === 'paste') {
      content = data.text;
    } else if (type === 'link') {
      content = `Extracted content from link: ${data.url}`;
    }

    const systemPrompt = `You are an AI organizing notes into a wiki. 
Output valid markdown with frontmatter.
IMPORTANT: 
- Use the title: "${title || "Untitled"}" if provided, otherwise create a good one.
- Use the date: "${ingestDate}" in the frontmatter.
- Categorize the note appropriately.`;

    const userPrompt = `Process this text:\n\n${content}`;
    
    const apiKey = process.env.GOOGLE_API_KEY;
    const modelName = process.env.DEFAULT_MODEL || "gemini-2.0-flash";
    let resultText = "";
    if (apiKey) {
      resultText = await callGemini(systemPrompt, userPrompt, apiKey, modelName);
    } else {
      resultText = await callOllama(systemPrompt, userPrompt);
    }

    // Save to inbox or directly
    const filename = `${title ? title.toLowerCase().replace(/\s+/g, '-') : 'ingested'}-${Date.now()}.md`;
    const fullPath = path.join(WIKI_DIR, 'Inbox', filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, resultText, 'utf-8');

    return NextResponse.json({ success: true, path: `Inbox/${filename}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
