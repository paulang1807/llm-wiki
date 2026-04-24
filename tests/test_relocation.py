import unittest
import os
import shutil
import tempfile
import json
import io
from pathlib import Path
import sys
from unittest.mock import MagicMock

# Add ui dir
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, WikiEngine

class TestRelocation(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.wiki_dir = self.test_dir / "wiki"
        self.wiki_dir.mkdir()
        
        import wiki_server
        wiki_server.WIKI_DIR = self.wiki_dir
        wiki_server.ENGINE = WikiEngine(wiki_dir=self.wiki_dir, raw_dir=self.test_dir / "raw")
        
        mock_request = MagicMock()
        mock_request.makefile.return_value = io.BytesIO(b"")
        self.handler = WikiHandler(mock_request, ('127.0.0.1', 0), MagicMock())

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_save_relocation(self):
        # 1. Create a file at OldDomain/OldSub/test.md
        old_rel_path = "OldDomain/OldSub/test.md"
        old_path = self.wiki_dir / old_rel_path
        old_path.parent.mkdir(parents=True, exist_ok=True)
        old_path.write_text("---\ndomain: OldDomain\nsubdomain: OldSub\n---\nContent")
        
        # 2. Save new content with NewDomain/NewSub
        new_content = "---\ndomain: NewDomain\nsubdomain: NewSub\n---\nUpdated content"
        data = {"path": old_rel_path, "content": new_content}
        
        # Mock send_json to capture response
        self.handler.send_json = MagicMock()
        self.handler.handle_save(data)
        
        # 3. Verify relocation
        new_rel_path = "NewDomain/NewSub/test.md"
        new_path = self.wiki_dir / new_rel_path
        
        self.assertTrue(new_path.exists(), "File should be moved to new path")
        self.assertFalse(old_path.exists(), "Old file should be gone")
        
        # Verify response contains new path
        response = self.handler.send_json.call_args[0][0]
        self.assertEqual(response['path'], new_rel_path)

if __name__ == '__main__':
    unittest.main()
