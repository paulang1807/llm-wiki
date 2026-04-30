export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { WIKI_DIR, countMdFiles, getFirstMdPage } from '@/lib/engine';

export async function GET() {
  try {
    const domains = [];
    if (!(await fs.stat(WIKI_DIR).catch(() => null))) {
      return NextResponse.json([]);
    }

    const ICONS: Record<string, string> = {
      "engineering": "🛠️",
      "software-engineering": "💻",
      "data-science": "📊",
      "ai": "🧠",
      "machine-learning": "🤖",
      "devops": "♾️",
      "os": "🖥️",
      "concepts": "💡",
      "personal": "👤",
      "meta": "🏷️",
      "general": "📦",
      "data-engineering": "💾",
      "product-management": "🚀"
    };

    const entries = await fs.readdir(WIKI_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const domainDir = path.join(WIKI_DIR, entry.name);
        
        // Count total md pages in the entire domain tree
        const totalPages = await countMdFiles(domainDir);
        if (totalPages === 0) continue;

        // Count subdomains: immediate subdirectories that contain at least one .md file anywhere
        const subdirs = await fs.readdir(domainDir, { withFileTypes: true });
        let subdomainsCount = 0;
        for (const sub of subdirs) {
          if (sub.isDirectory() && !sub.name.startsWith('.')) {
            const hasMd = (await countMdFiles(path.join(domainDir, sub.name))) > 0;
            if (hasMd) subdomainsCount++;
          }
        }

        // Find the first actual page path deep in the tree for the "read more" link
        const firstPage = await getFirstMdPage(domainDir, WIKI_DIR);

        // Normalize name for icon lookup and display
        const normalizedKey = entry.name.toLowerCase().replace(/\s+/g, '-');
        const displayName = entry.name
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        domains.push({
          name: displayName,
          icon: ICONS[normalizedKey] || "📄",
          subdomainsCount,
          pagesCount: totalPages,
          desc: `Explore ${subdomainsCount} subdomains and ${totalPages} pages.`,
          path: firstPage
        });
      }
    }

    return NextResponse.json(domains.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err: any) {
    console.error("Domains Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
