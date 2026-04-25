import unittest
from pathlib import Path

UI_DIR = Path(__file__).parent.parent / "ui" / "public"

class TestIngestConsoleBehavior(unittest.TestCase):

    def setUp(self):
        self.html = (UI_DIR / "index.html").read_text(encoding="utf-8")
        self.js = (UI_DIR / "app.js").read_text(encoding="utf-8")
        self.css = (UI_DIR / "style.css").read_text(encoding="utf-8")

    def test_console_id_exists(self):
        self.assertIn('id="ingestConsoleSection"', self.html)

    def test_close_button_exists(self):
        self.assertIn('id="btnCancelConsole"', self.html)

    def test_js_functions_defined(self):
        self.assertIn("function showIngestConsole()", self.js)
        self.assertIn("function hideIngestConsole()", self.js)

    def test_js_elements_referenced(self):
        self.assertIn("ingestConsoleSection: document.getElementById('ingestConsoleSection')", self.js)
        self.assertIn("btnCancelConsole: document.getElementById('btnCancelConsole')", self.js)

    def test_js_triggers_show_console(self):
        # Check if showIngestConsole() is called in relevant places
        # 1. btnProcessInbox.onclick
        self.assertIn("showIngestConsole();", self.js)

    def test_css_console_absolute_and_hidden(self):
        self.assertIn(".ingest-console-section {", self.css)
        self.assertIn("position: absolute;", self.css)
        self.assertIn("display: none;", self.css)

    def test_css_console_visible_class(self):
        self.assertIn(".ingest-console-section.visible {", self.css)
        self.assertIn("display: flex;", self.css)

    def test_css_container_relative(self):
        # Verify ingest-container is relative to anchor the console
        self.assertIn(".ingest-container {", self.css)
        self.assertIn("position: relative;", self.css)

if __name__ == '__main__':
    unittest.main()
