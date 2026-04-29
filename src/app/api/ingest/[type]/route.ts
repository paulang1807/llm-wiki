import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, getWikiContext, buildPageIndex } from '@/lib/engine';
import matter from 'gray-matter';

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  
  try {
    const data = await request.json();
    const { title: userTitle, date } = data;
    const ingestDate = date || new Date().toISOString().split('T')[0];
    
    let sourceContent = "";
    if (type === 'paste') {
      sourceContent = data.text;
    } else if (type === 'link') {
      try {
        const res = await fetch(data.url);
        sourceContent = await res.text();
      } catch (e) {
        sourceContent = `URL: ${data.url} (Fetch failed, processing URL only)`;
      }
    }

    const context = await getWikiContext();
    const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);

    const systemPrompt = `You are a Knowledge Synthesis Engine for a premium wiki. 
Your goal is to integrate new info into the existing knowledge graph.

EXISTING KNOWLEDGE (Summaries):
${Object.entries(context.pageSummaries).map(([t, s]) => `- ${t} (Tags: ${s.tags.join(',')}) | Snippet: ${s.snippet}`).join('\n')}

EXISTING DOMAINS (Hierarchies):
${context.existingDomains.join('\n')}

TASK:
1. Identify distinct concepts.
2. For each concept, decide whether to CREATE a new page or UPDATE an existing one.
3. DOMAIN CATEGORIZATION:
   - NEVER use 'Inbox' as a domain.
   - You MUST prioritize existing hierarchies. If a concept relates to "Git", place it in the same domain as other Git notes (e.g., "Software Engineering/Version Control/").
   - Create deep, logical hierarchies if no existing one fits perfectly.
4. SEMANTIC LINKING: You MUST find and create [[Wikilinks]] to existing pages if the new content is related. 
5. JSON SCHEMA:
{
  "concepts": [
    {
      "title": "...",
      "action": "create" | "update",
      "targetFile": "path/relative/to/wiki/...",
      "content": "Full Markdown WITH frontmatter (DO NOT wrap in code blocks). Frontmatter MUST include: title, category, tags (array), date, confidence (0.0 to 1.0).",
      "conflicts": ["..."]
    }
  ],
  "summary": "Short summary of changes"
}

CRITICAL: Output raw markdown content for each concept. Do NOT wrap the concept "content" in triple backticks or markdown markers. Ensure frontmatter is at the VERY top.`;

    const userPrompt = `Source Type: ${type}
User Suggested Title: ${userTitle || 'None'}
Ingest Date: ${ingestDate}
Source Content:
${sourceContent}`;

    const resultJsonStr = await callAI(systemPrompt, userPrompt);

    const jsonMatch = resultJsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return structured synthesis plan.");
    const plan = JSON.parse(jsonMatch[0]);

    const results = [];
    for (const concept of plan.concepts) {
      const fullPath = path.join(WIKI_DIR, concept.targetFile);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      
      // Clean up content: strip code block wrappers if AI ignored instructions
      let cleanContent = concept.content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }
      
      // Post-process to ensure valid frontmatter
      let { data: conceptData, content: conceptBody } = matter(cleanContent);
      
      // Guarantee metadata
      if (!conceptData.title) conceptData.title = concept.title;
      if (!conceptData.last_updated) conceptData.last_updated = ingestDate;
      if (!conceptData.confidence) conceptData.confidence = 0.85;
      if (!conceptData.tags || (Array.isArray(conceptData.tags) && conceptData.tags.length === 0)) {
        conceptData.tags = [concept.title.toLowerCase().replace(/\s+/g, '-')];
      }
      if (!conceptData.category) {
        const parts = concept.targetFile.split('/');
        conceptData.category = parts.length > 1 ? parts[0] : 'General';
      }
      
      let finalContent = matter.stringify(conceptBody, conceptData);
      const stats = await fs.stat(fullPath).catch(() => null);
      
      if (concept.action === 'update' && stats) {
        const existing = await fs.readFile(fullPath, 'utf-8');
        const { data: existingData, content: existingBody } = matter(existing);
        
        finalContent = matter.stringify(
          `${existingBody}\n\n## Update (${ingestDate})\n${conceptBody}`, 
          { ...existingData, ...conceptData, last_updated: ingestDate }
        );
      }

      await fs.writeFile(fullPath, finalContent, 'utf-8');
      results.push({ title: conceptData.title, file: concept.targetFile, action: concept.action, conflicts: concept.conflicts });
    }

    return NextResponse.json({ 
      success: true, 
      results,
      summary: plan.summary
    });
  } catch (err: any) {
    console.error("Synthesis Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
