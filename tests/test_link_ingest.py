import unittest
from unittest.mock import patch, MagicMock
import json
import os
import shutil
from pathlib import Path
import sys

# Add ui directory to path so we can import WikiHandler if needed
# But since it's a script with a main block, we'll mock the handler's behavior 
# or use it directly if possible.

from ui.wiki_server import WikiHandler, RAW_DIR, WIKI_DIR

class TestLinkIngest(unittest.TestCase):
    def setUp(self):
        # Create a clean test environment
        self.test_root = Path("test_workspace")
        self.test_root.mkdir(exist_ok=True)
        self.inbox = self.test_root / "raw" / "inbox"
        self.inbox.mkdir(parents=True, exist_ok=True)
        
        # Patch RAW_DIR in wiki_server
        self.patcher_raw = patch('ui.wiki_server.RAW_DIR', self.test_root / "raw")
        self.patcher_wiki = patch('ui.wiki_server.WIKI_DIR', self.test_root / "wiki")
        self.patcher_raw.start()
        self.patcher_wiki.start()

    def tearDown(self):
        self.patcher_raw.stop()
        self.patcher_wiki.stop()
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    @patch('urllib.request.urlopen')
    @patch('ui.wiki_server.WikiHandler.__init__', return_value=None)
    def test_handle_link_fetches_and_saves(self, mock_init, mock_urlopen):
        # Mock HTML response
        mock_res = MagicMock()
        mock_res.read.return_value = b"<html><head><title>Test Page</title></head><body><h1>Hello World</h1><script>alert(1)</script></body></html>"
        mock_res.__enter__.return_value = mock_res
        mock_urlopen.return_value = mock_res

        # Instantiate handler
        handler = WikiHandler()
        
        # Mock send_json
        handler.send_json = MagicMock()

        # Execute handle_link
        handler.handle_link({"url": "https://example.com/test", "ingestImmediate": False})

        # Verify send_json was called with success
        handler.send_json.assert_called_once()
        result = handler.send_json.call_args[0][0]
        self.assertEqual(result["status"], "saved")
        
        # Verify file exists in inbox
        files = list(self.inbox.glob("link_test-page_*.md"))
        self.assertEqual(len(files), 1)
        
        content = files[0].read_text()
        self.assertIn("title: Test Page", content)
        self.assertIn("source_url: https://example.com/test", content)
        self.assertIn("Hello World", content)
        self.assertNotIn("alert(1)", content) # Should be cleaned

    @patch('urllib.request.urlopen')
    @patch('ui.wiki_server.WikiHandler.__init__', return_value=None)
    def test_handle_link_with_custom_date(self, mock_init, mock_urlopen):
        mock_res = MagicMock()
        mock_res.read.return_value = b"<html><title>Date Test</title><body>Content</body></html>"
        mock_res.__enter__.return_value = mock_res
        mock_urlopen.return_value = mock_res

        handler = WikiHandler()
        handler.send_json = MagicMock()

        custom_date = "2024-01-01"
        handler.handle_link({"url": "https://example.com/date", "date": custom_date})

        files = list(self.inbox.glob("link_date-test_*.md"))
        self.assertEqual(len(files), 1)
        content = files[0].read_text()
        self.assertIn(f"date: {custom_date}", content)

    @patch('urllib.request.urlopen')
    @patch('ui.wiki_server.WikiHandler.__init__', return_value=None)
    def test_handle_link_error(self, mock_init, mock_urlopen):
        mock_urlopen.side_effect = Exception("Fetch failed")
        
        handler = WikiHandler()
        handler.send_error = MagicMock()

        handler.handle_link({"url": "https://badurl.com"})
        
        handler.send_error.assert_called_once()
        self.assertEqual(handler.send_error.call_args[0][0], 500)

if __name__ == '__main__':
    unittest.main()
