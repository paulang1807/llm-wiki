import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const WIKI_DIR = path.join(process.cwd(), 'wiki');
export const RAW_DIR = path.join(process.cwd(), 'raw');

export interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  confidence?: number;
  stale?: boolean;
  related?: string[];
  [key: string]: any;
}

export interface PageNode {
  id: string;
  title: string;
  category: string;
  confidence: number;
  stale: boolean;
  tags: string[];
  snippet: string;
}

export interface Edge {
  source: string;
  target: string;
}

export async function countFiles(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        count += await countFiles(path.join(dir, entry.name));
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        count++;
      }
    }
    return count;
  } catch (err) {
    return 0;
  }
}

export async function walkDir(dir: string, baseDir: string): Promise<any[]> {
  const result = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const children = await walkDir(fullPath, baseDir);
        if (children.length > 0) {
          result.push({
            type: 'dir',
            name: entry.name,
            path: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
            children: children
          });
        }
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data } = matter(content);
        result.push({
          type: 'file',
          name: entry.name,
          title: data.title || entry.name.replace('.md', ''),
          path: path.relative(baseDir, fullPath).replace(/\\/g, '/')
        });
      }
    }
  } catch (err) {
    // Ignore
  }
  return result;
}

export async function buildPageIndex(dir: string, index: Record<string, string>, baseDir: string): Promise<Record<string, string>> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await buildPageIndex(fullPath, index, baseDir);
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data } = matter(content);
        if (data.stale) continue;
        const title = data.title || entry.name.replace('.md', '');
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        index[title] = relPath;
        index[title.toLowerCase()] = relPath;
        index[entry.name.replace('.md', '')] = relPath;
      }
    }
  } catch (err) {
    // Ignore
  }
  return index;
}

export async function buildGraph(): Promise<{ nodes: PageNode[], edges: Edge[] }> {
  const nodes: PageNode[] = [];
  const edges: Edge[] = [];
  const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);

  async function walk(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const { data, content: body } = matter(content);
          const nodeId = path.relative(WIKI_DIR, fullPath).replace(/\\/g, '/');
          
          let snippet = body.slice(0, 120).replace(/\n/g, ' ').trim();
          if (body.length > 120) snippet += '...';

          let tags: string[] = [];
          if (Array.isArray(data.tags)) tags = data.tags;
          else if (typeof data.tags === 'string') tags = [data.tags];

          nodes.push({
            id: nodeId,
            title: data.title || entry.name.replace('.md', ''),
            category: data.category || 'meta',
            confidence: data.confidence ?? 0.8,
            stale: data.stale ?? false,
            tags,
            snippet
          });

          const targets = new Set<string>();
          
          // 1. Wikilinks [[Page]] or [[Page|Text]]
          const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
          let match;
          while ((match = wikiLinkRegex.exec(content)) !== null) {
            targets.add(match[1].trim());
          }

          // 2. Standard Markdown links [Text](path.md)
          const mdLinkRegex = /\[[^\]]+\]\(([^)]+\.md)\)/g;
          while ((match = mdLinkRegex.exec(content)) !== null) {
            targets.add(match[1].trim());
          }

          // 3. Frontmatter 'related' field
          if (Array.isArray(data.related)) {
            data.related.forEach(t => targets.add(t.replace(/[\[\]]/g, '').trim()));
          } else if (typeof data.related === 'string') {
            targets.add(data.related.replace(/[\[\]]/g, '').trim());
          }

          for (const targetVal of targets) {
            let targetPath = index[targetVal] || index[targetVal.toLowerCase()];
            if (!targetPath && targetVal.endsWith('.md')) {
              targetPath = Object.values(index).find(p => p.endsWith(targetVal)) || '';
            }
            if (targetPath && targetPath !== nodeId) {
              edges.push({ source: nodeId, target: targetPath });
            }
          }
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  await walk(WIKI_DIR);
  return { nodes, edges };
}

export async function searchFiles(query: string) {
  // Use ripgrep via child_process if available, otherwise fallback to simple JS search
  try {
    const { stdout } = await execAsync(`rg -i -n -C 2 "${query}" "${WIKI_DIR}"`);
    // Parse ripgrep output
    // A full ripgrep parser is complex, so let's fallback to node search for simplicity in this implementation,
    // or just return raw results formatted.
    // For now, let's implement a simple node-based search to guarantee it works cross-platform.
  } catch (err) {
    // rg might fail if no match is found, or not installed
  }
  
  // Fallback JS search
  const results: any[] = [];
  async function searchDir(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const { data, content: body } = matter(content);
          if (data.stale) continue;
          
          const title = data.title || entry.name.replace('.md', '');
          const fullText = (body + ' ' + title).toLowerCase();
          const queryTerms = query.split(/\s+/).filter(t => t.length > 2).map(t => t.toLowerCase());
          if (queryTerms.length === 0) queryTerms.push(query.toLowerCase());
          
          let matches = 0;
          for (const term of queryTerms) {
            if (fullText.includes(term)) matches++;
          }
          
          if (matches > 0) {
            const bodyLower = body.toLowerCase();
            const idx = bodyLower.indexOf(queryTerms[0]);
            const start = Math.max(0, idx - 80);
            const end = Math.min(body.length, idx + 120);
            const snippet = body.slice(start, end).replace(/\n/g, ' ').trim();
            
            results.push({
              path: path.relative(WIKI_DIR, fullPath).replace(/\\/g, '/'),
              title,
              category: data.category || '',
              snippet,
              confidence: (data.confidence ?? 0.5) * (matches / queryTerms.length)
            });
          }
        }
      }
    } catch (err) {}
  }
  
  await searchDir(WIKI_DIR);
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, 20);
}

export async function getRagContext(query: string) {
  const results = await searchFiles(query);
  let context = "";
  for (const r of results.slice(0, 3)) {
    try {
      const fullPath = path.join(WIKI_DIR, r.path);
      const content = await fs.readFile(fullPath, 'utf-8');
      const { data, content: body } = matter(content);
      context += `[Source: ${r.path}]\n${body.substring(0, 1500)}\n\n`;
    } catch (err) {}
  }
  return context;
}
