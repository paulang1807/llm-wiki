const express = require('express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
const PORT = 3737;

// Wiki root is one level up from ui/
const WIKI_ROOT = path.join(__dirname, '..');
const WIKI_DIR = path.join(WIKI_ROOT, 'wiki');
const RAW_DIR = path.join(WIKI_ROOT, 'raw');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  try {
    const frontmatter = yaml.load(match[1]) || {};
    return { frontmatter, body: match[2] };
  } catch {
    return { frontmatter: {}, body: content };
  }
}

function getPageSlug(filePath) {
  // Convert file path relative to wiki dir into a slug
  return path.relative(WIKI_DIR, filePath).replace(/\.md$/, '').replace(/\\/g, '/');
}

function walkDir(dir, baseDir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    if (entry.isDirectory()) {
      result.push({ type: 'dir', name: entry.name, path: relativePath, children: walkDir(fullPath, baseDir) });
    } else if (entry.name.endsWith('.md')) {
      // Read title from frontmatter
      let title = entry.name.replace(/\.md$/, '');
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        if (frontmatter.title) title = frontmatter.title;
      } catch {}
      result.push({ type: 'file', name: entry.name, title, path: relativePath.replace(/\\/g, '/') });
    }
  }
  return result;
}

function searchFiles(dir, query, results, baseDir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchFiles(fullPath, query, results, baseDir);
    } else if (entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        const lowerContent = (body + ' ' + (frontmatter.title || '')).toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (lowerContent.includes(lowerQuery)) {
          // Extract snippet
          const idx = lowerContent.indexOf(lowerQuery);
          const start = Math.max(0, idx - 80);
          const end = Math.min(lowerContent.length, idx + 120);
          const snippet = (start > 0 ? '...' : '') + body.slice(start, end).replace(/\n/g, ' ') + (end < body.length ? '...' : '');
          results.push({
            path: path.relative(baseDir, fullPath).replace(/\\/g, '/'),
            title: frontmatter.title || entry.name.replace(/\.md$/, ''),
            category: frontmatter.category || '',
            snippet: snippet.trim(),
            confidence: frontmatter.confidence,
          });
        }
      } catch {}
    }
  }
}

function buildPageIndex(dir, index = {}, baseDir) {
  if (!fs.existsSync(dir)) return index;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      buildPageIndex(fullPath, index, baseDir);
    } else if (entry.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        const title = frontmatter.title || entry.name.replace(/\.md$/, '');
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        // Map title variations to file path
        index[title] = relativePath;
        index[title.toLowerCase()] = relativePath;
        // Also map filename without extension
        const slug = entry.name.replace(/\.md$/, '');
        index[slug] = relativePath;
      } catch {}
    }
  }
  return index;
}

function buildGraph(dir, baseDir) {
  const nodes = [];
  const edges = [];
  const index = buildPageIndex(dir, {}, baseDir);

  function walk(d) {
    if (!fs.existsSync(d)) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(fullPath); continue; }
      if (!entry.name.endsWith('.md')) continue;
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        const id = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        nodes.push({
          id,
          title: frontmatter.title || entry.name.replace(/\.md$/, ''),
          category: frontmatter.category || 'meta',
          confidence: frontmatter.confidence || 0.8,
          stale: frontmatter.stale || false,
        });
        // Parse wikilinks as edges
        const wikilinkRe = /\[\[([^\]]+)\]\]/g;
        let m;
        while ((m = wikilinkRe.exec(content)) !== null) {
          const targetTitle = m[1];
          const targetPath = index[targetTitle] || index[targetTitle.toLowerCase()];
          if (targetPath && targetPath !== id) {
            edges.push({ source: id, target: targetPath });
          }
        }
      } catch {}
    }
  }
  walk(dir);
  return { nodes, edges };
}

// ─── API Routes ──────────────────────────────────────────────────────────────

// Navigation tree
app.get('/api/tree', (req, res) => {
  const tree = walkDir(WIKI_DIR, WIKI_DIR);
  res.json(tree);
});

// Raw-source tree
app.get('/api/raw-tree', (req, res) => {
  const tree = walkDir(RAW_DIR, RAW_DIR);
  res.json(tree);
});

// Page content
app.get('/api/page', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'path required' });

  const wikiPath = path.join(WIKI_DIR, filePath);
  const rawPath = path.join(RAW_DIR, filePath);

  let fullPath = null;
  if (fs.existsSync(wikiPath)) fullPath = wikiPath;
  else if (fs.existsSync(rawPath)) fullPath = rawPath;
  else return res.status(404).json({ error: 'Page not found' });

  // Security: must be within wiki or raw
  if (!fullPath.startsWith(WIKI_DIR) && !fullPath.startsWith(RAW_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    res.json({ frontmatter, body, path: filePath, raw: content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search
app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  if (query.length < 2) return res.json([]);
  const results = [];
  searchFiles(WIKI_DIR, query, results, WIKI_DIR);
  res.json(results.slice(0, 20));
});

// Page index (for wikilink resolution client-side)
app.get('/api/index', (req, res) => {
  const index = buildPageIndex(WIKI_DIR, {}, WIKI_DIR);
  res.json(index);
});

// Graph data
app.get('/api/graph', (req, res) => {
  const graph = buildGraph(WIKI_DIR, WIKI_DIR);
  res.json(graph);
});

// Stats
app.get('/api/stats', (req, res) => {
  const wikiFiles = [];
  searchFiles(WIKI_DIR, '', { push: () => {} }, WIKI_DIR); // dummy
  function countFiles(dir) {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) count += countFiles(fp);
      else if (e.name.endsWith('.md')) count++;
    }
    return count;
  }
  res.json({
    wikiPages: countFiles(WIKI_DIR),
    rawSources: countFiles(RAW_DIR),
  });
});

app.listen(PORT, () => {
  console.log(`\n🧠 LLM Wiki UI running at http://localhost:${PORT}\n`);
});
