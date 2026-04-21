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
from wiki_server import WikiEngine, WikiHandler, WIKI_DIR, RAW_DIR, WIKI_ROOT

class TestManagement(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.archive_dir = self.test_dir / "archive"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        self.archive_dir.mkdir()
        
        # Patch the global directories in wiki_server
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.RAW_DIR = self.raw_dir
        wiki_server.WIKI_ROOT = self.test_dir
        
        self.mock_request = unittest.mock.MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 9999)
        self.server = unittest.mock.MagicMock()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def get_handler(self, path, method="POST", body=None):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = method
        handler.wfile = io.BytesIO()
        handler.headers = {}
        handler.send_response = unittest.mock.MagicMock()
        handler.send_header = unittest.mock.MagicMock()
        handler.end_headers = unittest.mock.MagicMock()
        handler.send_error = unittest.mock.MagicMock()
        
        if body:
            handler.rfile = io.BytesIO(json.dumps(body).encode('utf-8'))
            handler.headers['Content-Length'] = len(json.dumps(body))
        return handler

    def test_api_save_new_page(self):
        body = {
            "path": "python/new-test.md",
            "content": "---\ntitle: New Test\n---\nHello World"
        }
        handler = self.get_handler("/api/save", body=body)
        handler.do_POST()
        
        # Verify file exists
        target = self.wiki_dir / "python/new-test.md"
        self.assertTrue(target.exists())
        self.assertIn("Hello World", target.read_text())
        
        # Verify response
        response = json.loads(handler.wfile.getvalue().decode('utf-8'))
        self.assertEqual(response['status'], "saved")
        self.assertEqual(response['title'], "New Test")

    def test_api_save_update_page(self):
        # Create existing
        existing = self.wiki_dir / "update.md"
        existing.write_text("Old content")
        
        body = {
            "path": "update.md",
            "content": "New content"
        }
        handler = self.get_handler("/api/save", body=body)
        handler.do_POST()
        
        self.assertEqual(existing.read_text(), "New content")

    def test_api_save_security_traversal(self):
        body = {
            "path": "../outside.md",
            "content": "hacked"
        }
        handler = self.get_handler("/api/save", body=body)
        handler.do_POST()
        
        # Error 403 Forbidden
        handler.send_error.assert_called_with(403, "Invalid path")
        self.assertFalse((self.test_dir / "outside.md").exists())

    def test_api_archive_wiki_page(self):
        page = self.wiki_dir / "to_del.md"
        page.write_text("Goodbye")
        
        handler = self.get_handler("/api/archive", body={"path": "to_del.md"})
        handler.do_POST()
        
        self.assertFalse(page.exists())
        self.assertTrue((self.test_dir / "archive/wiki/to_del.md").exists())

if __name__ == '__main__':
    unittest.main()
