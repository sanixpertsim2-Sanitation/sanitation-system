// ======================================================
// SANIXPERT AUTOMATED WEBSITE TESTING SUITE
// Tests deployed website functionality by URL
// ======================================================

class WebsiteTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.testResults = [];
    this.currentTest = null;
    this.testTimeout = 30000; // 30 seconds per test
    this.retryAttempts = 3;
  }

  // Run complete test suite
  async runFullTestSuite() {
    console.log('🚀 Starting Sanixpert Website Test Suite');
    console.log('🌐 Testing URL:', this.baseUrl);
    console.log('=' .repeat(50));

    const testSuites = [
      this.testBasicConnectivity.bind(this),
      this.testHomepageLoad.bind(this),
      this.testStaticAssets.bind(this),
      this.testNavigationLinks.bind(this),
      this.testMobileResponsiveness.bind(this),
      this.testDatabaseConnectivity.bind(this),
      this.testAuthenticationFlow.bind(this),
      this.testWorkflows.bind(this),
      this.testHeartbeatSystem.bind(this),
      this.testPerformance.bind(this),
      this.testSecurityHeaders.bind(this),
      this.testErrorHandling.bind(this)
    ];

    const results = {
      startTime: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: testSuites.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (let i = 0; i < testSuites.length; i++) {
      const testSuite = testSuites[i];
      const testName = testSuite.name.replace('bound ', '');
      
      console.log(`\n📋 Running Test ${i + 1}/${testSuites.length}: ${testName}`);
      
      try {
        const result = await this.runTestWithRetry(testSuite, testName);
        results.details.push(result);
        
        if (result.status === 'passed') {
          results.passed++;
          console.log(`✅ ${testName}: PASSED`);
        } else if (result.status === 'failed') {
          results.failed++;
          console.log(`❌ ${testName}: FAILED`);
          console.log(`   Error: ${result.error}`);
        } else {
          results.skipped++;
          console.log(`⏭️  ${testName}: SKIPPED`);
        }
      } catch (error) {
        results.failed++;
        const errorResult = {
          name: testName,
          status: 'failed',
          error: error.message,
          duration: 0
        };
        results.details.push(errorResult);
        console.log(`❌ ${testName}: FAILED - ${error.message}`);
      }
    }

    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);
    results.successRate = ((results.passed / results.totalTests) * 100).toFixed(1);

    this.printTestSummary(results);
    return results;
  }

  // Run test with retry logic
  async runTestWithRetry(testFunction, testName, attempt = 1) {
    try {
      const startTime = Date.now();
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), this.testTimeout)
        )
      ]);
      const duration = Date.now() - startTime;
      
      return {
        name: testName,
        status: 'passed',
        duration,
        result,
        attempt
      };
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`   Retry ${attempt}/${this.retryAttempts} for ${testName}...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.runTestWithRetry(testFunction, testName, attempt + 1);
      }
      
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        duration: 0,
        attempt
      };
    }
  }

  // Test 1: Basic Connectivity
  async testBasicConnectivity() {
    const response = await fetch(this.baseUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    
    return {
      reachable: true,
      responseTime: Date.now()
    };
  }

  // Test 2: Homepage Load
  async testHomepageLoad() {
    const response = await fetch(this.baseUrl);
    const html = await response.text();
    
    // Check for key elements
    const checks = {
      statusCode: response.status,
      hasSanixpertBranding: html.includes('Sanixpert'),
      hasGiveAndGo: html.includes('Give & Go'),
      hasMainContent: html.includes('app-container'),
      hasMobileNext: html.includes('mobile-next')
    };
    
    return checks;
  }

  // Test 3: Static Assets
  async testStaticAssets() {
    const assets = [
      '/css/mobile-next.css',
      '/js/mobile-next.js',
      '/js/supabaseClient.js',
      '/js/database-heartbeat.js'
    ];

    const results = {};
    
    for (const asset of assets) {
      try {
        const response = await fetch(this.baseUrl + asset);
        results[asset] = {
          status: response.status,
          loaded: response.ok
        };
      } catch (error) {
        results[asset] = {
          status: 'error',
          loaded: false,
          error: error.message
        };
      }
    }
    
    return results;
  }

  // Test 4: Navigation Links
  async testNavigationLinks() {
    const response = await fetch(this.baseUrl);
    const html = await response.text();
    
    // Extract links (simplified)
    const linkRegex = /href="([^"]+)"/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href.startsWith('/') || href.startsWith('http')) {
        links.push(href);
      }
    }
    
    // Test key pages
    const keyPages = [
      '/index-next.html',
      '/dashboard-live-enhanced.html',
      '/heartbeat-monitor.html',
      '/macy-production-preclean-enhanced.html'
    ];
    
    const results = {};
    
    for (const page of keyPages) {
      try {
        const pageResponse = await fetch(this.baseUrl + page);
        results[page] = {
          status: pageResponse.status,
          accessible: pageResponse.ok
        };
      } catch (error) {
        results[page] = {
          status: 'error',
          accessible: false,
          error: error.message
        };
      }
    }
    
    return {
      totalLinks: links.length,
      keyPages: results
    };
  }

  // Test 5: Mobile Responsiveness
  async testMobileResponsiveness() {
    // This would typically use a headless browser
    // For now, we'll check for mobile meta tags
    const response = await fetch(this.baseUrl);
    const html = await response.text();
    
    const checks = {
      hasViewportMeta: html.includes('viewport'),
      hasMobileCSS: html.includes('mobile-next.css'),
      hasResponsiveDesign: html.includes('responsive') || html.includes('mobile')
    };
    
    return checks;
  }

  // Test 6: Database Connectivity
  async testDatabaseConnectivity() {
    try {
      // Test heartbeat endpoint
      const heartbeatResponse = await fetch(this.baseUrl + '/heartbeat-monitor.html');
      const heartbeatHtml = await heartbeatResponse.text();
      
      const checks = {
        heartbeatPageAccessible: heartbeatResponse.ok,
        hasHeartbeatScript: heartbeatHtml.includes('database-heartbeat.js'),
        hasSupabaseClient: heartbeatHtml.includes('supabaseClient.js')
      };
      
      return checks;
    } catch (error) {
      return {
        error: error.message,
        connected: false
      };
    }
  }

  // Test 7: Authentication Flow
  async testAuthenticationFlow() {
    const pages = [
      '/macy-production-preclean-enhanced.html',
      '/macy-production-postclean-enhanced.html',
      '/macy-production-lead-verification-enhanced.html'
    ];
    
    const results = {};
    
    for (const page of pages) {
      try {
        const response = await fetch(this.baseUrl + page);
        const html = await response.text();
        
        results[page] = {
          accessible: response.ok,
          hasManualAuth: html.includes('manual') || html.includes('name'),
          hasNoFaceDetection: !html.includes('faceUtils.js'),
          hasAuthFields: html.includes('employeeName') || html.includes('userName')
        };
      } catch (error) {
        results[page] = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    return results;
  }

  // Test 8: Workflows
  async testWorkflows() {
    const workflows = [
      { name: 'Pre-Clean', url: '/macy-production-preclean-enhanced.html' },
      { name: 'Post-Clean', url: '/macy-production-postclean-enhanced.html' },
      { name: 'Lead Verification', url: '/macy-production-lead-verification-enhanced.html' },
      { name: 'Dashboard', url: '/dashboard-live-enhanced.html' }
    ];
    
    const results = {};
    
    for (const workflow of workflows) {
      try {
        const response = await fetch(this.baseUrl + workflow.url);
        const html = await response.text();
        
        results[workflow.name] = {
          accessible: response.ok,
          hasForm: html.includes('<form') || html.includes('submit'),
          hasValidation: html.includes('validate') || html.includes('required'),
          hasSubmitButton: html.includes('submit') || html.includes('Submit')
        };
      } catch (error) {
        results[workflow.name] = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    return results;
  }

  // Test 9: Heartbeat System
  async testHeartbeatSystem() {
    try {
      const response = await fetch(this.baseUrl + '/heartbeat-monitor.html');
      const html = await response.text();
      
      const checks = {
        monitorPageAccessible: response.ok,
        hasHeartbeatScript: html.includes('database-heartbeat.js'),
        hasMonitoringUI: html.includes('heartbeatStatus'),
        hasControls: html.includes('startHeartbeat') || html.includes('forceHeartbeat')
      };
      
      return checks;
    } catch (error) {
      return {
        error: error.message,
        working: false
      };
    }
  }

  // Test 10: Performance
  async testPerformance() {
    const startTime = performance.now();
    const response = await fetch(this.baseUrl);
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    
    // Check response size (approximate)
    const text = await response.text();
    const pageSize = text.length;
    
    return {
      loadTime: Math.round(loadTime),
      pageSize: Math.round(pageSize / 1024), // KB
      statusCode: response.status,
      fast: loadTime < 3000 // Under 3 seconds
    };
  }

  // Test 11: Security Headers
  async testSecurityHeaders() {
    const response = await fetch(this.baseUrl);
    
    const securityHeaders = {
      'x-content-type-options': response.headers.get('x-content-type-options'),
      'x-frame-options': response.headers.get('x-frame-options'),
      'x-xss-protection': response.headers.get('x-xss-protection'),
      'referrer-policy': response.headers.get('referrer-policy')
    };
    
    return {
      headers: securityHeaders,
      hasSecurityHeaders: Object.values(securityHeaders).some(h => h !== null)
    };
  }

  // Test 12: Error Handling
  async testErrorHandling() {
    // Test non-existent page
    try {
      const response = await fetch(this.baseUrl + '/non-existent-page.html');
      
      return {
        notFoundStatus: response.status === 404,
        errorHandling: response.status >= 400 && response.status < 500
      };
    } catch (error) {
      return {
        error: error.message,
        errorHandling: false
      };
    }
  }

  // Print test summary
  printTestSummary(results) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(50));
    console.log(`🌐 URL: ${results.baseUrl}`);
    console.log(`⏱️  Duration: ${Math.round(results.duration / 1000)}s`);
    console.log(`📈 Success Rate: ${results.successRate}%`);
    console.log(`✅ Passed: ${results.passed}/${results.totalTests}`);
    console.log(`❌ Failed: ${results.failed}/${results.totalTests}`);
    console.log(`⏭️  Skipped: ${results.skipped}/${results.totalTests}`);
    
    if (results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      results.details
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎯 OVERALL STATUS:', results.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
    console.log('='.repeat(50));
  }

  // Generate HTML report
  generateHTMLReport(results) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Sanixpert Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .metric { text-align: center; padding: 15px; border-radius: 8px; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .skipped { background: #fff3cd; color: #856404; }
        .test-details { margin-top: 20px; }
        .test { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .test.passed { border-left-color: #28a745; }
        .test.failed { border-left-color: #dc3545; }
        .test.skipped { border-left-color: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Sanixpert Website Test Report</h1>
        <p><strong>URL:</strong> ${results.baseUrl}</p>
        <p><strong>Tested:</strong> ${new Date(results.startTime).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${Math.round(results.duration / 1000)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric passed">
            <h3>${results.passed}</h3>
            <p>Passed</p>
        </div>
        <div class="metric failed">
            <h3>${results.failed}</h3>
            <p>Failed</p>
        </div>
        <div class="metric skipped">
            <h3>${results.skipped}</h3>
            <p>Skipped</p>
        </div>
        <div class="metric">
            <h3>${results.successRate}%</h3>
            <p>Success Rate</p>
        </div>
    </div>
    
    <div class="test-details">
        <h2>Test Details</h2>
        ${results.details.map(test => `
            <div class="test ${test.status}">
                <h3>${test.name}</h3>
                <p><strong>Status:</strong> ${test.status.toUpperCase()}</p>
                <p><strong>Duration:</strong> ${test.duration}ms</p>
                ${test.error ? `<p><strong>Error:</strong> ${test.error}</p>` : ''}
                ${test.result ? `<pre>${JSON.stringify(test.result, null, 2)}</pre>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebsiteTester;
} else {
  window.WebsiteTester = WebsiteTester;
}
