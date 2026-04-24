import unittest
import os
import shutil
import tempfile
import sys
import io
from unittest.mock import MagicMock
from pathlib import Path

# Add ui directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ui'))
from wiki_server import WikiEngine, RAW_DIR, WIKI_DIR, WikiHandler

class TestOverrides(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        
        # Patch the global directories
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.RAW_DIR = self.raw_dir
        
        self.engine = WikiEngine(wiki_dir=self.wiki_dir, raw_dir=self.raw_dir)
        
        # Proper mocking of WikiHandler
        mock_request = MagicMock()
        mock_request.makefile.return_value = io.BytesIO(b"")
        self.handler = WikiHandler(mock_request, ('127.0.0.1', 0), MagicMock())

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_frontmatter_override(self):
        # Case 1: Raw file with proper frontmatter
        content = "---\ndomain: CustomDomain\nsubdomain: CustomSub\n---\nNote content."
        fm, _ = self.engine.parse_frontmatter(content)
        self.assertEqual(fm.get('domain'), 'CustomDomain')
        self.assertEqual(fm.get('subdomain'), 'CustomSub')

    def test_text_hint_override(self):
        # Case 2: Raw file with just text hints (e.g. # Domain: ...)
        # Currently this FAILS in the implementation because ingest_one_file only uses parse_frontmatter
        content = "# Domain: TextDomain\n# Subdomain: TextSub\nThis is a note."
        
        # I'll simulate part of ingest_one_file here or just check if I can extract it
        # Actually, I'll check the actual implementation logic
        
        from unittest.mock import MagicMock
        self.handler.call_gemini = MagicMock(return_value="---\ntitle: Test\ndomain: AIDomain\nsubdomain: AISub\n---\nSummary")
        
        # Write to inbox
        source = self.raw_dir / "inbox" / "hint.txt"
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_text(content)
        
        # Call ingestion
        result = self.handler.ingest_one_file(source)
        
        # Should be CustomDomain/CustomSub NOT AIDomain/AISub
        self.assertEqual(result['path'], "TextDomain/TextSub/test.md")

if __name__ == '__main__':
    unittest.main()
