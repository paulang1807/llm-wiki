"""
Tests for the blank-slate repository configuration.

Ensures that:
  1. The content directories (wiki/, raw/, raw/inbox/) exist and are tracked
     via .gitkeep files (so fresh clones get the right structure).
  2. Actual content files (*.md in wiki/, *.pdf etc. in raw/) are excluded
     by .gitignore so they are never accidentally committed.
  3. The .gitignore patterns are correctly structured.
"""
import unittest
import subprocess
import os
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent


def git(*args):
    """Run a git command in the repo root and return stdout."""
    result = subprocess.run(
        ["git"] + list(args),
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True
    )
    return result.stdout.strip(), result.returncode


class TestBlankSlateGitignore(unittest.TestCase):

    # ── .gitkeep stubs are tracked ────────────────────────────────────────────

    def test_wiki_gitkeep_is_tracked(self):
        """wiki/.gitkeep must be tracked by git to preserve directory for cloners."""
        tracked, _ = git("ls-files", "wiki/.gitkeep")
        self.assertEqual(tracked, "wiki/.gitkeep",
                         "wiki/.gitkeep must be a tracked file")

    def test_raw_gitkeep_is_tracked(self):
        """raw/.gitkeep must be tracked by git."""
        tracked, _ = git("ls-files", "raw/.gitkeep")
        self.assertEqual(tracked, "raw/.gitkeep",
                         "raw/.gitkeep must be a tracked file")

    def test_raw_inbox_gitkeep_is_tracked(self):
        """raw/inbox/.gitkeep must be tracked by git."""
        tracked, _ = git("ls-files", "raw/inbox/.gitkeep")
        self.assertEqual(tracked, "raw/inbox/.gitkeep",
                         "raw/inbox/.gitkeep must be a tracked file")

    # ── Content files are excluded ────────────────────────────────────────────

    def test_wiki_md_content_is_ignored(self):
        """Markdown files inside wiki/ must be ignored by git."""
        # Use check-ignore to test the pattern without needing the file to exist
        _, rc = git("check-ignore", "-q", "wiki/some-page.md")
        self.assertEqual(rc, 0,
                         "wiki/some-page.md should be gitignored")

    def test_wiki_subdir_content_is_ignored(self):
        """Files inside wiki subdirectories must be ignored."""
        _, rc = git("check-ignore", "-q", "wiki/os/some-page.md")
        self.assertEqual(rc, 0,
                         "wiki/os/some-page.md should be gitignored")

    def test_raw_pdf_is_ignored(self):
        """PDF files in raw/ must be ignored."""
        _, rc = git("check-ignore", "-q", "raw/document.pdf")
        self.assertEqual(rc, 0,
                         "raw/document.pdf should be gitignored")

    def test_raw_markdown_is_ignored(self):
        """Markdown files in raw/ must be ignored."""
        _, rc = git("check-ignore", "-q", "raw/notes.md")
        self.assertEqual(rc, 0,
                         "raw/notes.md should be gitignored")

    def test_raw_inbox_content_is_ignored(self):
        """Files dropped into raw/inbox/ must be ignored."""
        _, rc = git("check-ignore", "-q", "raw/inbox/new-note.md")
        self.assertEqual(rc, 0,
                         "raw/inbox/new-note.md should be gitignored")

    def test_archive_is_ignored(self):
        """The archive/ directory must be entirely gitignored."""
        _, rc = git("check-ignore", "-q", "archive/wiki/old-page.md")
        self.assertEqual(rc, 0,
                         "archive/ content should be gitignored")

    # ── .gitkeep stubs are NOT ignored ────────────────────────────────────────

    def test_wiki_gitkeep_is_not_ignored(self):
        """wiki/.gitkeep must NOT be gitignored (it's the tracking stub)."""
        _, rc = git("check-ignore", "-q", "wiki/.gitkeep")
        self.assertNotEqual(rc, 0,
                            "wiki/.gitkeep must NOT be gitignored")

    def test_raw_gitkeep_is_not_ignored(self):
        """raw/.gitkeep must NOT be gitignored."""
        _, rc = git("check-ignore", "-q", "raw/.gitkeep")
        self.assertNotEqual(rc, 0,
                            "raw/.gitkeep must NOT be gitignored")

    def test_raw_inbox_gitkeep_is_not_ignored(self):
        """raw/inbox/.gitkeep must NOT be gitignored."""
        _, rc = git("check-ignore", "-q", "raw/inbox/.gitkeep")
        self.assertNotEqual(rc, 0,
                            "raw/inbox/.gitkeep must NOT be gitignored")

    # ── No content is accidentally tracked ────────────────────────────────────

    def test_no_wiki_md_files_tracked(self):
        """No .md files inside wiki/ should be tracked in git."""
        tracked, _ = git("ls-files", "wiki/")
        md_files = [f for f in tracked.splitlines() if f.endswith(".md")]
        self.assertEqual(md_files, [],
                         f"Tracked wiki .md files found (should be none): {md_files}")

    def test_no_raw_content_tracked(self):
        """No source content files in raw/ should be tracked in git."""
        tracked, _ = git("ls-files", "raw/")
        content_files = [
            f for f in tracked.splitlines()
            if not f.endswith(".gitkeep")
        ]
        self.assertEqual(content_files, [],
                         f"Tracked raw content found (should be none): {content_files}")

    # ── Directory structure exists for fresh clones ───────────────────────────

    def test_wiki_dir_exists(self):
        """wiki/ directory must exist (via .gitkeep) for the server to start."""
        self.assertTrue((REPO_ROOT / "wiki").is_dir(),
                        "wiki/ directory must exist")

    def test_raw_inbox_dir_exists(self):
        """raw/inbox/ directory must exist for the ingestion pipeline."""
        self.assertTrue((REPO_ROOT / "raw" / "inbox").is_dir(),
                        "raw/inbox/ directory must exist")


if __name__ == '__main__':
    unittest.main()
