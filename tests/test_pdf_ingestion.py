import unittest
import os
import shutil
import tempfile
import json
import io
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, WIKI_DIR, RAW_DIR, WIKI_ROOT

class TestPDFIngestion(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.inbox_dir = self.raw_dir / "inbox"
        
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        self.inbox_dir.mkdir()
        
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
        import email.message
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

    @patch('pypdf.PdfReader')
    @patch('wiki_server.WikiHandler.call_gemini')
    def test_pdf_extraction_and_ingest(self, mock_gemini, mock_reader):
        # 1. Setup mock PDF object
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "This is text from a PDF."
        mock_pdf.pages = [mock_page]
        mock_reader.return_value = mock_pdf
        
        # 2. Setup inbox file
        source = self.inbox_dir / "test.pdf"
        source.write_bytes(b"%PDF-1.4 dummy content")
        
        # 3. Mock AI response
        mock_gemini.return_value = "---\ntitle: PDF Test\ncategory: concepts\n---\n# PDF Test\nExtracted content summary."
        
        # 4. Call endpoint
        handler = self.get_handler("/api/ingest-inbox")
        handler.do_POST()
        
        # 5. Verify results
        wiki_file = self.wiki_dir / "concepts" / "pdf-test.md"
        self.assertTrue(wiki_file.exists())
        self.assertIn("PDF Test", wiki_file.read_text())
        
        # Verify pypdf was called
        mock_reader.assert_called_once()
        
        # Verify source moved
        self.assertFalse(source.exists())
        self.assertTrue((self.raw_dir / "test.pdf").exists())

    @patch('pypdf.PdfReader')
    def test_extract_text_empty_pdf(self, mock_reader):
        # Setup empty PDF
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = ""
        mock_pdf.pages = [mock_page]
        mock_reader.return_value = mock_pdf
        
        handler = self.get_handler("/api/ingest-inbox")
        text = handler.extract_text_from_pdf(Path("dummy.pdf"))
        
        self.assertEqual(text, "")

if __name__ == '__main__':
    unittest.main()
