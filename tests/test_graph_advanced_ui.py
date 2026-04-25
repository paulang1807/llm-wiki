import unittest
from pathlib import Path
import json

from ui.wiki_server import WikiHandler, ENGINE
from typing import Dict, Any

class TestGraphAdvancedUI(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(__file__).parent / "test_advanced_graph_data"
        self.test_dir.mkdir(exist_ok=True)
        
        # Create a mock markdown file with frontmatter
        self.mock_file = self.test_dir / "test_node.md"
        self.mock_file.write_text(
            "---\n"
            "title: Feature Selection Workflow\n"
            "tags: [feature_selection, xgboost, shap]\n"
            "---\n"
            "# Feature Selection Workflow\n\n"
            "This is a snippet for the feature selection workflow. "
            "It has a bunch of details about how to do multivariate forecasting using XGBoost and SHAP.",
            encoding="utf-8"
        )

    def tearDown(self):
        if self.mock_file.exists():
            self.mock_file.unlink()
        if self.test_dir.exists():
            self.test_dir.rmdir()

    def test_build_graph_returns_tags_and_snippet(self):
        graph_data = ENGINE.build_graph(self.test_dir, self.test_dir)
        
        nodes = graph_data.get('nodes', [])
        self.assertEqual(len(nodes), 1)
        
        node = nodes[0]
        self.assertEqual(node['title'], 'Feature Selection Workflow')
        
        self.assertIn('tags', node)
        self.assertEqual(len(node['tags']), 3)
        self.assertIn('feature_selection', node['tags'])
        
        self.assertIn('snippet', node)
        self.assertTrue(node['snippet'].startswith('# Feature Selection Workflow'))
        self.assertTrue('This is a snippet' in node['snippet'])

if __name__ == '__main__':
    unittest.main()
