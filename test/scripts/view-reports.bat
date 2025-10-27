@echo off
chcp 65001 >nul
echo View Test Reports
cd /d "%~dp0\.."

echo.
echo Checking reports directory...
if not exist "reports" (
    echo Reports directory does not exist
    echo Please run tests first to generate reports
    pause
    exit /b 1
)

echo Reports directory exists
echo.

echo Report file list:
dir /b reports\*.json 2>nul | findstr /v "not found" >nul
if %errorlevel%==0 (
    echo JSON Reports:
    for %%f in (reports\*.json) do echo    %%f
    echo.
)

dir /b reports\*.html 2>nul | findstr /v "not found" >nul
if %errorlevel%==0 (
    echo HTML Reports:
    for %%f in (reports\*.html) do echo    %%f
    echo.
)

dir /b reports\*.csv 2>nul | findstr /v "not found" >nul
if %errorlevel%==0 (
    echo CSV Reports:
    for %%f in (reports\*.csv) do echo    %%f
    echo.
)

echo Tips:
echo    - HTML reports can be opened in browser
echo    - JSON reports contain detailed test data
echo    - CSV reports can be opened in Excel for analysis
echo.

set /p open="Open latest HTML report? (y/n): "
if /i "%open%"=="y" (
    for %%f in (reports\*.html) do (
        echo Opening report: %%f
        start "" "%%f"
        goto :done
    )
    echo No HTML reports found
)

:done
pause
