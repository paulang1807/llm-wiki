import unittest
import os
import shutil
import json
import tempfile
from pathlib import Path
import sys

# Add ui directory to path so we can import wiki_server
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ui'))
from wiki_server import WikiEngine, RAW_DIR, WIKI_DIR

class TestDomainHierarchy(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        
        self.engine = WikiEngine(wiki_dir=self.wiki_dir, raw_dir=self.raw_dir)
        
    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_nested_storage(self):
        # Create a mock note with domain/subdomain
        content = """---
title: Test Page
domain: Engineering
subdomain: Python
---
# Test Page
Content here."""
        
        domain = "Engineering"
        subdomain = "Python"
        filename = "test-page.md"
        
        dest_path = WIKI_DIR / domain / subdomain / filename
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        dest_path.write_text(content)
        
        self.assertTrue(dest_path.exists())
        self.assertEqual(dest_path.parent.name, "Python")
        self.assertEqual(dest_path.parent.parent.name, "Engineering")

    def test_parse_frontmatter_with_domains(self):
        content = """---
title: Advanced Python
domain: Software Engineering
subdomain: Python
tags: [decorators, generators]
---
# Content"""
        fm, body = self.engine.parse_frontmatter(content)
        self.assertEqual(fm['domain'], "Software Engineering")
        self.assertEqual(fm['subdomain'], "Python")

if __name__ == '__main__':
    unittest.main()
