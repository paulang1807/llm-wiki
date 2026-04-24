import unittest
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiEngine

class TestSearchLogic(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.wiki_dir.mkdir()
        self.engine = WikiEngine(str(self.wiki_dir), str(self.test_dir / "raw"))
        
        # Create a test file
        self.test_file = self.wiki_dir / "test.md"
        self.test_file.write_text("""---
title: Qlik autoCalendar Function
category: concepts
confidence: 1.0
---
The autoCalendar function in Qlik automatically generates date fields.
It simplifies time intelligence and hierarchy creation.
""", encoding='utf-8')

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_keyword_search(self):
        # 1. Literal match (should work)
        results = []
        self.engine.search_files(self.wiki_dir, "autoCalendar", results, self.wiki_dir)
        self.assertGreater(len(results), 0, "Should find literal match")
        
        # 2. Multi-word keyword match (should work now, previously failed)
        results = []
        self.engine.search_files(self.wiki_dir, "how can I create an autocalendar in qlik", results, self.wiki_dir)
        self.assertGreater(len(results), 0, "Should find match using keywords from the question")
        
        # Verify confidence is weighted
        self.assertIn("qlik", results[0]['title'].lower() or results[0]['snippet'].lower())

    def test_no_match(self):
        results = []
        self.engine.search_files(self.wiki_dir, "something completely unrelated", results, self.wiki_dir)
        self.assertEqual(len(results), 0, "Should not find unrelated query")

if __name__ == '__main__':
    unittest.main()
