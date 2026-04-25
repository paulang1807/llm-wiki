import unittest
import json
import io
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).parent.parent / "ui"))
from wiki_server import WikiHandler, RAW_DIR, WIKI_DIR

class TestIngestionBatch(unittest.TestCase):

    def setUp(self):
        self.mock_request = MagicMock()
        # Ensure we don't trigger automatic processing in __init__
        self.mock_request.makefile.return_value = io.BytesIO(b"")
        self.client_address = ('127.0.0.1', 8888)
        self.server = MagicMock()
        
        # Create temporary directories for test
        self.test_dir = tempfile.TemporaryDirectory()
        self.raw_dir = Path(self.test_dir.name) / "raw"
        self.wiki_dir = Path(self.test_dir.name) / "wiki"
        self.inbox_dir = self.raw_dir / "inbox"
        self.inbox_dir.mkdir(parents=True)
        self.wiki_dir.mkdir(parents=True)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_handles_more_than_five_files(self):
        # Create 7 files in the inbox
        for i in range(7):
            (self.inbox_dir / f"test_{i}.md").write_text(f"Content {i}")

        with patch("wiki_server.RAW_DIR", self.raw_dir), \
             patch("wiki_server.WIKI_DIR", self.wiki_dir):
            
            # Instantiate handler
            handler = WikiHandler(self.mock_request, self.client_address, self.server)
            handler.wfile = io.BytesIO()
            handler.send_response = MagicMock()
            handler.send_header = MagicMock()
            handler.end_headers = MagicMock()
            
            # Mock ingest_one_file on the instance
            handler.ingest_one_file = MagicMock()
            handler.ingest_one_file.side_effect = lambda f, log_fn=None: {"title": f.stem, "path": f.name}
            
            handler.handle_ingest_inbox()
            
            # Verify that ingest_one_file was called 7 times
            self.assertEqual(handler.ingest_one_file.call_count, 7)
            
            # Check the final result in the stream
            output = handler.wfile.getvalue().decode('utf-8')
            lines = [json.loads(line) for line in output.split('\n') if line.strip()]
            
            final_msg = next((l for l in lines if l.get("FINAL_RESULT")), None)
            self.assertIsNotNone(final_msg, "Should have a FINAL_RESULT message")
            self.assertEqual(final_msg["processed"], 7)
            self.assertEqual(final_msg["total_in_inbox"], 7)

if __name__ == '__main__':
    unittest.main()
