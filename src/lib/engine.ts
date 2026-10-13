import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import {
  Frontmatter,
  PageNode,
  Edge,
  TreeNode,
  SearchResult,
  HealthIssue
} from './types';

export type { Frontmatter, PageNode, Edge, TreeNode, SearchResult, HealthIssue };

export const DATA_DIR = process.env.DATA_DIR || process.cwd();
export const WIKI_DIR = process.env.WIKI_DIR || path.join(DATA_DIR, 'wiki');
export const RAW_DIR = process.env.RAW_DIR || path.join(DATA_DIR, 'raw');
export const ARCHIVE_DIR = process.env.ARCHIVE_DIR || path.join(DATA_DIR, 'archive');

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isMeaningfulTag(tag: string): boolean {
  const cleaned = tag.trim().replace(/^#+/, '').trim();
  if (cleaned.length < 2) return false;
  const alphaNumMatches = cleaned.match(/[a-z0-9]/gi);
  return Boolean(alphaNumMatches && alphaNumMatches.length >= 2);
}

export function normalizeTags(rawTags: unknown, fallbackTitle?: string): string[] {
  const candidates: string[] = [];

  if (Array.isArray(rawTags)) {
    for (const item of rawTags) {
      if (typeof item === 'string') {
        candidates.push(...item.split(','));
      }
    }
  } else if (typeof rawTags === 'string') {
    candidates.push(...rawTags.split(','));
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of candidates) {
    const cleaned = raw
      .trim()
      .replace(/^#+/, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');

    if (!isMeaningfulTag(cleaned)) continue;

    const lower = cleaned.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(cleaned);
    }
  }

  if (result.length === 0 && fallbackTitle) {
    const fallback = fallbackTitle
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/^-+|-+$/g, '');
    if (isMeaningfulTag(fallback)) {
      result.push(fallback);
    }
  }

  return result;
}

export function isSafeWikiPath(targetPath: string, baseDir: string = WIKI_DIR): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, targetPath);
  return resolvedTarget.startsWith(resolvedBase + path.sep);
}

export async function getWikiContext() {
  const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
  const titles = Object.keys(index);
  
  const allTags = new Set<string>();
  const domains = new Set<string>();
  const pageSummaries: Record<string, { tags: string[], snippet: string }> = {};
  
  async function scan(dir: string) {
    try {
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
          const tags = normalizeTags(data.tags);
          tags.forEach((t: string) => allTags.add(t));
          
          const title = data.title || path.basename(fullPath, '.md');
          pageSummaries[title] = {
            tags,
            snippet: body.slice(0, 200).replace(/\n/g, ' ') + '...'
          };
        }
      }
    } catch {
      // Ignore missing or unreadable directory
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
  } catch {
    return 0;
  }
}

export async function countMdFiles(dir: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        count += await countMdFiles(path.join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

export async function getFirstMdPage(dir: string, baseDir: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    // Prefer files in the current dir first
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('.')) {
        return path.relative(baseDir, path.join(dir, entry.name)).replace(/\\/g, '/');
      }
    }
    // Then recurse into subdirs
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const found = await getFirstMdPage(path.join(dir, entry.name), baseDir);
        if (found) return found;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function walkDir(dir: string, baseDir: string): Promise<TreeNode[]> {
  const result: TreeNode[] = [];
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
  } catch {
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
  } catch {
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

          const tags = normalizeTags(data.tags).filter(
            t => t.toLowerCase() !== 'needs-linking' && t.toLowerCase() !== 'needs-tagging'
          );

          let category = data.category;
          if (!category || category === 'meta') {
            const pathParts = nodeId.split('/');
            category = pathParts.length > 1 ? pathParts[0] : 'General';
          }

          nodes.push({
            id: nodeId,
            title: data.title || entry.name.replace('.md', ''),
            category,
            confidence: data.confidence ?? 0.85,
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
    } catch {
      // Ignore
    }
  }

  await walk(WIKI_DIR);
  return { nodes, edges };
}

export async function searchFiles(query: string): Promise<SearchResult[]> {
  if (!query || !query.trim()) return [];

  const results: SearchResult[] = [];
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
          if (queryTerms.length === 0) queryTerms.push(query.trim().toLowerCase());
          
          let matches = 0;
          for (const term of queryTerms) {
            if (fullText.includes(term)) matches++;
          }
          
          if (matches > 0) {
            const bodyLower = body.toLowerCase();
            const idx = bodyLower.indexOf(queryTerms[0]);
            const start = Math.max(0, (idx === -1 ? 0 : idx) - 80);
            const end = Math.min(body.length, (idx === -1 ? 0 : idx) + 120);
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
    } catch {
      // Ignore
    }
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
      const { content: body } = matter(content);
      context += `[Source: ${r.path}]\n${body.substring(0, 1500)}\n\n`;
    } catch {
      // Ignore
    }
  }
  return context;
}

