import unittest
import os
import shutil
import tempfile
import io
from pathlib import Path
import sys
from unittest.mock import MagicMock

# Add ui dir
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, WikiEngine

class TestDateOverride(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.RAW_DIR = self.raw_dir
        wiki_server.ENGINE = WikiEngine(wiki_dir=self.wiki_dir, raw_dir=self.raw_dir)
        
        mock_request = MagicMock()
        mock_request.makefile.return_value = io.BytesIO(b"")
        self.handler = WikiHandler(mock_request, ('127.0.0.1', 0), MagicMock())

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_date_hint_override(self):
        # Case: Raw file with # Date: hint
        content = "# Date: 2020-01-01\n# Domain: History\n# Subdomain: General\nOld note content."
        
        # Mock LLM response (should NOT have a date)
        self.handler.call_gemini = MagicMock(return_value="---\ntitle: Old Note\ndomain: History\nsubdomain: General\n---\nSummary")
        
        # Write to inbox
        source = self.raw_dir / "inbox" / "old.txt"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text(content)
        
        # Call ingestion
        result = self.handler.ingest_one_file(source)
        
        # Check saved file content
        saved_file = self.wiki_dir / result['path']
        saved_content = saved_file.read_text()
        
        self.assertIn("last_updated: 2020-01-01", saved_content)

if __name__ == '__main__':
    unittest.main()
