# Convenience script for Windows: starts demo server and runs pytest
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$venv = Join-Path $here '.venv\Scripts\Activate.ps1'
if (Test-Path $venv) { & $venv }
Start-Process -NoNewWindow -FilePath 'python' -ArgumentList 'start_demo_server.py', '--port', '8000'
pytest -q
