import unittest
from unittest.mock import MagicMock, patch
import json
import io
import sys
import os
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, ENGINE

class TestWikiAPI(unittest.TestCase):
    def setUp(self):
        self.mock_request = MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET /api/status HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 12345)
        self.server = MagicMock()
        WikiHandler.directory = str(Path(__file__).parent)

    def test_api_status_integration(self):
        with patch.object(WikiHandler, 'handle'):
            handler = WikiHandler(self.mock_request, self.client_address, self.server)
            handler.path = "/api/status" # Fixed: Set path before calling do_GET
            handler.wfile = io.BytesIO()
            handler.send_response = MagicMock()
            handler.send_header = MagicMock()
            handler.end_headers = MagicMock()
            
            handler.do_GET()
            
            handler.send_response.assert_called()
            response_data = json.loads(handler.wfile.getvalue().decode('utf-8'))
            self.assertIn('geminiReady', response_data)

    def test_api_search_integration(self):
        with patch.object(WikiHandler, 'handle'):
            with patch.object(ENGINE, 'search_files') as mock_search:
                mock_search.side_effect = lambda d, q, r, b: r.append({"title": "Result"})
                
                handler = WikiHandler(self.mock_request, self.client_address, self.server)
                handler.path = "/api/search?q=test"
                handler.wfile = io.BytesIO()
                handler.send_response = MagicMock()
                handler.send_header = MagicMock()
                handler.end_headers = MagicMock()
                
                handler.do_GET()
                
                response_data = json.loads(handler.wfile.getvalue().decode('utf-8'))
                self.assertEqual(response_data[0]['title'], "Result")

if __name__ == '__main__':
    unittest.main()
