"""
Tests for the Logo Home Navigation feature.
Verifies that:
  1. index.html contains a logo element with id="logo"
  2. app.js contains a goHome() function
  3. app.js wires the logo click to goHome()
  4. The goHome function contains the expected UI state-reset logic
"""
import unittest
import os
import sys
from pathlib import Path

UI_DIR = Path(__file__).parent.parent / "ui" / "public"


class TestLogoHomeNavigation(unittest.TestCase):

    def setUp(self):
        self.html = (UI_DIR / "index.html").read_text(encoding="utf-8")
        self.js   = (UI_DIR / "app.js").read_text(encoding="utf-8")

    # ── HTML checks ───────────────────────────────────────────────────────────

    def test_logo_has_id(self):
        """The logo div must have id='logo' so JS can attach the click handler."""
        self.assertIn('id="logo"', self.html,
                      "index.html must contain a logo element with id='logo'")

    def test_logo_has_home_title(self):
        """The logo should have a title attribute indicating it navigates home."""
        self.assertIn('title="Go to home"', self.html,
                      "Logo element should have a descriptive title for accessibility")

    # ── JavaScript checks ─────────────────────────────────────────────────────

    def test_goHome_function_defined(self):
        """app.js must define a goHome function."""
        self.assertIn("function goHome()", self.js,
                      "app.js must define a goHome() function")

    def test_goHome_exported(self):
        """goHome must be exported on window for testability."""
        self.assertIn("window.goHome = goHome", self.js,
                      "goHome should be exported as window.goHome")

    def test_logo_click_wired_to_goHome(self):
        """The logo click listener must be connected to goHome."""
        self.assertIn("elements.logo.addEventListener('click', goHome)", self.js,
                      "Logo click must be wired to goHome in setupEventListeners")

    def test_goHome_clears_current_page(self):
        """goHome must clear state.currentPage to return to the welcome screen."""
        self.assertIn("state.currentPage = null", self.js,
                      "goHome must reset state.currentPage to null")

    def test_goHome_shows_welcome(self):
        """goHome must make the welcome screen visible."""
        self.assertIn("elements.welcome.style.display = 'flex'", self.js,
                      "goHome must set welcome display to flex")

    def test_goHome_hides_page_view(self):
        """goHome must hide the page view."""
        self.assertIn("elements.pageView.style.display = 'none'", self.js,
                      "goHome must hide the pageView element")

    def test_goHome_hides_graph_view(self):
        """goHome must also hide the graph view."""
        self.assertIn("elements.graphView.style.display = 'none'", self.js,
                      "goHome must hide the graphView element")

    def test_goHome_resets_url(self):
        """goHome must reset the URL to '/' to clear the hash."""
        self.assertIn("window.history.pushState", self.js,
                      "goHome must use pushState to clear the URL hash")

    def test_logo_element_referenced_in_js(self):
        """elements.logo must be defined in the elements object."""
        self.assertIn("logo: document.getElementById('logo')", self.js,
                      "elements.logo must reference the DOM element by its id")

    # ── CSS checks ────────────────────────────────────────────────────────────

    def test_logo_has_pointer_cursor(self):
        """The logo CSS must include cursor:pointer to indicate clickability."""
        css = (UI_DIR / "style.css").read_text(encoding="utf-8")
        # Find the .logo block and check cursor
        self.assertIn("cursor: pointer", css,
                      "style.css must set cursor:pointer on .logo")


if __name__ == '__main__':
    unittest.main()
