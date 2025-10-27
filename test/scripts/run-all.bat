@echo off
chcp 65001 >nul
echo Milvus API Test Suite
cd /d "%~dp0\.."

echo.
echo Test Type Selection:
echo 1. Basic Connection Test
echo 2. Unit Tests
echo 3. Performance Tests
echo 4. Complete Test Suite
echo 5. View Test Reports
echo 6. Exit
echo.

set /p choice="Please select (1-6): "

if "%choice%"=="1" (
    echo Running basic connection test...
    node basic-test.js
    echo.
    echo Basic connection test completed. Please select other options for complete testing.
) else if "%choice%"=="2" (
    echo Running unit tests...
    node executors/unit.executor.js
    echo.
    echo Unit test reports generated in reports/ directory
) else if "%choice%"=="3" (
    echo Running performance tests...
    node executors/performance.executor.js
    echo.
    echo Performance test reports generated in reports/ directory
) else if "%choice%"=="4" (
    echo Running complete test suite...
    node index.js
    echo.
    echo Complete test reports generated in reports/ directory
) else if "%choice%"=="5" (
    echo Viewing test reports...
    call scripts/view-reports.bat
) else if "%choice%"=="6" (
    echo Goodbye
    exit /b 0
) else (
    echo Invalid selection
)

echo.
pause
