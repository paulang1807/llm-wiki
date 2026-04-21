import unittest
import os
import shutil
import tempfile
from pathlib import Path
import sys

# Add ui dir to path so we can import ENGINE
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiEngine

class TestWikiEngine(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.raw_dir = self.test_dir / "raw"
        self.wiki_dir.mkdir()
        self.raw_dir.mkdir()
        self.engine = WikiEngine(self.wiki_dir, self.raw_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def create_page(self, path, content):
        p = self.wiki_dir / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding='utf-8')

    def test_parse_frontmatter(self):
        # Full frontmatter
        content = "---\ntitle: Test Page\ncategory: testing\ncount: 42\nbool: true\nlist: [a, b]\n---\nBody text here."
        fm, body = self.engine.parse_frontmatter(content)
        self.assertEqual(fm['title'], 'Test Page')
        self.assertEqual(fm['category'], 'testing')
        self.assertEqual(fm['count'], 42)
        self.assertTrue(fm['bool'])
        self.assertEqual(fm['list'], ['a', 'b'])
        self.assertEqual(body.strip(), 'Body text here.')

        # No frontmatter
        content_no_fm = "Just body text."
        fm_none, body_none = self.engine.parse_frontmatter(content_no_fm)
        self.assertEqual(fm_none, {})
        self.assertEqual(body_none, content_no_fm)

        # Empty body
        content_empty = "---\ntitle: Empty\n---\n"
        fm_e, body_e = self.engine.parse_frontmatter(content_empty)
        self.assertEqual(fm_e['title'], 'Empty')
        self.assertEqual(body_e.strip(), '')

    def test_search_files(self):
        self.create_page("p1.md", "---\ntitle: Alpha\n---\nSearching for banana here.")
        self.create_page("p2.md", "---\ntitle: Beta\n---\nNo fruit here.")
        results = []
        self.engine.search_files(self.wiki_dir, "banana", results, self.wiki_dir)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Alpha')

    def test_walk_dir(self):
        self.create_page("nested/sub.md", "content")
        self.create_page("root.md", "content")
        tree = self.engine.walk_dir(self.wiki_dir, self.wiki_dir)
        
        # Verify hierarchical structure
        self.assertEqual(len(tree), 2) # nested dir and root.md
        dir_entry = [t for t in tree if t['type'] == 'dir'][0]
        self.assertEqual(dir_entry['name'], 'nested')
        self.assertEqual(len(dir_entry['children']), 1)
        self.assertEqual(dir_entry['children'][0]['name'], 'sub.md')

    def test_build_page_index(self):
        self.create_page("python/basics.md", "---\ntitle: Python Basics\n---")
        self.create_page("ml/regression.md", "---\ntitle: Linear Regression\n---")
        index = self.engine.build_page_index(self.wiki_dir, {}, self.wiki_dir)
        
        self.assertEqual(index['Python Basics'], 'python/basics.md')
        self.assertEqual(index['python basics'], 'python/basics.md') # Case insensitive check
        self.assertEqual(index['regression'], 'ml/regression.md') # Stem check

    def test_build_graph(self):
        self.create_page("a.md", "---\ntitle: Page A\n---\nLink to [[Page B]]")
        self.create_page("b.md", "---\ntitle: Page B\n---\nLink to [[Page A]]")
        graph = self.engine.build_graph(self.wiki_dir, self.wiki_dir)
        self.assertEqual(len(graph['nodes']), 2)
        self.assertEqual(len(graph['edges']), 2)

    def test_get_rag_context(self):
        self.create_page("rag.md", "---\ntitle: RAG Topic\nconfidence: 1.0\n---\nThis is the secret context.")
        self.create_page("noise.md", "---\ntitle: Noise\nconfidence: 0.1\n---\nUnrelated data.")
        
        context, sources = self.engine.get_rag_context("secret")
        self.assertIn("secret context", context)
        self.assertIn("RAG Topic", sources)
        self.assertNotIn("Unrelated data", context)

    def test_count_files(self):
        self.create_page("sub/p1.md", "content")
        self.create_page("p2.md", "content")
        self.assertEqual(self.engine.count_files(self.wiki_dir), 2)

if __name__ == '__main__':
    unittest.main()
