import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { callAI } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, getWikiContext } from '@/lib/engine';
import matter from 'gray-matter';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const context = await getWikiContext();
    const apiKey = process.env.GOOGLE_API_KEY;
    const modelName = process.env.DEFAULT_MODEL || "gemini-2.0-flash";

    const results = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'application/octet-stream';
      const base64Data = buffer.toString('base64');

      const systemPrompt = `You are a Knowledge Synthesis Engine for a premium wiki.
You are processing an uploaded file: ${file.name} (${mimeType}).

EXISTING KNOWLEDGE (Summaries):
${Object.entries(context.pageSummaries).map(([t, s]) => `- ${t} (Tags: ${s.tags.join(',')}) | Snippet: ${s.snippet}`).join('\n')}

EXISTING DOMAINS:
${context.existingDomains.join('\n')}

TASK:
1. Extract and synthesize content.
2. DOMAIN CATEGORIZATION: NEVER use 'Inbox'. Prioritize existing hierarchies.
3. SEMANTIC LINKING: Find and create [[Wikilinks]] to existing pages.
4. Output a JSON object following this schema:
{
  "concepts": [
    {
      "title": "...",
      "action": "create" | "update",
      "targetFile": "...",
      "content": "Markdown with frontmatter (DO NOT wrap in code blocks)",
      "conflicts": []
    }
  ],
  "summary": "..."
}`;

      const resultJsonStr = await callAI(systemPrompt, `File: ${file.name}`, {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      const jsonMatch = resultJsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      
      const plan = JSON.parse(jsonMatch[0]);
      
      for (const concept of plan.concepts) {
        const fullPath = path.join(WIKI_DIR, concept.targetFile);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        // Clean up content: strip code block wrappers if AI ignored instructions
        let cleanContent = concept.content.trim();
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }
        
        let finalContent = cleanContent;
        const stats = await fs.stat(fullPath).catch(() => null);
        if (concept.action === 'update' && stats) {
          const existing = await fs.readFile(fullPath, 'utf-8');
          const { data: existingData, content: existingBody } = matter(existing);
          const { content: newBody } = matter(cleanContent);
          
          finalContent = matter.stringify(
            `${existingBody}\n\n## Update (File: ${file.name})\n${newBody}`, 
            { ...existingData, last_updated: new Date().toISOString().split('T')[0] }
          );
        }

        await fs.writeFile(fullPath, finalContent, 'utf-8');
        results.push({ title: concept.title, file: concept.targetFile, action: concept.action });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Upload Synthesis Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
