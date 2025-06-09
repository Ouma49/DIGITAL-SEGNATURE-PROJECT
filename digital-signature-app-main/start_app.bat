@echo off
echo Starting Digital Signature Application...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if setup has been run
if not exist "keys\users" (
    echo Running setup...
    python setup.py
)

REM Start the application
echo Starting server...
python -m uvicorn app:app --reload

pause 