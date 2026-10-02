#!/usr/bin/env python3
import argparse
import http.server
import socketserver
import os
from pathlib import Path


def find_app_root(start_dir: Path) -> Path:
    """Return the folder that contains the served demo app.

    The automation folder may live under a repo root that does not itself include the app
    files. In this project the app is stored in a child folder such as ai_demos or ai_apps.
    """
    candidates = [
        start_dir,
        start_dir.parent,
        start_dir.parent / 'ai_demos',
        start_dir.parent / 'ai_apps',
        start_dir.parent / 'AI Demos',
        start_dir.parent / 'AI Demos' / 'ai_demos',
    ]

    for candidate in candidates:
        if not candidate.exists() or not candidate.is_dir():
            continue
        if (candidate / 'index.html').exists():
            return candidate
        if (candidate / 'app.js').exists() and (candidate / 'styles.css').exists():
            return candidate

    return start_dir.parent


parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8000)
parser.add_argument('--dir', type=str, default=None)
args = parser.parse_args()

here = Path(__file__).resolve().parent
serve_dir = Path(args.dir).resolve() if args.dir else find_app_root(here)
os.chdir(serve_dir)

handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
    print(f"Serving {serve_dir} at http://127.0.0.1:{args.port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
