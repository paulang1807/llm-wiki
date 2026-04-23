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
from wiki_server import WikiEngine, WIKI_ROOT

class TestGraphRelations(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        
        # Setup specific test categories
        (self.wiki_dir / "meta").mkdir()
        (self.wiki_dir / "python").mkdir()
        
        self.engine = WikiEngine(self.wiki_dir, self.raw_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_link_extraction(self):
        # Create target page
        target_path = self.wiki_dir / "python" / "target.md"
        target_path.write_text("---\ntitle: Target Page\n---")
        
        # Create source page with multiple link types
        source_content = (
            "---\n"
            "title: Source Page\n"
            "related: [[Target Page]]\n"
            "---\n"
            "This is a [[Target Page]] wikilink.\n"
            "This is a [Markdown link](python/target.md).\n"
        )
        source_path = self.wiki_dir / "meta" / "source.md"
        source_path.write_text(source_content)
        
        graph = self.engine.build_graph(self.wiki_dir, self.wiki_dir)
        
        # Verify nodes
        node_ids = [n['id'] for n in graph['nodes']]
        self.assertIn("python/target.md", node_ids)
        self.assertIn("meta/source.md", node_ids)
        
        # Verify edges (should be unique objects)
        edges = graph['edges']
        # Check for relation object
        found = any(e['source'] == "meta/source.md" and e['target'] == "python/target.md" for e in edges)
        self.assertTrue(found, "Edge meta/source.md -> python/target.md should exist")
        
        # Should only have 1 unique edge
        self.assertEqual(len(edges), 1, "Links should be deduplicated")

    def test_frontmatter_list_relation(self):
        # Target
        (self.wiki_dir / "python" / "a.md").write_text("---\ntitle: Page A\n---")
        (self.wiki_dir / "python" / "b.md").write_text("---\ntitle: Page B\n---")
        
        # Source with list of related
        content = (
            "---\n"
            "title: Master\n"
            "related: [Page A, Page B]\n"
            "---\n"
            "Main content"
        )
        (self.wiki_dir / "meta" / "master.md").write_text(content)
        
        graph = self.engine.build_graph(self.wiki_dir, self.wiki_dir)
        edges = graph['edges']
        
        self.assertTrue(any(e['source'] == "meta/master.md" and e['target'] == "python/a.md" for e in edges))
        self.assertTrue(any(e['source'] == "meta/master.md" and e['target'] == "python/b.md" for e in edges))

if __name__ == '__main__':
    unittest.main()
