Automation tests for System X demo

Prerequisites
- Python 3.10+ installed
- Git (optional)

Setup (one-time)
```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
# or: source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python -m playwright install
```

Run the demo server (serves the repo root on port 8000):
```bash
python start_demo_server.py --port 8000
```

Run tests (in a separate terminal):
```bash
pytest -q
```

Notes
- Tests use Playwright via `pytest-playwright`. The `start_demo_server.py` serves the app directory so Playwright can open `http://127.0.0.1:8000/index.html`.
- If you prefer a different port, set `--port` when starting the server and update `automation/conftest.py` `base_url` fixture accordingly.
