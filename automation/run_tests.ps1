# Convenience script for Windows: starts the demo server and runs the automation suite
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = (Resolve-Path (Join-Path $here '..')).Path
$appRoot = Join-Path $root 'ai_demos'

Set-Location $root

$venv = Join-Path $root '.venv\Scripts\Activate.ps1'
if (Test-Path $venv) {
    & $venv
}

# Serve the actual demo app folder explicitly so the browser does not hit the repo root.
Start-Process -NoNewWindow -FilePath 'python' -ArgumentList (Join-Path $here 'start_demo_server.py'), '--port', '8000', '--dir', $appRoot

# Give the server a moment to come up before pytest begins.
Start-Sleep -Seconds 1
pytest -q automation/test_features.py
