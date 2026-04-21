import http.server
import socketserver
import json
import os
import re
import urllib.parse
import urllib.request
import urllib.error
import datetime
import time
import shutil
import cgi
import pypdf
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

# --- Core Wiki Engine ---
class WikiEngine:
    def __init__(self, wiki_dir, raw_dir):
        self.wiki_dir = wiki_dir
        self.raw_dir = raw_dir

    def parse_frontmatter(self, content, file_path=None):
        match = re.match(r'^---\n(.*?)\n---\n?(.*)$', content, re.DOTALL)
        if not match:
            fm = {}
            body = content
        else:
            fm_text = match.group(1)
            body = match.group(2)
            fm = {}
            for line in fm_text.split('\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith('[') and val.endswith(']'):
                        val = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',')]
                    elif re.match(r'^\d+(\.\d+)?$', val):
                        val = float(val) if '.' in val else int(val)
                    elif val.lower() == 'true': val = True
                    elif val.lower() == 'false': val = False
                    else:
                        val = val.strip('"').strip("'")
                    fm[key] = val
        
        if 'last_updated' not in fm and file_path and os.path.exists(file_path):
            mtime = os.path.getmtime(file_path)
            fm['last_updated'] = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            
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
                    fm, _ = self.parse_frontmatter(content, file_path=str(entry))
                    if fm.get('stale'): continue # Skip stale files in tree
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
                    fm, body = self.parse_frontmatter(content, file_path=str(entry))
                    if fm.get('stale'): continue # Skip stale files in search
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
                    fm, _ = self.parse_frontmatter(content, file_path=str(entry))
                    if fm.get('stale'): continue # Skip stale files in index
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
                    fm, _ = self.parse_frontmatter(content, file_path=str(entry))
                    node_id = str(entry.relative_to(base_dir)).replace('\\', '/')
                    nodes.append({
                        "id": node_id,
                        "title": fm.get('title', entry.stem),
                        "category": fm.get('category', 'meta'),
                        "confidence": fm.get('confidence', 0.8),
                        "stale": fm.get('stale', False)
                    })
                    wikilinks = re.findall(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content)
                    for target_title in wikilinks:
                        target_path = index.get(target_title) or index.get(target_title.lower())
                        if target_path and target_path != node_id:
                            edges.append({"source": node_id, "target": target_path})
                except: pass
        walk(directory)
        return {"nodes": nodes, "edges": list({(e['source'], e['target']) for e in edges})}

    def count_files(self, directory):
        if not directory.exists(): return 0
        return len(list(directory.rglob('*.md')))

    def get_rag_context(self, query):
        results = []
        self.search_files(self.wiki_dir, query, results, self.wiki_dir)
        top_results = sorted(results, key=lambda x: x.get('confidence', 0), reverse=True)[:3]
        context_parts = []
        for r in top_results:
            try:
                content = (self.wiki_dir / r['path']).read_text(encoding='utf-8')
                fm, body = self.parse_frontmatter(content, file_path=str(self.wiki_dir / r['path']))
                context_parts.append(f"PAGE: {r['title']}\nCATEGORY: {r['category']}\nCONTENT:\n{body}")
            except: pass
        return "\n\n---\n\n".join(context_parts), [r['title'] for r in top_results]

