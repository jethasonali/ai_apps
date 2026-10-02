#!/usr/bin/env python3
import argparse
import http.server
import socketserver
import os
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8000)
parser.add_argument('--dir', type=str, default=None)
args = parser.parse_args()

# Default directory: parent of the automation folder (project root)
here = Path(__file__).resolve().parent
serve_dir = Path(args.dir) if args.dir else here.parent
os.chdir(serve_dir)

handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
    print(f"Serving {serve_dir} at http://127.0.0.1:{args.port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
