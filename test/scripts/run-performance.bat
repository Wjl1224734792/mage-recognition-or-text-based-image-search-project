@echo off
chcp 65001 >nul
echo Performance Tests
cd /d "%~dp0\.."
node executors/performance.executor.js
pause
