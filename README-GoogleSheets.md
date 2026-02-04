# Google Sheets Integration for Sanixpert Weekend Archive

## Overview
This system integrates your Sanixpert MACY system with Google Sheets using your backup-bot service account. Every 48 hours, it automatically archives Supabase data to Google Sheets and then triggers the database cleanup.

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install google-spreadsheet google-auth-library
```

### 2. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Share it with your service account email: `backup-bot@sanixpert-backup.iam.gserviceaccount.com`
4. Give it "Editor" permissions
5. Copy the spreadsheet ID from the URL (e.g., `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`)

### 3. Set Spreadsheet ID
**In Browser:**
```javascript
localStorage.setItem('googleSheetsId', 'your-spreadsheet-id');
```

**In Node.js:**
```javascript
const spreadsheetId = 'your-spreadsheet-id';
```

### 4. Share Google Sheet with Service Account
1. Open your Google Sheet
2. Click "Share" button
3. Add email: `backup-bot@sanixpert-backup.iam.gserviceaccount.com`
4. Permission: "Editor"
5. Click "Send"

## 📋 Files Created

### Core Files:
- `js/googleSheetsConfig.js` - Service account configuration
- `js/googleSheetsArchive.js` - Main archive functionality
- `js/weekendArchiveScheduler.js` - Automatic scheduling
- `js/weekendArchiveRunner.js` - Main runner and initialization

### Configuration:
- `package-google-sheets.json` - Dependencies for Node.js

## 🔧 How It Works

### Automatic Process (Every 48 Hours):
1. **Fetch Data** - Gets all records older than 48 hours from Supabase
2. **Transform Data** - Formats data for Google Sheets with headers
3. **Archive to Sheets** - Appends data to your Google Sheet
4. **Cleanup Database** - Triggers 48-hour clean slate in Supabase
5. **Preserve Essentials** - Keeps face registry and open damages

### Data Exported:
- Pre-clean logs with equipment counts
- Post-clean logs with equipment matching validation
- Handover tasks and their status
- Area lead verification records
- Equipment match validation results

### Google Sheet Headers:
```
Timestamp | Area | Employee Name | Pre-Clean Bags Used | Post-Clean Bags Returned | Equipment Match | Handover Required | Status | Checklist Data | Submitted At
```

## 🎯 Usage Examples

### Manual Archive Run:
```javascript
// Browser console
await runWeekendArchive('your-spreadsheet-id');

// Node.js
const { runWeekendArchive } = require('./js/weekendArchiveRunner.js');
await runWeekendArchive('your-spreadsheet-id');
```

### Automatic Scheduling:
```javascript
// Initialize automatic scheduler
initializeWeekendScheduler('your-spreadsheet-id');

// Will run automatically every 48 hours
```

### Check Status:
```javascript
const scheduler = new WeekendArchiveScheduler();
const status = scheduler.getStatus();
console.log(status);
// Output: { lastRun: "2024-01-15 10:30 AM", hoursSinceLastRun: 24, nextRunIn: 24, isRunning: false }
```

## 🔐 Security Notes

### Service Account Security:
- Private key is stored in `googleSheetsConfig.js`
- Keep this file secure and don't commit to public repositories
- Service account has access to your Google Sheet only

### Data Privacy:
- Only archived data is stored in Google Sheets
- Face registry and open damages remain in Supabase
- Old data is deleted from Supabase after successful archive

## 📊 Google Sheet Structure

### Automatic Sheet Creation:
- Sheet name: "Sanixpert Archive"
- Headers automatically added on first run
- Data appended as new rows

### Equipment Matching:
- ✅ Match - Pre-clean and post-clean counts match
- ❌ Mismatch - Counts don't match (requires attention)

### Status Types:
- "Pre-Clean Completed"
- "Post-Clean Completed" 
- "Handover: Pending/Completed"
- "Area Lead Verification"

## 🚨 Troubleshooting

### Common Issues:

1. **Permission Denied**
   - Ensure service account email has Editor access to Google Sheet
   - Check service account key is correct

2. **Spreadsheet Not Found**
   - Verify spreadsheet ID is correct
   - Check Google Sheet is shared with service account

3. **Supabase Connection Error**
   - Ensure Supabase client is available
   - Check network connectivity

4. **No Data to Archive**
   - Normal if no records are older than 48 hours
   - Check system has been running for at least 48 hours

### Debug Mode:
```javascript
// Enable detailed logging
console.log('Archive status:', scheduler.getStatus());
```

## 🔄 Integration with Existing System

The Google Sheets archive integrates seamlessly with:
- ✅ 48-hour clean slate system
- ✅ Equipment matching validation
- ✅ Face detection system
- ✅ Photo storage optimization
- ✅ Automatic data cleanup

## 📈 Benefits

- **Data Persistence**: Historical data preserved in Google Sheets
- **Analytics**: Easy to analyze trends in Google Sheets
- **Backup**: Redundant storage of important data
- **Memory Optimization**: Supabase stays within free tier limits
- **Automation**: No manual intervention required

## 🎉 Ready to Use

Your Google Sheets integration is now ready! The system will:

1. Automatically archive data every 48 hours
2. Preserve historical records in Google Sheets
3. Maintain database performance
4. Provide detailed logging and status updates

Just set your spreadsheet ID and the system handles the rest!
