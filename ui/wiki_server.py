import http.server
import socketserver
import json
import os
import re
import urllib.parse
from pathlib import Path

PORT = 3737
UI_DIR = Path(__file__).parent.absolute()
WIKI_ROOT = UI_DIR.parent
WIKI_DIR = WIKI_ROOT / "wiki"
RAW_DIR = WIKI_ROOT / "raw"

class WikiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR / "public"), **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path.startswith('/api/'):
            self.handle_api(url)
        else:
            # Check if file exists in public/, else serve index.html for SPA
            public_file = UI_DIR / "public" / url.path.lstrip('/')
            if not public_file.is_file() and not url.path.startswith('/api/'):
                self.path = '/index.html'
            super().do_GET()

    def handle_api(self, url):
        params = urllib.parse.parse_qs(url.query)
        
        if url.path == '/api/tree':
            data = self.walk_dir(WIKI_DIR, WIKI_DIR)
            self.send_json(data)
        elif url.path == '/api/raw-tree':
            data = self.walk_dir(RAW_DIR, RAW_DIR)
            self.send_json(data)
        elif url.path == '/api/page':
            path_val = params.get('path', [None])[0]
            if not path_val:
                self.send_error(400, "path required")
                return
            
            wiki_path = WIKI_DIR / path_val
            raw_path = RAW_DIR / path_val
            
            full_path = None
            if wiki_path.exists(): full_path = wiki_path
            elif raw_path.exists(): full_path = raw_path
            else:
                self.send_error(404, "Page not found")
                return
            
            # Security
            if not str(full_path.resolve()).startswith((str(WIKI_DIR.resolve()), str(RAW_DIR.resolve()))):
                self.send_error(403, "Forbidden")
                return
            
            try:
                content = full_path.read_text(encoding='utf-8')
                fm, body = self.parse_frontmatter(content)
                self.send_json({
                    "frontmatter": fm,
                    "body": body,
                    "path": path_val,
                    "raw": content
                })
            except Exception as e:
                self.send_error(500, str(e))
                
        elif url.path == '/api/search':
            query = params.get('q', [''])[0]
            if len(query) < 2:
                self.send_json([])
                return
            results = []
            self.search_files(WIKI_DIR, query, results, WIKI_DIR)
            self.send_json(results[:20])
            
        elif url.path == '/api/index':
            index = self.build_page_index(WIKI_DIR, {}, WIKI_DIR)
            self.send_json(index)
            
        elif url.path == '/api/graph':
            data = self.build_graph(WIKI_DIR, WIKI_DIR)
            self.send_json(data)
            
        elif url.path == '/api/stats':
            self.send_json({
                "wikiPages": self.count_files(WIKI_DIR),
                "rawSources": self.count_files(RAW_DIR)
            })
        else:
            self.send_error(404, "API endpoint not found")

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def parse_frontmatter(self, content):
        match = re.match(r'^---\n(.*?)\n---\n?(.*)$', content, re.DOTALL)
        if not match:
            return {}, content
        
        fm_text = match.group(1)
        body = match.group(2)
        fm = {}
        
        # Simple YAML-ish parser
        for line in fm_text.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                # Handle lists [a, b]
                if val.startswith('[') and val.endswith(']'):
                    val = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',')]
                # Handle numbers
                elif re.match(r'^\d+(\.\d+)?$', val):
                    val = float(val) if '.' in val else int(val)
                # Handle booleans
                elif val.lower() == 'true': val = True
                elif val.lower() == 'false': val = False
                # Handle strings
                else:
                    val = val.strip('"').strip("'")
                fm[key] = val
        return fm, body

    def walk_dir(self, directory, base_dir):
        result = []
        if not directory.exists(): return result
        
        entries = sorted(list(directory.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
        
        for entry in entries:
            if entry.name.startswith('.'): continue
            relative_path = str(entry.relative_to(base_dir))
            
            if entry.is_dir():
                result.append({
                    "type": "dir",
                    "name": entry.name,
                    "path": relative_path,
                    "children": self.walk_dir(entry, base_dir)
                })
            elif entry.name.endswith('.md'):
                title = entry.stem
                try:
                    content = entry.read_text(encoding='utf-8')
                    fm, _ = self.parse_frontmatter(content)
                    if 'title' in fm: title = fm['title']
                except: pass
                result.append({
                    "type": "file",
                    "name": entry.name,
                    "title": title,
                    "path": relative_path.replace('\\', '/')
                })
        return result

    def search_files(self, directory, query, results, base_dir):
        if not directory.exists(): return
        for entry in directory.iterdir():
            if entry.name.startswith('.'): continue
            if entry.is_dir():
                self.search_files(entry, query, results, base_dir)
            elif entry.name.endswith('.md'):
                try:
                    content = entry.read_text(encoding='utf-8')
                    fm, body = self.parse_frontmatter(content)
                    title = fm.get('title', entry.stem)
                    full_text = (body + ' ' + title).lower()
                    if query.lower() in full_text:
                        idx = full_text.find(query.lower())
                        start = max(0, idx - 80)
                        end = min(len(full_text), idx + 120)
                        snippet = ("..." if start > 0 else "") + body[start:end].replace('\n', ' ') + ("..." if end < len(body) else "")
                        results.append({
                            "path": str(entry.relative_to(base_dir)).replace('\\', '/'),
                            "title": title,
                            "category": fm.get('category', ''),
                            "snippet": snippet.strip(),
                            "confidence": fm.get('confidence', 0)
                        })
                except: pass

    def build_page_index(self, directory, index, base_dir):
        if not directory.exists(): return index
        for entry in directory.iterdir():
            if entry.name.startswith('.'): continue
            if entry.is_dir():
                self.build_page_index(entry, index, base_dir)
            elif entry.name.endswith('.md'):
                try:
                    content = entry.read_text(encoding='utf-8')
                    fm, _ = self.parse_frontmatter(content)
                    title = fm.get('title', entry.stem)
                    rel_path = str(entry.relative_to(base_dir)).replace('\\', '/')
                    index[title] = rel_path
                    index[title.lower()] = rel_path
                    index[entry.stem] = rel_path
                except: pass
        return index

    def build_graph(self, directory, base_dir):
        nodes = []
        edges = []
        index = self.build_page_index(directory, {}, base_dir)
        
        def walk(d):
            if not d.exists(): return
            for entry in d.iterdir():
                if entry.name.startswith('.'): continue
                if entry.is_dir():
                    walk(entry)
                    continue
                if not entry.name.endswith('.md'): continue
                try:
                    content = entry.read_text(encoding='utf-8')
                    fm, _ = self.parse_frontmatter(content)
                    node_id = str(entry.relative_to(base_dir)).replace('\\', '/')
                    nodes.append({
                        "id": node_id,
                        "title": fm.get('title', entry.stem),
                        "category": fm.get('category', 'meta'),
                        "confidence": fm.get('confidence', 0.8),
                        "stale": fm.get('stale', False)
                    })
                    # Wikilinks
                    wikilinks = re.findall(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content)
                    for target_title in wikilinks:
                        target_path = index.get(target_title) or index.get(target_title.lower())
                        if target_path and target_path != node_id:
                            edges.append({"source": node_id, "target": target_path})
                except: pass
        walk(directory)
        return {"nodes": nodes, "edges": list({(e['source'], e['target']) for e in edges})} # unique edges

    def count_files(self, directory):
        count = 0
        if not directory.exists(): return 0
        for entry in directory.rglob('*.md'):
            if not any(part.startswith('.') for part in entry.parts):
                count += 1
        return count

with socketserver.TCPServer(("", PORT), WikiHandler) as httpd:
    print(f"\n🧠 LLM Wiki UI (Python) running at http://localhost:{PORT}\n")
    httpd.serve_forever()
