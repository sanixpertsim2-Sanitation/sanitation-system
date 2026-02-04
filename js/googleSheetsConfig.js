// Google Sheets Service Account Configuration
// Store your credentials securely

const GOOGLE_SHEETS_CONFIG = {
  // Complete Service Account Credentials
  serviceAccount: {
    type: "service_account",
    project_id: "sanixpert-backup",
    private_key_id: "68f8b7a727577ccda1db58a96c81ff7b258ec9b4",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8aW7c1omZk3Se\ndkdlEMYQJwB+7TGD5GRQBc7eM8ZRmoYWKsqKhz8lugon42uXuOXmuGhhFByZWavi\nRrHe9TRMWqE6Fqo2Kh1cG1JjFWfyFGLk0sc0z2bTJNYsKAVJMS6tbKh8YTZ+nmyU\n50W/CJU+jwW1YhcIXHJCm0Cgqc+GJZOc+//XsNlBbZhASge93PgcUy7cT0ALMys9\nuWe8r9991Yfhjbf1wrtibc6wXNxCvxCeuvwRZfxgfnaGX8vS7UJ6o2ZCKiHX55Cm\nBXw1QSgGfykJmTQtk6jqGmnrDDw9jjPpU+op+kTnsTZw6jJWfwHm5SoJvp4csOMi\nkVFuC1NLAgMBAAECggEAL9hsVTtLzQqjgjwSDEmyqlZlK1ZLjS06BhI7grTOJ1ng\ntA9gyMXolMmGG7QGVgyXoTvyEbj8PDsHyZnfQHmvMraPG8O2rLOMKiAsD0pXz6M6\nq9YUzUXf3D2N/7+X/Aq3ykV+EbvUDVpow3VpgkYJNE44imOi6rYjM+PeCQ6mSu+f\nT0dBf49iimwXrqqFw3hyaGt1SRoGyfssOER3cuueqj6wNJC4IBAP5WRamhusBpBL\n4aaT4P0mPRyJCe8STh4bIuGE27yVLPQd2m9d7quQacGId99UwJpeNc1psePbgkH4\n+bI14R3AVcH4bFcdcaawWoxaFxXIhc8bI0oynqtOIQKBgQDi0rdD/tznDdVa9xtV\njiEVR6HrYbrQYZpwUqPV9omX2wPi+XDuXFRT7ZCcCy3293EXw3YSAsDGc7PeLA2q\nmOGfttjh0KlmQ7PAQt11/OD9L6Wj1Rrp97BQwi1c8pNWcuegT16rTKgInF1g9NIb\nEgkXtElCesuSsCMK2hWvJ129IQKBgQDUpdWhfgM42QWJaK6lqlXZcx3p0IAmCuvI\np9Zv52evH18niXlXAyC9UEQFXD5oG/3I9PNZYreHCCb8k6Iy3gmd53nDpywxZDSC\nWiOQwqepuwwISWzNWvMq/as8zg4D5pPaS75qB6qtRPpCjk5g3CayJgvS9GuzprR0\ni76eFiH26wKBgHE2aYDHyeyNjAtuQTdvzHV5nokE66Csxs//f4UBG+Yuy/7TMBnY\n/cIyVjZ8ogGdudX5mooc06l6ALII3P1kd2Ene5Miehrv+d0hwrXsdUQKLyvZ5wgk\n990nPkshTIcerRvn4cGwbkJ2AWmuaNxYIS+yrco/zjI2NhdpiN82z+PhAoGBAMxX\nY5ehIPWCzqhBePpnWcHwtkEWA98KxZL3fb/hDaiiK+0xVPHBZrelJwhDoRCoPVLb\n1/EARL40nko+kDHzXihn5IGX5oa79R2CAwU7mKQowyI/dJdNm7inNOLkW2FyNIgk\nGyGGpoOEcjx8xWKci27L0rbv+4MSYfxQwWbme9LrAoGAWYYZBXYqXOollWHgF72E\nnApEkQJ7C9nWW8x4MlC/hfg19uxQooR9cIkMvkvc4/Vxj8UCYYwOm+jZcmExOM+a\nNkPKDztQ784IOh5X8BJAO9wmlCrlKpLr0xy5R4tpoTybYaK6SPh90wEadJN/QgFu\nS2z6+M87vmoTcyEl/X5S5CM=\n-----END PRIVATE KEY-----\n",
    client_email: "backup-bot@sanixpert-backup.iam.gserviceaccount.com",
    client_id: "101053557895703341915",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/backup-bot%40sanixpert-backup.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  },
  
  // Google Sheet Configuration
  spreadsheet: {
    // You'll set this when initializing
    id: null, // e.g., '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    sheetName: 'Sanixpert Archive'
  },
  
  // Headers for the Google Sheet
  headers: [
    'Timestamp',
    'Area', 
    'Employee Name',
    'Pre-Clean Bags Used',
    'Post-Clean Bags Returned',
    'Equipment Match',
    'Handover Required',
    'Status',
    'Checklist Data',
    'Submitted At'
  ]
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GOOGLE_SHEETS_CONFIG };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;
}
