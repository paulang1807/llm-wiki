import unittest
import urllib.request
import threading
from ui.wiki_server import WikiHandler, ThreadedTCPServer
from pathlib import Path
import os
import shutil

class TestApiCacheHeaders(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = Path("test_cache_headers")
        cls.test_dir.mkdir(exist_ok=True)
        (cls.test_dir / "wiki").mkdir(exist_ok=True)
        (cls.test_dir / "raw").mkdir(exist_ok=True)
        (cls.test_dir / "raw/inbox").mkdir(exist_ok=True)
        
        # Patch paths in wiki_server
        import ui.wiki_server
        ui.wiki_server.WIKI_DIR = cls.test_dir / "wiki"
        ui.wiki_server.RAW_DIR = cls.test_dir / "raw"
        
        cls.server = ThreadedTCPServer(('localhost', 0), WikiHandler)
        cls.port = cls.server.server_address[1]
        cls.server_thread = threading.Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        shutil.rmtree(cls.test_dir)

    def test_cache_headers_tree(self):
        url = f"http://localhost:{self.port}/api/tree"
        with urllib.request.urlopen(url) as response:
            headers = response.info()
            self.assertEqual(headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate')
            self.assertEqual(headers.get('Pragma'), 'no-cache')
            self.assertEqual(headers.get('Surrogate-Control'), 'no-store')

    def test_cache_headers_inbox_files(self):
        url = f"http://localhost:{self.port}/api/inbox-files"
        with urllib.request.urlopen(url) as response:
            headers = response.info()
            self.assertEqual(headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate')
            self.assertEqual(headers.get('Surrogate-Control'), 'no-store')

    def test_api_inbox_alias(self):
        url = f"http://localhost:{self.port}/api/inbox"
        with urllib.request.urlopen(url) as response:
            self.assertEqual(response.status, 200)
            headers = response.info()
            self.assertEqual(headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate')

if __name__ == '__main__':
    unittest.main()
