import unittest
from unittest.mock import MagicMock, patch, mock_open
import json
import io
import sys
import os
from pathlib import Path

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, ENGINE, CONFIG

class TestWikiAPI(unittest.TestCase):
    def setUp(self):
        self.mock_request = MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 8888)
        self.server = MagicMock()
        # Mock public dir for static file tests
        self.temp_public = Path(os.path.dirname(__file__)) / "public_mock"
        self.temp_public.mkdir(exist_ok=True)
        (self.temp_public / "index.html").write_text("INDEX")
        WikiHandler.directory = str(self.temp_public)

    def tearDown(self):
        if self.temp_public.exists():
            shutil = __import__('shutil')
            shutil.rmtree(self.temp_public)

    def get_handler(self, path, method="GET", body=None):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = method
        handler.wfile = io.BytesIO()
        handler.headers = {} # Fix: Ensure headers exists for super().do_GET()
        handler.send_response = MagicMock()
        handler.send_header = MagicMock()
        handler.end_headers = MagicMock()
        if body:
            handler.rfile = io.BytesIO(json.dumps(body).encode('utf-8'))
            handler.headers['Content-Length'] = len(json.dumps(body))
        return handler

    def test_api_status(self):
        with patch.object(WikiHandler, 'handle'):
            handler = self.get_handler("/api/status")
            handler.do_GET()
            response = json.loads(handler.wfile.getvalue().decode('utf-8'))
            self.assertIn('geminiReady', response)

    def test_api_tree(self):
        with patch.object(WikiHandler, 'handle'):
            with patch.object(ENGINE, 'walk_dir', return_value=[{"name": "test.md"}]):
                handler = self.get_handler("/api/tree")
                handler.do_GET()
                response = json.loads(handler.wfile.getvalue().decode('utf-8'))
                self.assertEqual(response[0]['name'], "test.md")

    def test_api_page_not_found(self):
        with patch.object(WikiHandler, 'handle'):
            handler = self.get_handler("/api/page?path=missing.md")
            handler.send_error = MagicMock()
            handler.do_GET()
            handler.send_error.assert_called_with(404, "Page not found")

    def test_api_ask_gemini(self):
        with patch.object(WikiHandler, 'handle'):
            with patch.object(ENGINE, 'get_rag_context', return_value=("Context", ["Source"])):
                with patch.object(WikiHandler, 'call_gemini', return_value="AI Answer"):
                    handler = self.get_handler("/api/ask", method="POST", body={"query": "test"})
                    handler.do_POST()
                    response = json.loads(handler.wfile.getvalue().decode('utf-8'))
                    self.assertEqual(response['answer'], "AI Answer")
                    self.assertEqual(response['sources'], ["Source"])

    def test_spa_routing(self):
        # Request a path that doesn't exist; should serve index.html
        with patch.object(WikiHandler, 'handle'):
            # SimpleHTTPRequestHandler.do_GET will use self.path
            handler = self.get_handler("/some/random/route")
            # We mock super().do_GET() behavior by checking what it would do
            handler.do_GET()
            # If path was mapped to /index.html, it works
            self.assertEqual(handler.path, "/index.html")

if __name__ == '__main__':
    unittest.main()
