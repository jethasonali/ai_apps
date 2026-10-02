import subprocess
import sys
import time
import socket
from pathlib import Path
import atexit
import os
import pytest
import re
import os

@pytest.fixture(scope='session')
def base_url():
    return 'http://127.0.0.1:8000'

@pytest.fixture(scope='session', autouse=True)
def demo_server():
    """Start the demo static server if not already listening on port 8000."""
    host = '127.0.0.1'
    port = 8000

    def is_listening():
        try:
            with socket.create_connection((host, port), timeout=0.2):
                return True
        except OSError:
            return False

    if is_listening():
        yield
        return

    # start server
    script = Path(__file__).resolve().parent / 'start_demo_server.py'
    # if script not found in automation, reference parent folder
    if not script.exists():
        script = Path(__file__).resolve().parent.parent / 'start_demo_server.py'

    # Run the demo server as a child process and inherit stdout/stderr so logs are visible.
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'
    proc = subprocess.Popen([sys.executable, str(script), '--port', str(port)], env=env, stdout=None, stderr=None)

    def _cleanup():
        try:
            proc.terminate()
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

    atexit.register(_cleanup)

    # wait until listening
    for _ in range(30):
        if is_listening():
            break
        time.sleep(0.2)

    yield

    _cleanup()

# Provide a playwright `page` fixture from pytest-playwright; tests will receive it automatically.


@pytest.fixture(autouse=True)
def clear_demo_booked_slots(page, base_url):
    """Clear persisted demo bookings in browser localStorage before each test.

    This prevents leftover booked slots from previous runs affecting availability checks.
    """
    try:
        page.goto(base_url)
        # remove the booked slots storage key and any bookings storage
        page.evaluate("localStorage.removeItem('demo_booked_slots_v1'); localStorage.removeItem('demo_bookings_v1');")
    except Exception:
        # if page fixture or navigation isn't available for some reason, ignore and continue
        pass
    yield


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Attach the test report object to the item so fixtures can access it after execution."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)


@pytest.fixture(autouse=True)
def save_screenshot_on_failure(request, page):
    """On test failure, save a screenshot and page HTML into outputs/test_failures.

    Files are named using the test nodeid and timestamp. This helps debugging UI state
    when a Playwright-driven scenario fails.
    """
    yield
    try:
        for when in ("setup", "call"):
            rep = getattr(request.node, f"rep_{when}", None)
            if rep is None:
                continue
            if rep.failed:
                outdir = Path(__file__).resolve().parent.parent / 'outputs' / 'test_failures'
                outdir.mkdir(parents=True, exist_ok=True)
                safe_name = re.sub(r'[^A-Za-z0-9_.-]', '_', request.node.nodeid)
                ts = time.strftime('%Y%m%d-%H%M%S')
                png_path = outdir / f"{safe_name}-{when}-{ts}.png"
                html_path = outdir / f"{safe_name}-{when}-{ts}.html"
                try:
                    page.screenshot(path=str(png_path), full_page=True)
                except Exception:
                    # ignore screenshot errors
                    pass
                try:
                    content = page.content()
                    html_path.write_text(content, encoding='utf-8')
                except Exception:
                    pass
                break
    except Exception:
        # don't let helper failures mask original test failures
        pass


# Optional slow-motion after each pytest-bdd step to make headed runs easier to follow.
# Use environment variable SLOWMO (seconds, float) to enable; default 0 = disabled.
def pytest_bdd_after_step(request, feature, scenario, step, step_func, step_func_args):
    try:
        s = float(os.getenv('SLOWMO', '0'))
    except Exception:
        s = 0
    if s and s > 0:
        time.sleep(s)
