import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const WIKI_DIR = path.join(process.cwd(), 'wiki');
export const RAW_DIR = path.join(process.cwd(), 'raw');

export async function getWikiContext() {
  const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
  const titles = Object.keys(index);
  
  const allTags = new Set<string>();
  const domains = new Set<string>();
  const pageSummaries: Record<string, { tags: string[], snippet: string }> = {};
  
  async function scan(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        domains.add(path.relative(WIKI_DIR, fullPath));
        await scan(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data, content: body } = matter(content);
        const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
        tags.forEach((t: string) => allTags.add(t));
        
        const title = data.title || path.basename(fullPath, '.md');
        pageSummaries[title] = {
          tags,
          snippet: body.slice(0, 200).replace(/\n/g, ' ') + '...'
        };
      }
    }
  }
  
  await scan(WIKI_DIR);
  
  return {
    existingTitles: titles,
    existingDomains: Array.from(domains),
    existingTags: Array.from(allTags),
    pageSummaries
  };
}

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

export interface HealthIssue {
  id: string;
  type: 'broken_link' | 'orphan' | 'stale' | 'missing_title' | 'empty_content' | 'untagged' | 'duplicate_title' | 'tag_inconsistency' | 'missing_connection';
  severity: 'high' | 'medium' | 'low';
  message: string;
  file: string;
  details?: any;
  fixable: boolean;
}

export async function performHealthCheck(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
  const titles = Object.keys(index).filter(k => k === index[k as any]); // This is not quite right, index maps title to path
  
  // Correctly get unique titles and paths
  const titleToPaths: Record<string, string[]> = {};
  for (const [title, path] of Object.entries(index)) {
    if (!titleToPaths[title.toLowerCase()]) titleToPaths[title.toLowerCase()] = [];
    if (!titleToPaths[title.toLowerCase()].includes(path)) {
      titleToPaths[title.toLowerCase()].push(path);
    }
  }

  const filePaths = Array.from(new Set(Object.values(index)));
  const incomingLinks: Record<string, number> = {};
  const fileTags: Record<string, string[]> = {};
  filePaths.forEach(p => incomingLinks[p] = 0);

  const STALE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  const allTags: Record<string, string[]> = {}; // lowercase -> original

  async function checkFile(fullPath: string) {
    const relPath = path.relative(WIKI_DIR, fullPath).replace(/\\/g, '/');
    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const { data, content: body } = matter(content);

    const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
    fileTags[relPath] = tags;

    // 1. Stale
    if (now - stats.mtimeMs > STALE_THRESHOLD_MS && !data.stale) {
      issues.push({ id: `stale-${relPath}`, type: 'stale', severity: 'low', message: `Stale content.`, file: relPath, fixable: true });
    }

    // 2. Empty
    if (body.trim().length < 50) {
      issues.push({ id: `empty-${relPath}`, type: 'empty_content', severity: 'medium', message: `Empty or very short content.`, file: relPath, fixable: false });
    }

    // 3. Title
    if (!data.title) {
      issues.push({ id: `title-${relPath}`, type: 'missing_title', severity: 'medium', message: `Missing frontmatter title.`, file: relPath, details: { suggested: path.basename(relPath, '.md') }, fixable: true });
    }

    // 4. Untagged
    if (tags.length === 0) {
      issues.push({ id: `untagged-${relPath}`, type: 'untagged', severity: 'low', message: `Page has no tags.`, file: relPath, fixable: true });
    } else {
      tags.forEach((t: string) => {
        const lower = t.toLowerCase();
        if (!allTags[lower]) allTags[lower] = [];
        if (!allTags[lower].includes(t)) allTags[lower].push(t);
      });
    }

    // 5. Broken Links & Incoming Links
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    const linkedInFile = new Set<string>();
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const target = match[1].trim();
      let targetPath = index[target] || index[target.toLowerCase()];
      if (targetPath) {
        incomingLinks[targetPath] = (incomingLinks[targetPath] || 0) + 1;
        linkedInFile.add(target.toLowerCase());
      } else {
        issues.push({ id: `broken-${relPath}-${target}`, type: 'broken_link', severity: 'high', message: `Broken link to [[${target}]]`, file: relPath, fixable: false });
      }
    }

    // 6. Missing Connections (Potential Links)
    for (const title of Object.keys(index)) {
      if (title.length < 4) continue; // Skip very short titles
      if (linkedInFile.has(title.toLowerCase())) continue;
      if (data.title?.toLowerCase() === title.toLowerCase()) continue;

      const titleRegex = new RegExp(`\\b${title}\\b`, 'i');
      if (titleRegex.test(body)) {
        issues.push({
          id: `conn-${relPath}-${title}`,
          type: 'missing_connection',
          severity: 'low',
          message: `Potential missing connection to "[[${title}]]"`,
          file: relPath,
          details: { suggestedLink: title },
          fixable: false
        });
      }
    }
  }

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.name.endsWith('.md')) await checkFile(fullPath);
    }
  }

  await walk(WIKI_DIR);

  // 7. Orphans
  for (const [filePath, count] of Object.entries(incomingLinks)) {
    if (count === 0 && !filePath.toLowerCase().includes('index')) {
      issues.push({ id: `orphan-${filePath}`, type: 'orphan', severity: 'medium', message: `Orphaned note.`, file: filePath, fixable: true });
    }
  }

  // 8. Duplicates
  for (const [title, paths] of Object.entries(titleToPaths)) {
    if (paths.length > 1) {
      paths.forEach(p => {
        issues.push({ id: `dup-${p}`, type: 'duplicate_title', severity: 'medium', message: `Duplicate title "${title}" shared with ${paths.filter(x => x !== p).length} other(s).`, file: p, fixable: false });
      });
    }
  }

  // 9. Tag Inconsistencies
  for (const [lower, originals] of Object.entries(allTags)) {
    if (originals.length > 1) {
      issues.push({ id: `tag-inc-${lower}`, type: 'tag_inconsistency', severity: 'low', message: `Inconsistent tag casing: ${originals.join(', ')}`, file: 'N/A', details: { tags: originals }, fixable: false });
    }
  }

  return issues;
}

