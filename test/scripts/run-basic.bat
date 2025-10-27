@echo off
chcp 65001 >nul
echo Basic API Connection Test
cd /d "%~dp0\.."
node basic-test.js
pause
