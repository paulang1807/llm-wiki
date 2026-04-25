import unittest
import os
import shutil
import tempfile
import json
import io
from pathlib import Path
import sys
from unittest.mock import MagicMock

# Add ui dir
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, WikiEngine

class TestPaste(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.raw_dir = self.test_dir / "raw"
        self.raw_dir.mkdir()
        
        import wiki_server
        wiki_server.RAW_DIR = self.raw_dir
        
        mock_request = MagicMock()
        mock_request.makefile.return_value = io.BytesIO(b"")
        self.handler = WikiHandler(mock_request, ('127.0.0.1', 0), MagicMock())
        self.handler.requestline = "POST /api/paste HTTP/1.1"
        self.handler.request_version = "HTTP/1.1"
        self.handler.send_json = MagicMock()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_handle_paste_with_meta(self):
        content = "Pasted content here."
        title = "My Test Note"
        date = "2023-10-27"
        data = {"content": content, "title": title, "date": date, "ingestImmediate": False}
        
        self.handler.handle_paste(data)
        
        # Verify file created in raw/inbox
        inbox = self.raw_dir / "inbox"
        files = list(inbox.glob("my-test-note_*.md"))
        self.assertEqual(len(files), 1)
        
        saved_text = files[0].read_text()
        self.assertIn("title: My Test Note", saved_text)
        self.assertIn("last_updated: 2023-10-27", saved_text)
        self.assertIn("Pasted content here.", saved_text)

    def test_handle_paste_immediate(self):
        # Mock ingest_one_file
        self.handler.ingest_one_file = MagicMock(return_value={"title": "AI Title", "path": "D/S/f.md"})
        
        data = {"content": "Text", "ingestImmediate": True}
        self.handler.wfile = io.BytesIO()
        self.handler.handle_paste(data)
        
        # Verify response stream shows ingested
        output = self.handler.wfile.getvalue().decode('utf-8')
        body = output.split('\r\n\r\n')[-1]
        lines = [json.loads(l) for l in body.strip().split('\n') if l.strip()]
        final_result = next((l for l in lines if l.get('FINAL_RESULT')), None)
        self.assertIsNotNone(final_result)
        self.assertEqual(final_result['status'], "ingested")
        self.assertEqual(final_result['title'], "AI Title")

if __name__ == '__main__':
    unittest.main()
