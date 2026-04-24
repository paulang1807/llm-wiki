"""
Tests for the dedicated Ingest view.

Covers:
  1. HTML structure — ingest button, ingest view, drop zone, inbox list,
     file input, process button are all present with correct IDs.
  2. JavaScript — setView handles 'ingest', loadIngestView is defined,
     handleIngestFiles is defined, FILE_ICONS are defined.
  3. Backend — /api/inbox-files endpoint exists and returns a list.
  4. CSS — key ingest view classes are present in the stylesheet.
"""
import unittest
import json
import io
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

UI_DIR = Path(__file__).parent.parent / "ui" / "public"

sys.path.insert(0, str(Path(__file__).parent.parent / "ui"))
from wiki_server import WikiHandler, ENGINE, RAW_DIR


# ──────────────────────────────────────────────────────────────────────────────
# HTML Tests
# ──────────────────────────────────────────────────────────────────────────────

class TestIngestViewHTML(unittest.TestCase):

    def setUp(self):
        self.html = (UI_DIR / "index.html").read_text(encoding="utf-8")

    def test_ingest_button_exists(self):
        self.assertIn('id="btnIngest"', self.html,
                      "Header must have an Ingest view button (id=btnIngest)")

    def test_ingest_view_container_exists(self):
        self.assertIn('id="ingestView"', self.html,
                      "A dedicated ingest view container (id=ingestView) must exist")

    def test_ingest_drop_zone_exists(self):
        self.assertIn('id="ingestDropZone"', self.html,
                      "An ingest drop zone (id=ingestDropZone) must exist")

    def test_file_input_exists(self):
        self.assertIn('id="ingestFileInput"', self.html,
                      "A file input (id=ingestFileInput) must exist in the ingest view")

    def test_file_input_accepts_formats(self):
        self.assertIn('accept=".md,.pdf,.txt,.rtf"', self.html,
                      "File input must accept md, pdf, txt, and rtf files")

    def test_file_input_is_multiple(self):
        self.assertIn('multiple', self.html,
                      "File input must allow multiple file selection")

    def test_inbox_file_list_exists(self):
        self.assertIn('id="ingestFileList"', self.html,
                      "Inbox queue file list (id=ingestFileList) must exist")

    def test_process_inbox_button_exists(self):
        self.assertIn('id="btnProcessInbox"', self.html,
                      "Process Inbox button (id=btnProcessInbox) must exist")

    def test_ingest_result_area_exists(self):
        self.assertIn('id="ingestResult"', self.html,
                      "Result display area (id=ingestResult) must exist")

    def test_drag_drop_instructions_present(self):
        self.assertIn("Drag", self.html,
                      "Drop zone must contain drag-and-drop instructions")


# ──────────────────────────────────────────────────────────────────────────────
# JavaScript Tests
# ──────────────────────────────────────────────────────────────────────────────

class TestIngestViewJS(unittest.TestCase):

    def setUp(self):
        self.js = (UI_DIR / "app.js").read_text(encoding="utf-8")

    def test_setView_handles_ingest(self):
        self.assertIn("view === 'ingest'", self.js,
                      "setView() must handle the 'ingest' case")

    def test_loadIngestView_defined(self):
        self.assertIn("async function loadIngestView()", self.js,
                      "loadIngestView() async function must be defined")

    def test_handleIngestFiles_defined(self):
        self.assertIn("async function handleIngestFiles(files)", self.js,
                      "handleIngestFiles() must be defined to process dropped/selected files")

    def test_btnIngest_referenced_in_elements(self):
        self.assertIn("btnIngest: document.getElementById('btnIngest')", self.js,
                      "elements.btnIngest must reference the DOM button")

    def test_ingestView_referenced_in_elements(self):
        self.assertIn("ingestView: document.getElementById('ingestView')", self.js,
                      "elements.ingestView must be defined")

    def test_ingestDropZone_referenced_in_elements(self):
        self.assertIn("ingestDropZone: document.getElementById('ingestDropZone')", self.js,
                      "elements.ingestDropZone must be defined")

    def test_file_icons_defined(self):
        self.assertIn("FILE_ICONS", self.js,
                      "FILE_ICONS map must be defined for file type display")

    def test_format_size_defined(self):
        self.assertIn("function formatSize", self.js,
                      "formatSize() helper must be defined")

    def test_ingest_button_wired(self):
        self.assertIn("btnIngest.addEventListener('click'", self.js,
                      "Ingest button click must be wired to setView('ingest')")

    def test_loadIngestView_called_from_setView(self):
        self.assertIn("loadIngestView()", self.js,
                      "setView must call loadIngestView() when switching to ingest view")

    def test_goHome_hides_ingest_view(self):
        self.assertIn("elements.ingestView.style.display = 'none'", self.js,
                      "goHome() must also hide the ingest view")

    def test_ingest_btn_removed_active_in_goHome(self):
        self.assertIn("elements.btnIngest.classList.remove('active')", self.js,
                      "goHome() must deactivate the ingest button")


