# 🧪 Sanixpert Automated Website Testing Suite

## 🎯 Overview

The Sanixpert Automated Website Testing Suite provides comprehensive testing capabilities for your deployed website, ensuring all functionality works correctly across different environments and scenarios.

## 🚀 Features

### **📋 Test Coverage**
- ✅ **Basic Connectivity** - Website accessibility and response
- ✅ **Homepage Load** - Content rendering and branding
- ✅ **Static Assets** - CSS, JS, and image loading
- ✅ **Navigation Links** - Page accessibility and routing
- ✅ **Mobile Responsiveness** - Mobile-friendly design checks
- ✅ **Database Connectivity** - Supabase connection testing
- ✅ **Authentication Flow** - Manual authentication workflows
- ✅ **Business Workflows** - Pre-clean, post-clean, lead verification
- ✅ **Heartbeat System** - Database monitoring functionality
- ✅ **Performance** - Load times and response metrics
- ✅ **Security Headers** - Security configuration validation
- ✅ **Error Handling** - 404 and error page testing

### **🛠️ Testing Tools**
- **Web Interface** - User-friendly browser-based testing
- **CLI Tool** - Command-line automated testing
- **GitHub Actions** - Continuous integration testing
- **Multiple Formats** - JSON, HTML, and console output

---

## 🌐 Web Interface Testing

### **Access the Tester**
```
http://localhost:3000/website-tester.html
```

### **Quick Start**
1. Open the testing interface in your browser
2. Enter your website URL (or use quick URLs)
3. Select test options
4. Click "🚀 Start Testing"
5. Review results and download reports

### **Quick Test URLs**
- **Vercel Production**: `https://sanixpert.vercel.app`
- **Local Development**: `https://localhost:3000`
- **Custom Vercel**: `https://your-app.vercel.app`
- **Custom URL**: Any website URL

### **Test Options**
- **Connectivity** - Basic website accessibility
- **Workflows** - Business process testing
- **Performance** - Load time and speed metrics
- **Security** - Header and security checks

---

## 💻 Command Line Testing

### **Installation**
```bash
# No installation required - uses Node.js built-in
# Ensure Node.js 18+ is installed
node --version
```

### **Basic Usage**
```bash
# Test production website
node website-tester-cli.js -u https://sanixpert.vercel.app

# Test with custom settings
node website-tester-cli.js -u https://your-app.vercel.app -t 60 -r 3

# Save results to file
node website-tester-cli.js -u https://example.com -o results.json -f json

# Generate HTML report
node website-tester-cli.js -u https://example.com -o report.html -f html
```

### **Command Options**
```bash
Options:
  -u, --url <url>           Website URL to test (required)
  -o, --output <file>      Output file for results
  -f, --format <format>     Output format: console, json, html
  -v, --verbose            Verbose output
  -t, --timeout <seconds>  Test timeout in seconds (default: 30)
  -r, --retries <count>     Retry attempts for failed tests (default: 3)
  -h, --help               Show help message
```

### **Examples**
```bash
# Quick test of production
node website-tester-cli.js -u https://sanixpert.vercel.app

# Comprehensive test with report
node website-tester-cli.js -u https://sanixpert.vercel.app -o full-report.html -f html -v

# Test staging environment with custom timeout
node website-tester-cli.js -u https://staging.vercel.app -t 45 -r 2 -o staging-results.json

# Verbose testing for debugging
node website-tester-cli.js -u https://localhost:3000 -v -t 60
```

---

## 🔄 GitHub Actions Integration

### **Automatic Triggers**
- **Push to main/develop** - Run full test suite
- **Pull requests** - Test proposed changes
- **Hourly schedule** - Continuous monitoring
- **Manual dispatch** - On-demand testing

### **Workflow Jobs**
1. **Main Testing** - Comprehensive website testing
2. **Multi-Environment** - Test multiple environments
3. **Performance Monitoring** - Load time tracking
4. **Security Scanning** - Header validation

### **Setup Instructions**
1. GitHub Actions are already configured in `.github/workflows/website-testing.yml`
2. Tests run automatically on pushes and PRs
3. Results are available in GitHub Actions tab
4. Artifacts are saved for 30 days

### **Manual Testing**
```bash
# Trigger manual test with custom URL
gh workflow run website-testing.yml \
  -f test_url="https://your-app.vercel.app" \
  -f timeout="45" \
  -f retries="3"
```

---

## 📊 Test Results

### **Result Formats**

#### **Console Output**
```
🚀 Starting Sanixpert Website Test Suite
🌐 Testing URL: https://sanixpert.vercel.app
==================================================
✅ testBasicConnectivity: PASSED
✅ testHomepageLoad: PASSED
❌ testStaticAssets: FAILED - Asset not found
...
==================================================
📊 TEST SUITE SUMMARY
==================================================
🌐 URL: https://sanixpert.vercel.app
📈 Success Rate: 91.7%
✅ Passed: 11/12
❌ Failed: 1/12
🎯 OVERALL STATUS: ❌ SOME TESTS FAILED
```

