import unittest
from pathlib import Path

UI_DIR = Path(__file__).parent.parent / "ui" / "public"

class TestHelpModal(unittest.TestCase):
    def setUp(self):
        self.html = (UI_DIR / "index.html").read_text(encoding="utf-8")
        self.js = (UI_DIR / "app.js").read_text(encoding="utf-8")

    def test_btn_help_exists(self):
        self.assertIn('id="btnHelp"', self.html, "index.html must contain btnHelp")

    def test_help_modal_exists(self):
        self.assertIn('id="helpModal"', self.html, "index.html must contain helpModal dialog")

    def test_old_info_welcome_removed(self):
        self.assertNotIn('id="infoWelcome"', self.html, "index.html should not contain infoWelcome anymore")

    def test_app_js_references_help_elements(self):
        self.assertIn("btnHelp: document.getElementById('btnHelp')", self.js)
        self.assertIn("helpModal: document.getElementById('helpModal')", self.js)
        self.assertIn("closeHelp: document.getElementById('closeHelp')", self.js)

if __name__ == '__main__':
    unittest.main()
