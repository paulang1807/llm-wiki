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
        content = "---\ntitle: Test Page\ncategory: testing\ncount: 42\nbool: true\nlist: [a, b]\n---\nBody text here."
        fm, body = self.engine.parse_frontmatter(content)
        self.assertEqual(fm['title'], 'Test Page')
        self.assertEqual(fm['category'], 'testing')
        self.assertEqual(fm['count'], 42)
        self.assertTrue(fm['bool'])
        self.assertEqual(fm['list'], ['a', 'b'])
        self.assertEqual(body.strip(), 'Body text here.')

    def test_search_files(self):
        self.create_page("p1.md", "---\ntitle: Alpha\n---\nSearching for banana here.")
        self.create_page("p2.md", "---\ntitle: Beta\n---\nNo fruit here.")
        results = []
        self.engine.search_files(self.wiki_dir, "banana", results, self.wiki_dir)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'Alpha')

    def test_build_graph(self):
        self.create_page("a.md", "---\ntitle: Page A\n---\nLink to [[Page B]]")
        self.create_page("b.md", "---\ntitle: Page B\n---\nLink to [[Page A]]")
        graph = self.engine.build_graph(self.wiki_dir, self.wiki_dir)
        self.assertEqual(len(graph['nodes']), 2)
        self.assertEqual(len(graph['edges']), 2)

    def test_count_files(self):
        self.create_page("sub/p1.md", "content")
        self.create_page("p2.md", "content")
        self.assertEqual(self.engine.count_files(self.wiki_dir), 2)

if __name__ == '__main__':
    unittest.main()
