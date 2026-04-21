import unittest
import os
import shutil
import tempfile
import json
import io
import sys
from pathlib import Path

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiEngine, WikiHandler, ENGINE

class TestArchive(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.archive_dir = self.test_dir / "archive"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        self.archive_dir.mkdir()
        
        self.engine = WikiEngine(self.wiki_dir, self.raw_dir)
        
        # Mock WikiHandler environment
        self.mock_request = unittest.mock.MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 9999)
        self.server = unittest.mock.MagicMock()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def create_wiki_page(self, path, content):
        p = self.wiki_dir / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding='utf-8')
        return p

    def get_handler(self, path, method="GET", body=None):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = method
        handler.wfile = io.BytesIO()
        handler.headers = {}
        handler.send_response = unittest.mock.MagicMock()
        handler.send_header = unittest.mock.MagicMock()
        handler.end_headers = unittest.mock.MagicMock()
        
        # Patch the global directories for the handler
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.RAW_DIR = self.raw_dir
        wiki_server.WIKI_ROOT = self.test_dir
        
        if body:
            handler.rfile = io.BytesIO(json.dumps(body).encode('utf-8'))
            handler.headers['Content-Length'] = len(json.dumps(body))
        return handler

    def test_stale_filtering_in_tree(self):
        self.create_wiki_page("active.md", "---\ntitle: Active\nstale: false\n---\nBody")
        self.create_wiki_page("old.md", "---\ntitle: Old\nstale: true\n---\nBody")
        
        tree = self.engine.walk_dir(self.wiki_dir, self.wiki_dir)
        self.assertEqual(len(tree), 1)
        self.assertEqual(tree[0]['name'], "active.md")

    def test_stale_filtering_in_search(self):
        self.create_wiki_page("active.md", "---\ntitle: Active\nstale: false\n---\nSearchable content")
        self.create_wiki_page("old.md", "---\ntitle: Old\nstale: true\n---\nSearchable content")
        
        results = []
        self.engine.search_files(self.wiki_dir, "content", results, self.wiki_dir)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], "Active")

    def test_api_archive_endpoint(self):
        # Create a file to archive
        page_path = "to_archive.md"
        self.create_wiki_page(page_path, "Content")
        
        handler = self.get_handler("/api/archive", method="POST", body={"path": page_path})
        
        # Execute archiving
        with unittest.mock.patch('wiki_server.WIKI_ROOT', self.test_dir):
            handler.do_POST()
            
        # Verify response
        response = json.loads(handler.wfile.getvalue().decode('utf-8'))
        self.assertEqual(response['status'], "archived")
        
        # Verify file moved
        self.assertFalse((self.wiki_dir / page_path).exists())
        self.assertTrue((self.test_dir / "archive/wiki" / page_path).exists())

if __name__ == '__main__':
    unittest.main()
