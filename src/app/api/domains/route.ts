export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, countFiles } from '@/lib/engine';

export async function GET() {
  try {
    const domains = [];
    if (!(await fs.stat(WIKI_DIR).catch(() => null))) {
      return NextResponse.json([]);
    }

    const ICONS: Record<string, string> = {
      "Engineering": "🛠️",
      "Software Engineering": "💻",
      "Data Science": "📊",
      "AI": "🧠",
      "Machine Learning": "🤖",
      "DevOps": "♾️",
      "OS": "🖥️",
      "Concepts": "💡",
      "Personal": "👤",
      "Meta": "🏷️",
      "General": "📦",
      "Data Engineering": "💾",
      "Product Management": "🚀"
    };

    const entries = await fs.readdir(WIKI_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const domainDir = path.join(WIKI_DIR, entry.name);
        const subdirs = await fs.readdir(domainDir, { withFileTypes: true });
        
        let pageCount = 0;
        const subdomains = [];
        let firstPage = null;

        for (const sub of subdirs) {
          const subPath = path.join(domainDir, sub.name);
          if (sub.isDirectory() && !sub.name.startsWith('.')) {
            const files = await fs.readdir(subPath);
            const mdFiles = files.filter(f => f.endsWith('.md'));
            if (mdFiles.length > 0) {
              subdomains.push(sub.name);
              pageCount += mdFiles.length;
              if (!firstPage) {
                firstPage = `${entry.name}/${sub.name}/${mdFiles[0]}`;
              }
            }
          } else if (sub.isFile() && sub.name.endsWith('.md')) {
            pageCount += 1;
            if (!firstPage) {
              firstPage = `${entry.name}/${sub.name}`;
            }
          }
        }

        if (pageCount > 0) {
          domains.push({
            name: entry.name,
            icon: ICONS[entry.name] || "📄",
            subdomainsCount: subdomains.length,
            pagesCount: pageCount,
            desc: `Explore ${subdomains.length} subdomains and ${pageCount} pages.`,
            path: firstPage
          });
        }
      }
    }

    return NextResponse.json(domains.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
