
import unittest
from unittest.mock import MagicMock, patch
import json
import io
import sys
import os
from pathlib import Path

# Add ui dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ui')))
from wiki_server import WikiHandler, ENGINE, CONFIG

class TestIngestionRobustness(unittest.TestCase):
    def setUp(self):
        self.mock_request = MagicMock()
        self.mock_request.makefile.return_value = io.BytesIO(b"GET / HTTP/1.1\r\n\r\n")
        self.client_address = ('127.0.0.1', 8888)
        self.server = MagicMock()
        
    def get_handler(self, path, method="GET", body=None):
        handler = WikiHandler(self.mock_request, self.client_address, self.server)
        handler.path = path
        handler.command = method
        handler.wfile = io.BytesIO()
        handler.headers = {}
        handler.send_response = MagicMock()
        handler.send_header = MagicMock()
        handler.end_headers = MagicMock()
        if body:
            handler.rfile = io.BytesIO(json.dumps(body).encode('utf-8'))
            handler.headers['Content-Length'] = len(json.dumps(body))
        return handler

    @patch('wiki_server.WikiHandler.call_gemini')
    @patch('pathlib.Path.iterdir')
    @patch('pathlib.Path.exists')
    @patch('pathlib.Path.is_file')
    @patch('shutil.move')
    def test_ingestion_error_handling(self, mock_move, mock_is_file, mock_exists, mock_iterdir, mock_gemini):
        # Setup: One file in inbox
        mock_file = MagicMock()
        mock_file.name = "test.txt"
        mock_file.suffix = ".txt"
        mock_file.stem = "test"
        mock_file.read_text.return_value = "Content"
        mock_file.exists.return_value = True
        
        mock_iterdir.return_value = [mock_file]
        mock_is_file.return_value = True
        mock_exists.return_value = True
        
        # Scenario: Gemini returns an error message
        mock_gemini.return_value = "Gemini API Error: Rate limit exceeded"
        
        handler = self.get_handler("/api/ingest-inbox", method="POST")
        
        # We need to mock RAW_DIR and WIKI_DIR to points to something safe
        with patch('wiki_server.RAW_DIR', Path("/tmp/raw")), \
             patch('wiki_server.WIKI_DIR', Path("/tmp/wiki")):
            
            # We also need to mock dest_path.write_text
            with patch('pathlib.Path.write_text') as mock_write, \
                 patch('pathlib.Path.mkdir'):
                
                handler.do_POST()
                
                # Read streamed JSON log lines
                output = handler.wfile.getvalue().decode('utf-8')
                log_lines = [json.loads(l) for l in output.strip().split('\n') if l.strip()]
                
                # Check for the FINAL_RESULT entry
                final = next((l for l in log_lines if l.get('FINAL_RESULT')), {})
                self.assertEqual(final.get('processed'), 0)
                
                # Check for the error message in the stream
                error_msg = next((l for l in log_lines if l.get('type') == 'error'), {})
                self.assertIn("AI ERROR", error_msg.get('message', ''))
                
                # Check that the file was NOT written as a wiki page
                mock_write.assert_not_called()

if __name__ == '__main__':
    unittest.main()
