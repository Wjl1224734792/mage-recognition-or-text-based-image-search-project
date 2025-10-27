@echo off
chcp 65001 >nul
echo Unit Tests
cd /d "%~dp0\.."
node executors/unit.executor.js
pause
