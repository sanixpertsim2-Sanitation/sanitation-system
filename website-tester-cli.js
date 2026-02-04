// ======================================================
// SANIXPERT AUTOMATED WEBSITE TESTING (Node.js)
// Command-line testing tool for deployed websites
// ======================================================

const WebsiteTester = require('./js/website-tester.js');
const fs = require('fs');
const path = require('path');

class CLITester {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = this.parseArgs();
  }

  parseArgs() {
    const options = {
      url: null,
      output: null,
      format: 'console',
      verbose: false,
      timeout: 30000,
      retries: 3
    };

    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];
      
      switch (arg) {
        case '-u':
        case '--url':
          options.url = this.args[++i];
          break;
        case '-o':
        case '--output':
          options.output = this.args[++i];
          break;
        case '-f':
        case '--format':
          options.format = this.args[++i];
          break;
        case '-v':
        case '--verbose':
          options.verbose = true;
          break;
        case '-t':
        case '--timeout':
          options.timeout = parseInt(this.args[++i]) * 1000;
          break;
        case '-r':
        case '--retries':
          options.retries = parseInt(this.args[++i]);
          break;
        case '-h':
        case '--help':
          this.showHelp();
          process.exit(0);
          break;
      }
    }

    return options;
  }

  showHelp() {
    console.log(`
🧪 Sanixpert Website Tester - Command Line Tool

Usage: node website-tester-cli.js [options]

Options:
  -u, --url <url>           Website URL to test (required)
  -o, --output <file>      Output file for results
  -f, --format <format>     Output format: console, json, html (default: console)
  -v, --verbose            Verbose output
  -t, --timeout <seconds>  Test timeout in seconds (default: 30)
  -r, --retries <count>     Retry attempts for failed tests (default: 3)
  -h, --help               Show this help message

Examples:
  node website-tester-cli.js -u https://sanixpert.vercel.app
  node website-tester-cli.js -u https://example.com -o results.json -f json
  node website-tester-cli.js -u https://localhost:3000 -v -t 60
  node website-tester-cli.js -u https://app.vercel.app -o report.html -f html

Quick Test URLs:
  https://sanixpert.vercel.app     (Production)
  https://localhost:3000          (Local Development)
  https://your-app.vercel.app      (Your Vercel App)
`);
  }

  async run() {
    if (!this.options.url) {
      console.error('❌ Error: URL is required. Use -u <url> to specify the website to test.');
      console.log('Use --help for usage information.');
      process.exit(1);
    }

    console.log('🚀 Starting Sanixpert Website Test Suite');
    console.log('🌐 Testing URL:', this.options.url);
    console.log('⏱️  Timeout:', this.options.timeout / 1000, 'seconds');
    console.log('🔄 Retries:', this.options.retries);
    console.log('=' .repeat(50));

    try {
      // Create tester instance
      const tester = new WebsiteTester(this.options.url);
      tester.testTimeout = this.options.timeout;
      tester.retryAttempts = this.options.retries;

      // Run tests
      const results = await tester.runFullTestSuite();

      // Output results
      await this.outputResults(results);

      // Exit with appropriate code
      process.exit(results.failed > 0 ? 1 : 0);

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async outputResults(results) {
    switch (this.options.format) {
      case 'json':
        await this.outputJSON(results);
        break;
      case 'html':
        await this.outputHTML(results);
        break;
      case 'console':
      default:
        this.outputConsole(results);
        break;
    }
  }

  outputConsole(results) {
    // Summary is already printed by the tester
    if (this.options.verbose) {
      console.log('\n📋 Detailed Results:');
      console.log('-'.repeat(50));
      
      results.details.forEach(test => {
        console.log(`\n${test.name}:`);
        console.log(`  Status: ${test.status.toUpperCase()}`);
        console.log(`  Duration: ${test.duration}ms`);
        if (test.attempt) console.log(`  Attempts: ${test.attempt}`);
        if (test.error) console.log(`  Error: ${test.error}`);
        if (test.result && this.options.verbose) {
          console.log(`  Result:`, JSON.stringify(test.result, null, 4));
        }
      });
    }

    // Save to file if specified
    if (this.options.output) {
      const data = JSON.stringify(results, null, 2);
      fs.writeFileSync(this.options.output, data);
      console.log(`\n💾 Results saved to: ${this.options.output}`);
    }
  }

  async outputJSON(results) {
    const data = JSON.stringify(results, null, 2);
    
    if (this.options.output) {
      fs.writeFileSync(this.options.output, data);
      console.log(`💾 JSON results saved to: ${this.options.output}`);
    } else {
      console.log(data);
    }
  }

  async outputHTML(results) {
    // Create HTML report
    const html = this.generateHTMLReport(results);
    
    if (this.options.output) {
      fs.writeFileSync(this.options.output, html);
      console.log(`💾 HTML report saved to: ${this.options.output}`);
    } else {
      console.log('❌ Error: Output file is required for HTML format');
      console.log('Use -o <file> to specify output file');
    }
  }

  generateHTMLReport(results) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sanixpert Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc; color: #1f2937; line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; padding: 30px; border-radius: 16px; margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .summary { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px; margin-bottom: 30px;
        }
        .card { 
            background: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;
        }
        .card.passed { border-top: 4px solid #10b981; }
        .card.failed { border-top: 4px solid #ef4444; }
        .card.skipped { border-top: 4px solid #f59e0b; }
        .card h3 { font-size: 2rem; margin-bottom: 5px; }
        .card p { color: #6b7280; font-weight: 500; }
        .test-item { 
            background: white; padding: 20px; margin-bottom: 15px;
            border-radius: 8px; border-left: 4px solid #e5e7eb;
        }
        .test-item.passed { border-left-color: #10b981; background: #f0fdf4; }
        .test-item.failed { border-left-color: #ef4444; background: #fef2f2; }
        .test-item.skipped { border-left-color: #f59e0b; background: #fffbeb; }
        .test-name { font-weight: 600; margin-bottom: 8px; }
        .test-status { 
            display: inline-block; padding: 4px 12px; border-radius: 20px;
            font-size: 12px; font-weight: 600; text-transform: uppercase;
            margin-bottom: 8px;
        }
        .test-status.passed { background: #10b981; color: white; }
        .test-status.failed { background: #ef4444; color: white; }
        .test-status.skipped { background: #f59e0b; color: white; }
        .test-meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
        .test-error { 
            background: #fef2f2; color: #ef4444; padding: 10px;
            border-radius: 6px; font-family: monospace; font-size: 14px;
        }
        .test-result { 
            background: #f8fafc; padding: 15px; border-radius: 6px;
            font-family: monospace; font-size: 14px; max-height: 200px; overflow-y: auto;
        }
        .footer { text-align: center; margin-top: 40px; color: #6b7280; }
        @media (max-width: 768px) { .container { padding: 10px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Sanixpert Test Report</h1>
            <p>Automated testing results for ${results.baseUrl}</p>
            <p>Generated: ${new Date(results.startTime).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="card passed">
                <h3>${results.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="card failed">
                <h3>${results.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="card skipped">
                <h3>${results.skipped}</h3>
                <p>Tests Skipped</p>
            </div>
            <div class="card">
                <h3>${results.successRate}%</h3>
                <p>Success Rate</p>
            </div>
        </div>
        
        <div class="test-details">
            <h2>Test Details</h2>
            ${results.details.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-status ${test.status}">${test.status}</div>
                    <div class="test-meta">
                        Duration: ${test.duration}ms
                        ${test.attempt ? `| Attempts: ${test.attempt}` : ''}
                    </div>
                    ${test.error ? `<div class="test-error">${test.error}</div>` : ''}
                    ${test.result ? `<div class="test-result">${JSON.stringify(test.result, null, 2)}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Report generated by Sanixpert Automated Website Tester</p>
            <p>Test Duration: ${Math.round(results.duration / 1000)}s | Total Tests: ${results.totalTests}</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// Run CLI tester
if (require.main === module) {
  const cliTester = new CLITester();
  cliTester.run();
}

module.exports = CLITester;
