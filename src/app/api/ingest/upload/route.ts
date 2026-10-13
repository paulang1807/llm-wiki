import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, getWikiContext, cleanAIJSON, normalizeTags } from '@/lib/engine';
import matter from 'gray-matter';

function inferMimeType(fileName: string, providedType?: string): string {
  if (providedType && providedType !== 'application/octet-stream') {
    return providedType;
  }
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.md':
    case '.markdown': return 'text/markdown';
    case '.txt': return 'text/plain';
    case '.csv': return 'text/csv';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    default: return providedType || 'text/plain';
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const context = await getWikiContext();
    const resolvedWikiDir = path.resolve(WIKI_DIR);
    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = inferMimeType(file.name, file.type);
      const isTextFile =
        mimeType.startsWith('text/') ||
        mimeType === 'application/json' ||
        /\.(md|markdown|txt|csv|json)$/i.test(file.name);

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
4. FORMATTING: Use PURE Markdown ONLY. NEVER use HTML tags like <u>, <b>, <i>, etc. Use markdown equivalents (__, **, [[ ]]).
5. Output a JSON object following this schema:
{
  "concepts": [
    {
      "title": "...",
      "action": "create" | "update",
      "targetFile": "...",
      "content": "Markdown with frontmatter (DO NOT wrap in code blocks). Frontmatter tags MUST be a YAML array of 2-5 meaningful lowercase kebab-case topic strings (at least 2 characters each).",
      "conflicts": []
    }
  ],
  "summary": "..."
}`;

      const userPrompt = isTextFile
        ? `File: ${file.name}\n\nContent:\n${buffer.toString('utf-8')}`
        : `File: ${file.name}`;

      const multimodalPart = isTextFile
        ? undefined
        : {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType: mimeType
            }
          };

      const resultJsonStr = await callAI(systemPrompt, userPrompt, multimodalPart);
      const cleanedJson = cleanAIJSON(resultJsonStr);
      if (!cleanedJson || !cleanedJson.trim().startsWith('{')) continue;
      
      const plan = JSON.parse(cleanedJson);
      if (!plan || !Array.isArray(plan.concepts)) continue;
      
      for (const concept of plan.concepts) {
        const fullPath = path.join(WIKI_DIR, concept.targetFile);
        if (!path.resolve(fullPath).startsWith(resolvedWikiDir + path.sep)) {
          throw new Error(`Invalid targetFile path: ${concept.targetFile}`);
        }
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        // Clean up content: strip code block wrappers if AI ignored instructions
        let cleanContent = concept.content.trim();
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }
        
        const { data: conceptData, content: conceptBody } = matter(cleanContent);
        
        // Guarantee metadata
        if (!conceptData.title) conceptData.title = concept.title;
        if (!conceptData.last_updated) conceptData.last_updated = new Date().toISOString().split('T')[0];
        if (!conceptData.confidence) conceptData.confidence = 0.85;
        conceptData.tags = normalizeTags(conceptData.tags, concept.title);
        if (!conceptData.category) {
          const parts = concept.targetFile.split('/');
          conceptData.category = parts.length > 1 ? parts[0] : 'General';
        }

        let finalContent = matter.stringify(conceptBody, conceptData);
        const stats = await fs.stat(fullPath).catch(() => null);
        
        if (concept.action === 'update' && stats) {
          const existing = await fs.readFile(fullPath, 'utf-8');
          const { data: existingData, content: existingBody } = matter(existing);
          const mergedTags = normalizeTags(
            [...normalizeTags(existingData.tags), ...normalizeTags(conceptData.tags)],
            conceptData.title
          );
          
          finalContent = matter.stringify(
            `${existingBody}\n\n## Update (File: ${file.name})\n${conceptBody}`, 
            { ...existingData, ...conceptData, tags: mergedTags, last_updated: new Date().toISOString().split('T')[0] }
          );
        }

        await fs.writeFile(fullPath, finalContent, 'utf-8');
        results.push({ title: concept.title, file: concept.targetFile, action: concept.action });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Upload Synthesis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
