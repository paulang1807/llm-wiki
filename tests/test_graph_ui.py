import unittest
from pathlib import Path

UI_DIR = Path(__file__).parent.parent / "ui" / "public"

class TestGraphUI(unittest.TestCase):
    def setUp(self):
        self.js = (UI_DIR / "app.js").read_text(encoding="utf-8")

    def test_graph_ui_no_labels_drawn(self):
        self.assertNotIn("ctx.fillText(n.title", self.js,
                      "Graph should not draw permanent text labels on canvas.")

    def test_graph_has_tooltip_logic(self):
        self.assertIn("graphTooltip", self.js,
                      "Graph should populate tooltip on hover.")

    def test_graph_has_legend_logic(self):
        self.assertIn("legendContainer.innerHTML += `", self.js,
                      "Graph should populate legend with tags.")

if __name__ == '__main__':
    unittest.main()
