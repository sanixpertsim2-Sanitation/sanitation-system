// Google Sheets integration for weekend archive system
// Uses your backup-bot service account

class GoogleSheetsArchive {
  constructor() {
    this.config = null;
    this.doc = null;
  }

  // Initialize with configuration
  initialize(config) {
    this.config = config;
    return this;
  }

  // Initialize Google Sheets with service account
  async initializeGoogleSheets() {
    try {
      // For Node.js environment
      if (typeof require !== 'undefined') {
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const { JWT } = require('google-auth-library');
        
        // Create JWT client with service account
        const serviceAccountAuth = new JWT({
          email: this.config.serviceAccount.client_email,
          key: this.config.serviceAccount.private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        // Initialize spreadsheet
        this.doc = new GoogleSpreadsheet(this.config.spreadsheet.id);
        await this.doc.useServiceAccountAuth(serviceAccountAuth);
        await this.doc.loadInfo();
        
        console.log('Google Sheets initialized successfully');
        return this.doc;
      }
      
      // For browser environment (using gapi)
      else if (typeof gapi !== 'undefined') {
        await this.initializeBrowserAuth();
        return this.doc;
      }
      
      throw new Error('Environment not supported for Google Sheets integration');
      
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      throw new Error('Google Sheets initialization failed: ' + error.message);
    }
  }

  // Browser authentication using gapi
  async initializeBrowserAuth() {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: 'YOUR_API_KEY', // You'll need to set this
            clientId: 'YOUR_CLIENT_ID', // You'll need to set this
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets'
          });
          
          // For service account in browser, you'd need to implement OAuth2 flow
          // This is more complex and typically done server-side
          
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Fetch data from Supabase before cleanup
  async fetchDataFromSupabase() {
    const supabase = window.supabaseClient || (typeof require !== 'undefined' ? require('./supabaseClient.js').supabaseClient : null);
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      
      // Fetch pre-clean data
      const { data: preCleanData, error: preCleanError } = await supabase
        .from('pre_cleaning_logs')
        .select('*')
        .lt('submitted_at', cutoffTime);
      
      // Fetch post-clean data
      const { data: postCleanData, error: postCleanError } = await supabase
        .from('post_cleaning_logs')
        .select('*')
        .lt('submitted_at', cutoffTime);
      
      // Fetch handover tasks
      const { data: handoverData, error: handoverError } = await supabase
        .from('handover_tasks')
        .select('*')
        .lt('created_at', cutoffTime);
      
      // Fetch inspections
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('area_inspection_logs')
        .select('*')
        .lt('submitted_at', cutoffTime);
      
      if (preCleanError || postCleanError || handoverError || inspectionError) {
        throw new Error('Failed to fetch data from Supabase: ' + 
          (preCleanError?.message || postCleanError?.message || handoverError?.message || inspectionError?.message));
      }
      
      return {
        preClean: preCleanData || [],
        postClean: postCleanData || [],
        handovers: handoverData || [],
        inspections: inspectionData || []
      };
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
      throw error;
    }
  }

  // Transform data for Google Sheets format
  transformDataForSheets(supabaseData) {
    const rows = [];
    
    // Process pre-clean data
    supabaseData.preClean.forEach(preClean => {
      const postClean = supabaseData.postClean.find(pc => pc.preclean_id === preClean.id);
      const equipmentMatch = postClean ? (preClean.bags_used === postClean.bags_returned) : 'N/A';
      
      rows.push({
        'Timestamp': new Date().toISOString(),
        'Area': preClean.area || 'Unknown',
        'Employee Name': preClean.employee_name,
        'Pre-Clean Bags Used': preClean.bags_used,
        'Post-Clean Bags Returned': postClean ? postClean.bags_returned : 'N/A',
        'Equipment Match': equipmentMatch ? '✅ Match' : '❌ Mismatch',
        'Handover Required': postClean ? (postClean.handover_required ? 'Yes' : 'No') : 'N/A',
        'Status': 'Pre-Clean Completed',
        'Checklist Data': JSON.stringify(preClean.checklist),
        'Submitted At': preClean.submitted_at
      });
    });
    
    // Process handover tasks
    supabaseData.handovers.forEach(handover => {
      rows.push({
        'Timestamp': new Date().toISOString(),
        'Area': handover.area || 'Unknown',
        'Employee Name': handover.completed_by || 'N/A',
        'Pre-Clean Bags Used': 'N/A',
        'Post-Clean Bags Returned': 'N/A',
        'Equipment Match': 'N/A',
        'Handover Required': 'Yes',
        'Status': `Handover: ${handover.status}`,
        'Checklist Data': handover.task_description,
        'Submitted At': handover.created_at
      });
    });
    
    // Process inspections
    supabaseData.inspections.forEach(inspection => {
      rows.push({
        'Timestamp': new Date().toISOString(),
        'Area': 'Various',
        'Employee Name': inspection.inspector_name,
        'Pre-Clean Bags Used': 'N/A',
        'Post-Clean Bags Returned': 'N/A',
        'Equipment Match': 'N/A',
        'Handover Required': 'N/A',
        'Status': 'Area Lead Verification',
        'Checklist Data': JSON.stringify(inspection.checklist),
        'Submitted At': inspection.submitted_at
      });
    });
    
    return rows;
  }

