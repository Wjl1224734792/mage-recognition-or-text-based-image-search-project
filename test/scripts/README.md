# Test Scripts Usage Guide 📋

## 🚀 Quick Start

### Interactive Test Selection (Recommended)
```bash
scripts/run-all.bat
```
This will show a menu with options:
1. Basic Connection Test
2. Unit Tests
3. Performance Tests
4. Complete Test Suite
5. View Test Reports
6. Exit

### Direct Script Execution

#### Basic Connection Test
```bash
scripts/run-basic.bat
```
Tests API connection and basic functionality.

#### Unit Tests
```bash
scripts/run-unit.bat
```
Runs all API interface tests and generates reports.

#### Performance Tests
```bash
scripts/run-performance.bat
```
Runs performance tests with 3 concurrent users and generates reports.

#### View Test Reports
```bash
scripts/view-reports.bat
```
Shows all generated test reports and allows opening HTML reports in browser.

## 📊 Report Generation

All test scripts automatically generate reports in the `reports/` directory:
- **JSON Reports**: Structured data for program processing
- **HTML Reports**: Visual reports with charts and styling
- **CSV Reports**: Tabular data for Excel analysis

## 🛠️ Troubleshooting

### Script Encoding Issues
All batch files use UTF-8 encoding with `chcp 65001` to prevent text corruption.

### Path Issues
All scripts use relative paths (`%~dp0\..`) to ensure they work from any location.

### Report Directory
Reports are automatically generated in the `test/reports/` directory.

## 📝 Script Details

### run-all.bat
- Interactive menu for test selection
- Calls other scripts as needed
- Shows completion messages

### run-basic.bat
- Tests API connection
- Validates service health
- Quick verification tool

### run-unit.bat
- Tests all 7 API interfaces
- Generates detailed test reports
- Shows test results and statistics

### run-performance.bat
- Runs performance tests with 3 concurrent users
- Measures QPS, TPS, response times
- Generates performance reports

### view-reports.bat
- Lists all generated reports
- Shows report file locations
- Option to open HTML reports in browser

## 💡 Tips

1. **Start with Basic Test**: Always run `run-basic.bat` first to verify API connection
2. **Use Interactive Menu**: `run-all.bat` provides the best user experience
3. **Check Reports**: Use `view-reports.bat` to review test results
4. **Backend Services**: Ensure Milvus services are running before testing

---

**Note**: All scripts are designed to work from the test directory and handle path resolution automatically.