#### **JSON Output**
```json
{
  "startTime": "2024-02-04T18:30:00.000Z",
  "baseUrl": "https://sanixpert.vercel.app",
  "totalTests": 12,
  "passed": 11,
  "failed": 1,
  "skipped": 0,
  "successRate": "91.7",
  "duration": 15000,
  "details": [
    {
      "name": "testBasicConnectivity",
      "status": "passed",
      "duration": 250,
      "result": { "reachable": true }
    }
  ]
}
```

#### **HTML Report**
- Interactive web report
- Visual test status indicators
- Detailed error messages
- Performance metrics
- Downloadable and shareable

---

## 🔧 Advanced Configuration

### **Custom Test Settings**
```javascript
// Create custom tester instance
const tester = new WebsiteTester('https://your-app.vercel.app');

// Configure settings
tester.testTimeout = 45000;        // 45 seconds
tester.retryAttempts = 5;          // 5 retries
tester.verbose = true;             // Verbose logging

// Run custom test suite
const results = await tester.runFullTestSuite();
```

### **Adding Custom Tests**
```javascript
// Add custom test method
async testCustomFeature() {
  const response = await fetch(this.baseUrl + '/api/custom');
  const data = await response.json();
  
  return {
    customFeatureWorking: data.status === 'ok',
    responseTime: Date.now()
  };
}
```

### **Environment Variables**
```bash
# Set environment for testing
export TEST_URL="https://staging.vercel.app"
export TEST_TIMEOUT="60"
export TEST_RETRIES="3"

# Run with environment variables
node website-tester-cli.js -u $TEST_URL -t $TEST_TIMEOUT -r $TEST_RETRIES
```

---

## 📱 Mobile Testing

### **Mobile-Specific Checks**
- Viewport meta tag presence
- Mobile CSS loading
- Touch-friendly interface
- Responsive design validation
- Mobile performance metrics

### **Mobile Test Results**
```json
{
  "testMobileResponsiveness": {
    "hasViewportMeta": true,
    "hasMobileCSS": true,
    "hasResponsiveDesign": true
  }
}
```

---

## 🔒 Security Testing

### **Security Headers Checked**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### **Security Test Results**
```json
{
  "testSecurityHeaders": {
    "headers": {
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-xss-protection": "1; mode=block",
      "referrer-policy": "strict-origin-when-cross-origin"
    },
    "hasSecurityHeaders": true
  }
}
```

---

## 📈 Performance Monitoring

### **Performance Metrics**
- Page load time
- Asset loading speed
- Response time measurement
- Size optimization checks
- Performance scoring

### **Performance Results**
```json
{
  "testPerformance": {
    "loadTime": 1250,
    "pageSize": 245,
    "statusCode": 200,
    "fast": true
  }
}
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Tests Fail with Timeout**
```bash
# Increase timeout
node website-tester-cli.js -u https://your-app.vercel.app -t 60
```

#### **CORS Issues**
- Ensure proper CORS headers
- Test from same domain if possible
- Use HTTPS for production testing

#### **Asset Loading Failures**
- Check file paths in vercel.json
- Verify static asset deployment
- Ensure proper caching headers

#### **Database Connection Issues**
- Verify Supabase configuration
- Check environment variables
- Test database functions separately

### **Debug Mode**
```bash
# Enable verbose output
node website-tester-cli.js -u https://your-app.vercel.app -v

# Check individual test
node -e "
const tester = require('./js/website-tester.js');
const t = new tester('https://your-app.vercel.app');
t.testBasicConnectivity().then(console.log);
"
```

---

## 📞 Support and Maintenance

### **Regular Testing Schedule**
- **Hourly**: Automated GitHub Actions
- **Daily**: Performance monitoring
- **Weekly**: Full comprehensive testing
- **On Deploy**: Immediate post-deployment testing

### **Test Maintenance**
- Update test URLs when domains change
- Add new tests for new features
- Review and update test expectations
- Monitor test success rates

### **Best Practices**
1. **Test before deployment** - Always run tests before pushing
2. **Monitor failures** - Investigate any test failures immediately
3. **Keep tests updated** - Update tests when features change
4. **Use multiple environments** - Test staging and production
5. **Review performance** - Monitor load time trends

---

## 🎉 Getting Started

### **Quick Start Guide**
1. **Open Web Tester**: `http://localhost:3000/website-tester.html`
2. **Enter URL**: `https://sanixpert.vercel.app`
3. **Click Start**: Begin comprehensive testing
4. **Review Results**: Check all test metrics
5. **Download Report**: Save results for documentation

### **Production Testing**
```bash
# Test production deployment
node website-tester-cli.js -u https://sanixpert.vercel.app -o production-report.html -f html

# Test staging environment
node website-tester-cli.js -u https://staging.vercel.app -o staging-results.json -f json
```

### **Continuous Monitoring**
- GitHub Actions run automatically
- Results available in Actions tab
- Performance trends tracked over time
- Security scans run regularly

---

**🚀 Your Sanixpert system is now fully testable with comprehensive automated testing!**

The testing suite provides complete coverage of all functionality, ensuring your deployed website works correctly across all scenarios and environments.
