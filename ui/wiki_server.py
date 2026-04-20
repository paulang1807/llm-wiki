import http.server
import socketserver
import json
import os
import re
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

PORT = 3737
UI_DIR = Path(__file__).parent.absolute()
WIKI_ROOT = UI_DIR.parent
WIKI_DIR = WIKI_ROOT / "wiki"
RAW_DIR = WIKI_ROOT / "raw"

# --- Environment & Configuration ---
def load_env():
    env = {}
    env_path = WIKI_ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().split('\n'):
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

ENV = load_env()
CONFIG = {
    "gemini_key": ENV.get('GOOGLE_API_KEY') or ENV.get('GEMINI_API_KEY'),
    "ollama_url": ENV.get('OLLAMA_URL', "http://localhost:11434"),
    "default_model": ENV.get('DEFAULT_MODEL', "gemini-2.5-flash")
}

class WikiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR / "public"), **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path.startswith('/api/'):
            self.handle_api_get(url)
        else:
            # Check if file exists in public/, else serve index.html for SPA
            public_file = UI_DIR / "public" / url.path.lstrip('/')
            if not public_file.is_file() and not url.path.startswith('/api/'):
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        if url.path == '/api/ask':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_ask(data)
        else:
            self.send_error(404, "Endpoint not found")

    def handle_api_get(self, url):
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
        elif url.path == '/api/status':
            self.send_json({
                "geminiReady": bool(CONFIG["gemini_key"]),
                "defaultProvider": "gemini" if CONFIG["gemini_key"] else "ollama"
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

    # --- AI / RAG Logic ---
    def handle_ask(self, data):
        query = data.get('query', '')
        provider = data.get('provider', 'gemini')
        model = data.get('model', '')
        
        if not query:
            self.send_error(400, "Query required")
            return

        # 1. Retrieve Context (Search)
        results = []
        self.search_files(WIKI_DIR, query, results, WIKI_DIR)
        
        context_parts = []
        # Sort by confidence or just take top 3
        top_results = sorted(results, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
        
        for r in top_results:
            try:
                content = (WIKI_DIR / r['path']).read_text(encoding='utf-8')
                fm, body = self.parse_frontmatter(content)
                context_parts.append(f"PAGE: {r['title']}\nCATEGORY: {r['category']}\nCONTENT:\n{body}")
            except: pass
        
        context_text = "\n\n---\n\n".join(context_parts)
        
        system_prompt = (
            "You are the LLM Wiki AI, a helpful technical assistant. "
            "Use the provided wiki context to answer the user's question. "
            "If the answer isn't in the context, use your own knowledge but clarify it's not from the wiki. "
            "Format your response in professional Markdown with code blocks where appropriate.\n\n"
            f"WIKI CONTEXT:\n{context_text}"
        )

        try:
            if provider == 'gemini':
                ans = self.call_gemini(system_prompt, query, CONFIG["gemini_key"], model or CONFIG["default_model"])
            elif provider == 'ollama':
                ans = self.call_ollama(system_prompt, query, model or "llama3.1")
            else:
                ans = "Error: Unsupported AI provider."
            
            self.send_json({"answer": ans, "sources": [r['title'] for r in top_results]})
        except Exception as e:
            self.send_json({"error": str(e)})

    def call_gemini(self, system, user, key, model):
        if not key: return "Error: Gemini API key missing. Please add GOOGLE_API_KEY to your .env file."
        # Use validated model from CONFIG
        url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={key}"
        payload = {
            "contents": [{
                "role": "user",
                "parts": [{"text": f"{system}\n\nUSER QUESTION: {user}"}]
            }]
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as res:
                resp_data = json.loads(res.read().decode('utf-8'))
                return resp_data['candidates'][0]['content']['parts'][0]['text']
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_json = json.loads(error_body)
                msg = error_json.get('error', {}).get('message', str(e))
                return f"Gemini API Error: {msg}"
            except:
                return f"Gemini API HTTP Error: {str(e)} - {error_body}"
        except Exception as e:
            return f"Error calling Gemini: {str(e)}"

    def call_ollama(self, system, user, model):
        url = f"{CONFIG['ollama_url']}/v1/chat/completions"
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ]
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as res:
                resp_data = json.loads(res.read().decode('utf-8'))
                return resp_data['choices'][0]['message']['content']
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return f"Ollama Error ({e.code}): {error_body}"
        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}. Make sure it is running at {CONFIG['ollama_url']}."

with socketserver.TCPServer(("", PORT), WikiHandler) as httpd:
    print(f"\n🧠 LLM Wiki UI (Python) running at http://localhost:{PORT}\n")
    httpd.serve_forever()
