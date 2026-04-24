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
                    entry_path = str(entry.relative_to(base_dir)).replace('\\', '/')
                    title = fm.get('title', entry.stem)
                    full_text = (body + ' ' + title).lower()
                    query_terms = [t.lower() for t in query.split() if len(t) > 2]
                    if not query_terms: # fallback for very short queries
                        query_terms = [query.lower()]
                    
                    matches = 0
                    for term in query_terms:
                        if term in full_text:
                            matches += 1
                    
                    if matches > 0:
                        # Extract snippet from body
                        body_lower = body.lower()
                        idx = body_lower.find(query_terms[0]) if query_terms[0] in body_lower else 0
                        start = max(0, idx - 80)
                        end = min(len(body), idx + 120)
                        snippet = body[start:end].replace('\n', ' ')
                        results.append({
                            "path": entry_path,
                            "title": title,
                            "category": fm.get('category', ''),
                            "snippet": snippet.strip(),
                            "confidence": fm.get('confidence', 0.5) * (matches / len(query_terms))
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
                    # Extract targets from multiple sources
                    targets = []
                    # 1. Wikilinks [[Page]] or [[Page|Text]]
                    targets.extend(re.findall(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]', content))
                    
                    # 2. Standard Markdown links [Text](path.md)
                    targets.extend(re.findall(r'\[[^\]]+\]\(([^)]+\.md)\)', content))
                    
                    # 3. Frontmatter 'related' field
                    fm_related = fm.get('related', [])
                    if isinstance(fm_related, str): fm_related = [fm_related]
                    targets.extend([t.strip('[]') for t in fm_related if isinstance(t, str)])
                    
                    for target_val in set(targets):
                        target_path = index.get(target_val) or index.get(target_val.lower())
                        # Fallback: check if it's already a partial path
                        if not target_path and target_val.endswith('.md'):
                            for path in index.values():
                                if path.endswith(target_val):
                                    target_path = path
                        if target_path and target_path != node_id:
                            edges.append({"source": node_id, "target": target_path})
                except Exception: pass
        walk(directory)
        # Deduplicate and format as objects for the frontend
        unique_edges = []
        seen = set()
        for e in edges:
            pair = (e['source'], e['target'])
            if pair not in seen:
                unique_edges.append(e)
                seen.add(pair)
        return {"nodes": nodes, "edges": unique_edges}

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
        elif url.path == '/api/inbox-files':
            inbox = RAW_DIR / "inbox"
            inbox.mkdir(parents=True, exist_ok=True)
            files = [
                {"name": f.name, "size": f.stat().st_size}
                for f in sorted(inbox.iterdir())
                if f.is_file() and not f.name.startswith('.')
            ]
            self.send_json(files)
        else:
            self.send_error(404, "API endpoint not found")

    def send_json(self, data):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
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
            
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.end_headers()

        def stream_log(msg, type="info", final=None):
            data = {"message": msg, "type": type}
            if final:
                data.update(final)
                data["FINAL_RESULT"] = True
            self.wfile.write((json.dumps(data) + "\n").encode('utf-8'))
            self.wfile.flush()

        # Limit to 5 files per sync to avoid timeouts
        files_to_process = files[:5]
        stream_log(f"Starting ingestion process for {len(files_to_process)} note(s)...", "info")
        
        processed_count = 0
        for f in files_to_process:
            if not f.exists():
                stream_log(f"File {f.name} missing, skipping.", "error")
                continue
            try:
                stream_log(f"--- Ingesting: {f.name} ---", "info")
                result = self.ingest_one_file(f, log_fn=stream_log)
                if result:
                    processed_count += 1
                    stream_log(f"Successfully processed {f.name} as '{result['title']}'", "success")
                else:
                    stream_log(f"Failed to ingest {f.name}. AI call may have failed.", "error")
            except Exception as e:
                stream_log(f"Unexpected error with {f.name}: {str(e)}", "error")
                
        import time
        time.sleep(0.2) # Give OS a moment to settle file moves
        stream_log(f"\nDONE: Processed {processed_count} files. {len(files) - processed_count} remain in inbox.", "success", 
                   final={"processed": processed_count, "total_in_inbox": len(files)})

    def ingest_one_file(self, file_path, log_fn=None):
        def log(msg, type="step"):
            if log_fn: log_fn(msg, type)
            else: print(f"DEBUG: {msg}")

        if file_path.suffix.lower() == '.pdf':
            log(f"Extracting text from PDF...")
            content = self.extract_text_from_pdf(file_path)
            if not content.strip():
                content = f"Note: PDF extraction returned no text for {file_path.name}. Detailed analysis may be required."
        else:
            log(f"Reading text file content...")
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        # Truncate content if extremely large to prevent AI timeout
        if len(content) > 50000:
            log(f"Content very large ({len(content)} chars), truncating to 50k...")
            content = content[:50000] + "... [TRUNCATED]"

        # ... (rest of system prompt is the same)
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
        log(f"Synthesizing wiki page using {provider}...")
        
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
        
        # Write to Wiki only if not an error message
        if ans.strip().startswith("Error") or ans.strip().startswith("Gemini API Error") or ans.strip().startswith("Ollama Error"):
            log(f"AI ERROR: {ans[:100]}...", "error")
            return None

        # Write to Wiki
        log(f"Saving to {category}/{filename}...")
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_text(ans, encoding='utf-8')
        
        # Move raw source to raw/ instead of deleting
        raw_dest = RAW_DIR / file_path.name
        if raw_dest.exists(): # Handle collision
            raw_dest = RAW_DIR / f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file_path.name}"
        log(f"Moving source to raw storage...")
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
            with urllib.request.urlopen(req, timeout=90) as res:
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
            with urllib.request.urlopen(req, timeout=90) as res:
                resp_data = json.loads(res.read().decode('utf-8'))
                return resp_data['choices'][0]['message']['content']
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            return f"Ollama Error ({e.code}): {error_body}"
        except Exception as e:
            return f"Error connecting to Ollama: {str(e)}. Make sure it is running at {CONFIG['ollama_url']}."

class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    with ThreadedTCPServer(("", PORT), WikiHandler) as httpd:
        print(f"\n🧠 LLM Wiki UI (Python) running at http://localhost:{PORT}")
        print(f"DEBUG: Threaded server enabled for concurrent processing.\n")
        httpd.serve_forever()