export async function performHealthCheck(): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
  
  // Correctly get unique titles and paths
  const titleToPaths: Record<string, string[]> = {};
  const canonicalTitles: string[] = [];
  const seenPathsForCanonical = new Set<string>();

  for (const [title, filePath] of Object.entries(index)) {
    if (!titleToPaths[title.toLowerCase()]) titleToPaths[title.toLowerCase()] = [];
    if (!titleToPaths[title.toLowerCase()].includes(filePath)) {
      titleToPaths[title.toLowerCase()].push(filePath);
    }
    if (!seenPathsForCanonical.has(filePath)) {
      seenPathsForCanonical.add(filePath);
      canonicalTitles.push(title);
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

    const tags = normalizeTags(data.tags);
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
      const targetPath = index[target] || index[target.toLowerCase()];
      if (targetPath) {
        incomingLinks[targetPath] = (incomingLinks[targetPath] || 0) + 1;
        linkedInFile.add(target.toLowerCase());
      } else {
        issues.push({ id: `broken-${relPath}-${target}`, type: 'broken_link', severity: 'high', message: `Broken link to [[${target}]]`, file: relPath, fixable: false });
      }
    }

    // 6. Missing Connections (Potential Links)
    for (const title of canonicalTitles) {
      if (title.length < 4) continue; // Skip very short titles
      if (linkedInFile.has(title.toLowerCase())) continue;
      if (data.title?.toLowerCase() === title.toLowerCase()) continue;
      if (index[title] === relPath) continue;

      const escapedTitle = escapeRegExp(title);
      const titleRegex = new RegExp(`\\b${escapedTitle}\\b`, 'i');
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
      const escapedTitle = escapeRegExp(title);
      const index = await buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
      const uniquePaths = Array.from(new Set(Object.values(index)));
      let foundAny = false;
      
      for (const otherPath of uniquePaths) {
        if (otherPath === issue.file) continue;
        const otherFullPath = path.join(WIKI_DIR, otherPath);
        const otherContent = await fs.readFile(otherFullPath, 'utf-8');
        const { data: otherData, content: otherBody } = matter(otherContent);
        
        const titleRegex = new RegExp(`(?<!\\[\\[)\\b${escapedTitle}\\b(?!\\]\\])`, 'gi');
        if (titleRegex.test(otherBody)) {
          const newOtherBody = otherBody.replace(titleRegex, `[[${title}]]`);
          await fs.writeFile(otherFullPath, matter.stringify(newOtherBody, otherData), 'utf-8');
          foundAny = true;
        }
      }
      
      if (!foundAny) {
        // Normalize existing tags first (so string tags are never spread into single characters)
        const existingTags = normalizeTags(data.tags);
        data.tags = Array.from(new Set([...existingTags, 'needs-linking']));
        await fs.writeFile(fullPath, matter.stringify(body, data), 'utf-8');
        return { 
          success: false, 
          message: `No mentions of "${title}" found in other notes. The issue will remain until related content is ingested and links can be synthesized.` 
        };
      }
      break;
    }
    case 'untagged': {
      const cleaned = normalizeTags(data.tags);
      data.tags = cleaned.length > 0 ? cleaned : ['needs-tagging']; 
      break;
    }
    default: 
      throw new Error(`Auto-repair not implemented for ${issue.type}`);
  }

  await fs.writeFile(fullPath, matter.stringify(body, data), 'utf-8');
  return { success: true };
}

/**
 * Robustly cleans AI-generated JSON strings that might contain unescaped 
 * control characters (like raw newlines) within string literals, and handles
 * common AI mistakes like trailing commas.
 */
export function cleanAIJSON(raw: string): string {
  // 1. Extract the JSON block
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) return raw;
  
  const jsonBlock = raw.slice(start, end + 1);
  
  // 2. Process the block character by character to handle escapes and state
  let result = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonBlock.length; i++) {
    const char = jsonBlock[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      // Inside a string: escape control characters
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        const code = char.charCodeAt(0);
        if (code < 32) {
          result += `\\u${code.toString(16).padStart(4, '0')}`;
        } else {
          result += char;
        }
      }
    } else {
      // Outside a string: handle trailing commas and formatting
      if (char === ',' && i + 1 < jsonBlock.length) {
        // Look ahead to see if this is a trailing comma
        let lookAhead = i + 1;
        while (lookAhead < jsonBlock.length && /\s/.test(jsonBlock[lookAhead])) {
          lookAhead++;
        }
        if (lookAhead < jsonBlock.length && (jsonBlock[lookAhead] === '}' || jsonBlock[lookAhead] === ']')) {
          // Skip this comma
          continue;
        }
      }
      result += char;
    }
  }
  
  return result;
}
