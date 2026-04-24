import unittest
import os
import shutil
import tempfile
import json
import io
import sys
import email.message
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, WIKI_DIR, RAW_DIR, WIKI_ROOT

class TestIngestion(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.inbox_dir = self.raw_dir / "inbox"
        self.archive_dir = self.test_dir / "archive"
        
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        self.inbox_dir.mkdir()
        self.archive_dir.mkdir()
        
        # Patch the global directories in wiki_server
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.RAW_DIR = self.raw_dir
        wiki_server.WIKI_ROOT = self.test_dir
        
        self.mock_request = MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 9999)
        self.server = MagicMock()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def get_handler(self, path, method="POST", body=None):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = method
        handler.wfile = io.BytesIO()
        handler.headers = email.message.Message()
        handler.send_response = MagicMock()
        handler.send_header = MagicMock()
        handler.end_headers = MagicMock()
        handler.send_error = MagicMock()
        
        if body:
            handler.rfile = io.BytesIO(json.dumps(body).encode('utf-8'))
            handler.headers.add_header('Content-Length', str(len(json.dumps(body))))
        return handler

    def test_api_upload(self):
        # Multipart form data manual construction
        boundary = "---TestBoundary"
        body = (
            f"--{boundary}\r\n"
            f"Content-Disposition: form-data; name=\"file\"; filename=\"test.txt\"\r\n"
            f"Content-Type: text/plain\r\n\r\n"
            f"Hello Ingestion\r\n"
            f"--{boundary}--\r\n"
        ).encode('utf-8')
        
        handler = self.get_handler("/api/upload")
        handler.rfile = io.BytesIO(body)
        handler.headers.add_header('Content-Type', f"multipart/form-data; boundary={boundary}")
        handler.headers.add_header('Content-Length', str(len(body)))
        
        handler.do_POST()
        
        target = self.inbox_dir / "test.txt"
        self.assertTrue(target.exists(), "Uploaded file should exist in inbox")
        self.assertEqual(target.read_text(), "Hello Ingestion")

    @patch('wiki_server.WikiHandler.call_gemini')
    def test_api_ingest_inbox(self, mock_gemini):
        # 1. Setup inbox file
        source = self.inbox_dir / "raw_note.txt"
        source.write_text("Some random data about Python decorators.")
        
        # 2. Mock AI response
        mock_gemini.return_value = "---\ntitle: Python Decorators\ncategory: python\ntags: [python, decorators]\n---\n# Python Decorators\nDecorators are cool."
        
        # 3. Call endpoint
        handler = self.get_handler("/api/ingest-inbox")
        handler.do_POST()
        
        # 4. Verify results
        # File should be in wiki/python/python-decorators.md
        wiki_file = self.wiki_dir / "python" / "python-decorators.md"
        self.assertTrue(wiki_file.exists(), f"Wiki file {wiki_file} should exist")
        self.assertIn("Python Decorators", wiki_file.read_text())
        
        # Source should be moved to raw/
        self.assertFalse(source.exists(), "Source file should be moved")
        self.assertTrue((self.raw_dir / "raw_note.txt").exists(), "Source file should exist in raw root")
        
        # Response check
        output = handler.wfile.getvalue().decode('utf-8')
        lines = [json.loads(l) for l in output.strip().split('\n') if l.strip()]
        final = next((l for l in lines if l.get('FINAL_RESULT')), {})
        self.assertEqual(final.get('processed'), 1)

if __name__ == '__main__':
    unittest.main()
