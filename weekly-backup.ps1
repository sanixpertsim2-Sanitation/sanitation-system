$base = "C:\Sanitation Hub"
$backupRoot = "$base\Backups"
$dataPath = "$base\data"
$photoPath = "$base\Photos"

$date = Get-Date -Format "yyyy-MM-dd"
$backupFolder = "$backupRoot\$date`_Sunday"

# Create folders
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null
New-Item -ItemType Directory -Force -Path "$backupFolder\Data" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupFolder\Photos" | Out-Null

# Copy data
Copy-Item "$dataPath\*" "$backupFolder\Data" -Recurse -Force

# Copy photos
Copy-Item "$photoPath\*" "$backupFolder\Photos" -Recurse -Force

# Compress
$zipPath = "$backupRoot\$date`_Sanitation_Backup.zip"
Compress-Archive -Path $backupFolder -DestinationPath $zipPath -Force

# Cleanup old backups (older than 90 days)
Get-ChildItem $backupRoot -Directory |
Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-90) } |
Remove-Item -Recurse -Force

Write-Host "✅ Weekly sanitation backup completed successfully"