ENGINE = WikiEngine(WIKI_DIR, RAW_DIR)

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
        elif url.path == '/api/archive':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_archive(data)
        elif url.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            self.handle_save(data)
        elif url.path == '/api/upload':
            self.handle_upload()
        elif url.path == '/api/ingest-inbox':
            self.handle_ingest_inbox()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_api_get(self, url):
        params = urllib.parse.parse_qs(url.query)
        
        if url.path == '/api/tree':
            data = ENGINE.walk_dir(WIKI_DIR, WIKI_DIR)
            self.send_json(data)
        elif url.path == '/api/raw-tree':
            data = ENGINE.walk_dir(RAW_DIR, RAW_DIR)
            self.send_json(data)
        elif url.path == '/api/page':
            path_val = params.get('path', [None])[0]
            if not path_val:
                self.send_error(400, "path required")
                return
            
            wiki_path = WIKI_DIR / path_val
            raw_path = RAW_DIR / path_val
            full_path = wiki_path if wiki_path.exists() else (raw_path if raw_path.exists() else None)
            
            if not full_path:
                self.send_error(404, "Page not found")
                return
            
            try:
                content = full_path.read_text(encoding='utf-8')
                fm, body = ENGINE.parse_frontmatter(content, file_path=str(full_path))
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
            ENGINE.search_files(WIKI_DIR, query, results, WIKI_DIR)
            self.send_json(results[:20])
            
        elif url.path == '/api/index':
            index = ENGINE.build_page_index(WIKI_DIR, {}, WIKI_DIR)
            self.send_json(index)
            
        elif url.path == '/api/graph':
            data = ENGINE.build_graph(WIKI_DIR, WIKI_DIR)
            self.send_json(data)
            
        elif url.path == '/api/stats':
            self.send_json({
                "wikiPages": ENGINE.count_files(WIKI_DIR),
                "rawSources": ENGINE.count_files(RAW_DIR)
            })
        elif url.path == '/api/status':
            self.send_json({
                "geminiReady": bool(CONFIG["gemini_key"]),
                "defaultProvider": "gemini" if CONFIG["gemini_key"] else "ollama"
            })
        else:
            self.send_error(404, "API endpoint not found")

    def send_json(self, data):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
        except Exception as e:
            print(f"Error sending JSON: {e}")

    def handle_archive(self, data):
        path_val = data.get('path', '')
        if not path_val:
            self.send_error(400, "Path required")
            return
            
        wiki_path = WIKI_DIR / path_val
        raw_path = RAW_DIR / path_val
        target_file = wiki_path if wiki_path.exists() else (raw_path if raw_path.exists() else None)
        
        if not target_file:
            self.send_error(404, f"File not found: {path_val}")
            return
            
        archive_root = WIKI_ROOT / "archive"
        rel_to_root = target_file.relative_to(WIKI_ROOT)
        dest_path = archive_root / rel_to_root
        
        try:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(target_file), str(dest_path))
            self.send_json({"status": "archived", "destination": str(dest_path.relative_to(WIKI_ROOT))})
        except Exception as e:
            self.send_error(500, f"Archive failed: {str(e)}")

    def handle_save(self, data):
        path_val = data.get('path', '')
        content = data.get('content', '')
        
        if not path_val:
            self.send_error(400, "Path required")
            return
            
        # Security: Prevent directory traversal
        if '..' in path_val or path_val.startswith('/'):
            self.send_error(403, "Invalid path")
            return
            
        full_path = WIKI_DIR / path_val
        
        try:
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding='utf-8')
            
            fm, _ = ENGINE.parse_frontmatter(content, file_path=str(full_path))
            self.send_json({
                "status": "saved",
                "path": path_val,
                "title": fm.get('title', full_path.stem)
            })
        except Exception as e:
            self.send_error(500, f"Save failed: {str(e)}")

    def extract_text_from_pdf(self, file_path):
        try:
            reader = pypdf.PdfReader(str(file_path))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n\n".join(text_parts)
        except Exception as e:
            print(f"PDF Extraction Error for {file_path}: {e}")
            return f"Error: Unable to extract text from PDF: {str(e)}"

    def handle_upload(self):
        try:
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            if 'file' not in form:
                self.send_error(400, "No file uploaded")
                return
                
            file_item = form['file']
            if not file_item.filename:
                self.send_error(400, "No filename provided")
                return
                
            filename = os.path.basename(file_item.filename)
            inbox_path = RAW_DIR / "inbox" / filename
            inbox_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(inbox_path, 'wb') as f:
                f.write(file_item.file.read())
                
            self.send_json({"status": "uploaded", "filename": filename})
        except Exception as e:
            self.send_error(500, f"Upload failed: {str(e)}")

    def handle_ingest_inbox(self):
        inbox = RAW_DIR / "inbox"
        if not inbox.exists():
            self.send_json({"processed": 0, "status": "Inbox empty"})
            return
            
        files = [f for f in inbox.iterdir() if f.is_file() and not f.name.startswith('.')]
        if not files:
            self.send_json({"processed": 0, "status": "Inbox empty"})
            return
            
        processed = []
        for f in files:
            try:
                result = self.ingest_one_file(f)
                processed.append(result)
            except Exception as e:
                print(f"Error ingesting {f.name}: {e}")
                
        self.send_json({"processed": len(processed), "items": processed})

    def ingest_one_file(self, file_path):
        if file_path.suffix.lower() == '.pdf':
            content = self.extract_text_from_pdf(file_path)
            if not content.strip():
                content = f"Note: PDF extraction returned no text for {file_path.name}. Detailed analysis may be required."
        else:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        system_prompt = (
            "You are the LLM Wiki Ingestion AI. Your task is to categorize and synthesize a raw note into a high-quality wiki page.\n"
            "Respond ONLY with a valid Markdown file containing YAML frontmatter and a clean, technical summary of the note.\n\n"
            "FRONTMATTER FIELDS:\n"
            "- title: Descriptive title\n"
            "- category: One of [python, ml, genai, concepts, meta, os]\n"
            "- tags: List of relevant keywords\n"
            "- confidence: float 0.0 to 1.0\n"
            "- related: List of [[Wiki Link]] to related pages if any\n"
            "- sources: List of source filenames\n\n"
            "EXAMPLE OUTPUT:\n"
            "---\ntitle: Git Basics\ncategory: os\ntags: [git, version control]\nconfidence: 1.0\n---\n# Git Basics\n..."
        )
        
        user_prompt = f"SOURCE FILENAME: {file_path.name}\nCONTENT:\n{content}"
        
        # Use provider based on readiness
        provider = "gemini" if CONFIG["gemini_key"] else "ollama"
        if provider == 'gemini':
            ans = self.call_gemini(system_prompt, user_prompt, CONFIG["gemini_key"], CONFIG["default_model"])
        else:
            ans = self.call_ollama(system_prompt, user_prompt, "llama3.1")
            
        # Parse result
        fm, _ = ENGINE.parse_frontmatter(ans)
        title = fm.get('title', file_path.stem)
        category = fm.get('category', 'meta')
        # Sanitize filename
        safe_name = re.sub(r'[^a-z0-9\-]', '', title.lower().replace(' ', '-'))
        if not safe_name: safe_name = "untitled"
        filename = safe_name + ".md"
        dest_path = WIKI_DIR / category / filename
        
        # Write to Wiki
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_text(ans, encoding='utf-8')
        
        # Move raw source to raw/ instead of deleting
        raw_dest = RAW_DIR / file_path.name
        if raw_dest.exists(): # Handle collision
            raw_dest = RAW_DIR / f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file_path.name}"
        shutil.move(str(file_path), str(raw_dest))
        
        return {"title": title, "path": f"{category}/{filename}"}

    # --- AI / RAG Logic ---
    def handle_ask(self, data):
        query = data.get('query', '')
        provider = data.get('provider', 'gemini')
        model = data.get('model', '')
        
        if not query:
            self.send_error(400, "Query required")
            return

        # 1. Retrieve Context
        context_text, sources = ENGINE.get_rag_context(query)
        
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
            
            self.send_json({"answer": ans, "sources": sources})
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

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), WikiHandler) as httpd:
        print(f"\n🧠 LLM Wiki UI (Python) running at http://localhost:{PORT}\n")
        httpd.serve_forever()
