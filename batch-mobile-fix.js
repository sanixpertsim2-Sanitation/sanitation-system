// Batch Mobile & Date Fixes for All Pages
// This script will systematically apply mobile and date fixes to all HTML pages

const fs = require('fs');
const path = require('path');

// List of all HTML files to update
const htmlFiles = [
  'macy-decoration-damage.html',
  'macy-decoration-handover.html', 
  'macy-decoration-release.html',
  'macy-production-preclean.html',
  'macy-production-control.html',
  'macy-production-handover.html',
  'macy-production-release.html',
  'dashboard.html',
  'live-dashboard.html',
  'kpi-compare.html',
  'kpi-trend.html',
  'report.html',
  'index.html',
  'area.html',
  'action.html',
  'Inspection.html',
  'damage.html',
  'release.html',
  'postclean.html',
  'post-release-findings.html',
  'setup-google-sheets.html'
];

// Fix patterns
const fixes = [
  {
    name: 'Mobile Viewport',
    find: /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/g,
    replace: '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
  },
  {
    name: 'Mobile CSS',
    find: /<link rel="stylesheet" href="css\/style\.css">/g,
    replace: '<link rel="stylesheet" href="css/style.css">\n<link rel="stylesheet" href="css/mobile.css">'
  },
  {
    name: 'DateUtils Integration',
    find: /<script src="js\/supabaseClient\.js"><\/script>/g,
    replace: '<script src="js/supabaseClient.js"></script>\n<script src="js/dateUtils.js"></script>\n<script src="js/mobileUtils.js"></script>'
  },
  {
    name: 'Date References',
    find: /new Date\(\)\.toISOString\(\)/g,
    replace: 'DateUtils.getCurrentTimestamp()'
  }
];

// Apply fixes to all files
htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      if (fix.find.test(content)) {
        content = content.replace(fix.find, fix.replace);
        console.log(`✅ Applied ${fix.name} to ${file}`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`📝 Updated ${file}`);
    } else {
      console.log(`ℹ️  No changes needed for ${file}`);
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 Batch update complete!');
console.log('All pages now have mobile optimization and date fixes!');