export async function repairHealthIssue(issue: HealthIssue) {
  if (issue.file === 'N/A') return { success: false, message: "Cannot auto-repair global issues." };
  const fullPath = path.join(WIKI_DIR, issue.file);
  const content = await fs.readFile(fullPath, 'utf-8');
  const { data, content: body } = matter(content);

  switch (issue.type) {
    case 'stale': 
      data.stale = true; 
      break;
    case 'missing_title': 
      data.title = issue.details?.suggested || path.basename(issue.file, '.md'); 
      break;
    case 'orphan': {
      // Actually try to find links to this file in other files
      const title = data.title || path.basename(issue.file, '.md');
      const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
      let foundAny = false;
      
      for (const [otherTitle, otherPath] of Object.entries(index)) {
        if (otherPath === issue.file) continue;
        const otherFullPath = path.join(WIKI_DIR, otherPath);
        const otherContent = await fs.readFile(otherFullPath, 'utf-8');
        const { data: otherData, content: otherBody } = matter(otherContent);
        
        const titleRegex = new RegExp(`(?<!\\[\\[)\\b${title}\\b(?!\\]\\])`, 'gi');
        if (titleRegex.test(otherBody)) {
          const newOtherBody = otherBody.replace(titleRegex, `[[${title}]]`);
          await fs.writeFile(otherFullPath, matter.stringify(newOtherBody, otherData), 'utf-8');
          foundAny = true;
        }
      }
      
      if (!foundAny) {
        // Tag it as needs-linking but return a message
        data.tags = Array.from(new Set([...(data.tags || []), 'needs-linking']));
        await fs.writeFile(fullPath, matter.stringify(body, data), 'utf-8');
        return { 
          success: false, 
          message: `No mentions of "${title}" found in other notes. The issue will remain until related content is ingested and links can be synthesized.` 
        };
      }
      break;
    }
    case 'untagged': 
      data.tags = ['needs-tagging']; 
      break;
    default: 
      throw new Error(`Auto-repair not implemented for ${issue.type}`);
  }

  await fs.writeFile(fullPath, matter.stringify(body, data), 'utf-8');
  return { success: true };
}
