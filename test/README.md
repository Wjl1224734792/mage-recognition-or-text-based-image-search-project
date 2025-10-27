# Milvus API Test System 🚀

A Milvus API test system based on layered architecture design, supporting unit tests and performance tests.

## 🏗️ Architecture Design

```
test/
├── config/                    # Configuration Layer
│   └── test.config.js        # Test Configuration
├── utils/                    # Utility Layer
│   ├── http.util.js         # HTTP Utility Class
│   ├── performance.util.js   # Performance Test Tools
│   └── concurrency.util.js   # Concurrency Control Tools
├── services/                 # Service Layer
│   └── database.test.service.js # Database Test Service
├── executors/               # Execution Layer
│   ├── unit.executor.js     # Unit Test Executor
│   ├── performance.executor.js # Performance Test Executor
│   └── test.executor.js     # Comprehensive Test Executor
├── reports/                 # Report Layer
│   └── report.generator.js  # Report Generator
├── scripts/                 # Script Layer
│   ├── run-tests.sh         # Linux/Mac Scripts
│   ├── run-tests.bat        # Windows Scripts
│   ├── run-all.bat          # Interactive Test Selection
│   ├── run-basic.bat        # Basic Connection Test
│   ├── run-unit.bat          # Unit Tests
│   ├── run-performance.bat   # Performance Tests
│   └── view-reports.bat     # View Test Reports
├── index.js                 # Entry Layer - Main Entry File
├── basic-test.js            # Basic Connection Test
└── package.json             # Project Configuration
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd test
yarn install
```

### 2. Run Tests

#### Basic Connection Test
```bash
# Test API connection
scripts/run-basic.bat
# or
node basic-test.js
```

#### Complete Test Suite
```bash
# Interactive test selection (Recommended)
scripts/run-all.bat

# Using yarn commands
yarn test          # Run all tests
yarn test:unit     # Run unit tests only
yarn test:performance # Run performance tests only

# Run specific tests directly
scripts/run-unit.bat       # Unit tests
scripts/run-performance.bat # Performance tests
```

## 📊 Test Features

### Unit Tests 🧪
- ✅ Health Check Interface (`/health`)
- ✅ Collection Statistics Interface (`/api/v1/milvus/stats`)
- ✅ Insert Vector Interface (`/api/v1/milvus/insert`)
- ✅ Sync Vector Interface (`/api/v1/milvus/sync`)
- ✅ Update Vector Interface (`/api/v1/milvus/update`)
- ✅ Search Vector Interface (`/api/v1/milvus/search`)
- ✅ Batch Delete Interface (`/api/v1/milvus/batch-delete`)

### Performance Tests ⚡
- 📈 **QPS** (Queries Per Second)
- 📈 **TPS** (Transactions Per Second)
- ⏱️ **RT** (Response Time) - Average, P95, P99
- 🔄 **Concurrency Test** (3 concurrent)
- 📊 **Error Rate Statistics**
- 🚀 **Throughput Analysis**

### Report Generation 📊
- 📄 **JSON Reports** - Structured Data
- 🌐 **HTML Reports** - Visual Reports
- 📊 **CSV Reports** - Tabular Data

## 🎯 Performance Standards

### QPS (Queries Per Second)
- **Excellent**: >100
- **Good**: 50-100
- **Needs Optimization**: <50

### Response Time
- **Excellent**: <500ms
- **Good**: 500-1000ms
- **Needs Optimization**: >1000ms

### Success Rate
- **Excellent**: ≥99%
- **Good**: 95-99%
- **Needs Optimization**: <95%

## 🛠️ Troubleshooting

### Issue 1: Tests run quickly but no output
**Solution**: 
1. Run `scripts/run-basic.bat` to check API connection
2. Ensure backend services are started: `yarn start:all`

### Issue 2: PowerShell encoding issues
**Solution**: Use batch files instead of PowerShell commands

### Issue 3: Connection refused
**Solution**: 
1. Start database service: `yarn start:database`
2. Start embedding service: `yarn start:embedding`

## 📈 Recommended Test Workflow

### 1. Preparation
```bash
# Start backend services
yarn start:all
```

### 2. Basic Verification
```bash
cd test
scripts/run-basic.bat    # Verify API connection
```

### 3. Complete Testing
```bash
scripts/run-all.bat      # Select test type
# or
yarn test                # Run all tests
```

### 4. View Reports
```bash
# Report location: test/reports/
# Includes: JSON, HTML, CSV formats
scripts/view-reports.bat  # View test reports
```

## 📝 Configuration

Edit `config/test.config.js` file:

```javascript
{
  baseUrl: 'http://localhost:3001',     // API Base URL
  timeout: 30000,                       // Request timeout
  performance: {
    concurrency: 3,                     // Concurrency level
    duration: 60,                        // Test duration (seconds)
    rampUpTime: 10,                     // Warm-up time (seconds)
    thinkTime: 1                        // Think time (seconds)
  }
}
```

## 🎉 Summary

Test System Features:
- ✅ **Layered Architecture Design** - Clear code organization structure
- ✅ **Yarn Package Management** - Using yarn as package manager
- ✅ **API Interface Testing** - Testing all 7 API interfaces
- ✅ **Performance Testing** - QPS/TPS/RT/Concurrency testing
- ✅ **3 Concurrent Tests** - Meets concurrency requirements
- ✅ **Detailed Reports** - JSON/HTML/CSV formats
- ✅ **Batch Files** - Solves PowerShell encoding issues
- ✅ **Interactive Selection** - User-friendly test selection

---

**Note**: Please ensure Milvus database service is started and running normally before testing.