  // Append data to Google Sheets
  async appendToGoogleSheet(dataRows) {
    try {
      if (!this.doc) {
        await this.initializeGoogleSheets();
      }
      
      let sheet = this.doc.sheetsByTitle[this.config.spreadsheet.sheetName];
      
      // Create sheet if it doesn't exist
      if (!sheet) {
        sheet = await this.doc.addSheet({
          title: this.config.spreadsheet.sheetName,
          headerValues: this.config.headers
        });
      } else if (sheet.rowCount === 0) {
        // Add headers if sheet is empty
        await sheet.setHeaderRow(this.config.headers);
      }
      
      // Add new rows
      await sheet.addRows(dataRows);
      
      console.log(`Successfully appended ${dataRows.length} rows to Google Sheets`);
      return { success: true, rowsAdded: dataRows.length };
    } catch (error) {
      console.error('Failed to append to Google Sheets:', error);
      throw error;
    }
  }

  // Trigger 48-hour cleanup in Supabase
  async triggerSupabaseCleanup() {
    const supabase = window.supabaseClient || (typeof require !== 'undefined' ? require('./supabaseClient.js').supabaseClient : null);
    
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    try {
      // Call the clean slate function
      const { data, error } = await supabase.rpc('clean_slate_48hr');
      
      if (error) {
        throw error;
      }
      
      console.log('Supabase cleanup completed:', data);
      return { success: true, cleanedData: data };
    } catch (error) {
      console.error('Failed to trigger Supabase cleanup:', error);
      throw error;
    }
  }

  // Main weekend archive function
  async runWeekendArchive() {
    try {
      console.log('Starting weekend archive process...');
      
      // Step 1: Fetch data from Supabase
      console.log('Fetching data from Supabase...');
      const supabaseData = await this.fetchDataFromSupabase();
      
      if (supabaseData.preClean.length === 0 && 
          supabaseData.postClean.length === 0 && 
          supabaseData.handovers.length === 0 && 
          supabaseData.inspections.length === 0) {
        console.log('No data to archive. Skipping cleanup.');
        return { success: true, message: 'No data to archive' };
      }
      
      // Step 2: Transform data for Google Sheets
      console.log('Transforming data for Google Sheets...');
      const transformedData = this.transformDataForSheets(supabaseData);
      
      // Step 3: Append to Google Sheets
      console.log('Appending data to Google Sheets...');
      const sheetsResult = await this.appendToGoogleSheet(transformedData);
      
      // Step 4: Trigger Supabase cleanup
      console.log('Triggering Supabase cleanup...');
      const cleanupResult = await this.triggerSupabaseCleanup();
      
      console.log('Weekend archive completed successfully!');
      
      return {
        success: true,
        sheetsResult,
        cleanupResult,
        totalRowsArchived: transformedData.length
      };
      
    } catch (error) {
      console.error('Weekend archive failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Set spreadsheet ID
  setSpreadsheetId(spreadsheetId) {
    if (this.config) {
      this.config.spreadsheet.id = spreadsheetId;
    }
  }

  // Set custom sheet name
  setSheetName(sheetName) {
    if (this.config) {
      this.config.spreadsheet.sheetName = sheetName;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleSheetsArchive };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.GoogleSheetsArchive = GoogleSheetsArchive;
}