# ──────────────────────────────────────────────────────────────────────────────
# Backend API Tests
# ──────────────────────────────────────────────────────────────────────────────

class TestInboxFilesAPI(unittest.TestCase):

    def setUp(self):
        self.mock_request = MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 8888)
        self.server = MagicMock()
        self.temp_public = Path(os.path.dirname(__file__)) / "public_mock"
        self.temp_public.mkdir(exist_ok=True)
        (self.temp_public / "index.html").write_text("INDEX")
        WikiHandler.directory = str(self.temp_public)

    def tearDown(self):
        if self.temp_public.exists():
            import shutil
            shutil.rmtree(self.temp_public)

    def get_handler(self, path):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = "GET"
        handler.wfile = io.BytesIO()
        handler.headers = {}
        handler.send_response = MagicMock()
        handler.send_header = MagicMock()
        handler.end_headers = MagicMock()
        return handler

    def test_inbox_files_endpoint_returns_list(self):
        """GET /api/inbox-files must return a JSON array."""
        with patch.object(WikiHandler, 'handle'):
            with tempfile.TemporaryDirectory() as tmpdir:
                inbox = Path(tmpdir) / "inbox"
                inbox.mkdir()
                (inbox / "test.md").write_text("hello")
                (inbox / ".hidden").write_text("ignore")

                with patch("wiki_server.RAW_DIR", Path(tmpdir)):
                    handler = self.get_handler("/api/inbox-files")
                    handler.do_GET()
                    result = json.loads(handler.wfile.getvalue().decode("utf-8"))

                    self.assertIsInstance(result, list)
                    names = [f["name"] for f in result]
                    self.assertIn("test.md", names,
                                  "Inbox files endpoint should list test.md")
                    self.assertNotIn(".hidden", names,
                                    "Dot-files should be excluded from listing")

    def test_inbox_file_has_name_and_size(self):
        """Each file entry must have 'name' and 'size' fields."""
        with patch.object(WikiHandler, 'handle'):
            with tempfile.TemporaryDirectory() as tmpdir:
                inbox = Path(tmpdir) / "inbox"
                inbox.mkdir()
                (inbox / "note.pdf").write_bytes(b"PDF" * 100)

                with patch("wiki_server.RAW_DIR", Path(tmpdir)):
                    handler = self.get_handler("/api/inbox-files")
                    handler.do_GET()
                    result = json.loads(handler.wfile.getvalue().decode("utf-8"))

                    self.assertEqual(len(result), 1)
                    self.assertIn("name", result[0])
                    self.assertIn("size", result[0])
                    self.assertEqual(result[0]["name"], "note.pdf")
                    self.assertGreater(result[0]["size"], 0)

    def test_inbox_files_empty_when_no_files(self):
        """Endpoint must return empty list when inbox is empty."""
        with patch.object(WikiHandler, 'handle'):
            with tempfile.TemporaryDirectory() as tmpdir:
                inbox = Path(tmpdir) / "inbox"
                inbox.mkdir()

                with patch("wiki_server.RAW_DIR", Path(tmpdir)):
                    handler = self.get_handler("/api/inbox-files")
                    handler.do_GET()
                    result = json.loads(handler.wfile.getvalue().decode("utf-8"))
                    self.assertEqual(result, [])


# ──────────────────────────────────────────────────────────────────────────────
# CSS Tests
# ──────────────────────────────────────────────────────────────────────────────

class TestIngestViewCSS(unittest.TestCase):

    def setUp(self):
        self.css = (UI_DIR / "style.css").read_text(encoding="utf-8")

    def test_ingest_view_class_exists(self):
        self.assertIn(".ingest-view", self.css)

    def test_ingest_drop_zone_class_exists(self):
        self.assertIn(".modern-drop-zone", self.css)

    def test_drag_over_state_styled(self):
        self.assertIn(".drag-over", self.css,
                      "drag-over CSS class must be defined for visual drop feedback")

    def test_ingest_process_btn_styled(self):
        self.assertIn(".modern-process-btn", self.css)

    def test_file_btn_is_visible(self):
        # The button is now unified under .modern-btn and .modern-btn-primary
        self.assertIn(".modern-btn", self.css)
        self.assertIn(".modern-btn-primary", self.css)

    def test_ingest_file_item_styled(self):
        self.assertIn(".ingest-file-item", self.css)

    def test_ingest_layout_is_flex_column(self):
        self.assertIn("flex-direction: column !important", self.css)

    def test_ingest_footer_styled(self):
        self.assertIn(".ingest-footer", self.css)


if __name__ == '__main__':
    unittest.main()
