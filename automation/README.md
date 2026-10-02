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

Run the demo server (serves the actual app folder on port 8000):
```bash
python start_demo_server.py --port 8000 --dir ../ai_demos
```

Run tests (in a separate terminal):
```bash
pytest -q automation/test_features.py
```

Notes
- Tests use Playwright via `pytest-playwright`.
- The app now lives under `ai_demos`, so the server should explicitly target that folder to avoid the repo-root 404 issue.
- If you prefer a different port, set `--port` when starting the server and update `automation/conftest.py` `base_url` fixture accordingly.
