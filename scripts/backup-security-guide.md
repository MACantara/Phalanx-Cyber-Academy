# Backup Security Script Usage

This PowerShell script (`backup-manager.ps1`) helps encrypt and securely store Phalanx Cyber Academy backup files.

## Prerequisites

1. **OpenSSL** (for encryption/decryption)
   ```powershell
   # Install via Chocolatey
   choco install openssl
   
   # Or download from https://slproweb.com/products/Win32OpenSSL.html
   ```

2. **AWS CLI** (for S3 upload, optional)
   ```powershell
   # Install via Chocolatey
   choco install awscli
   
   # Configure AWS credentials
   aws configure
   ```

## Usage Examples

### Encrypt a backup file
```powershell
.\backup-manager.ps1 -Action encrypt -BackupFile "Phalanx Cyber Academy_backup_20250822.zip"
# Will prompt for password and create Phalanx Cyber Academy_backup_20250822.zip.enc
```

### Encrypt with custom output file
```powershell
.\backup-manager.ps1 -Action encrypt -BackupFile "backup.zip" -OutputFile "secure_backup.enc"
```

### Decrypt a backup file
```powershell
.\backup-manager.ps1 -Action decrypt -BackupFile "Phalanx Cyber Academy_backup_20250822.zip.enc"
# Will prompt for password and create Phalanx Cyber Academy_backup_20250822.zip
```

### Upload to S3 (with encryption recommended)
```powershell
# First encrypt
.\backup-manager.ps1 -Action encrypt -BackupFile "backup.zip"

# Then upload encrypted file
.\backup-manager.ps1 -Action upload -BackupFile "backup.zip.enc" -S3Bucket "your-secure-bucket"
```

## Security Best Practices

1. **Always encrypt backups before storage**
2. **Use strong passwords** (minimum 16 characters, mixed case, numbers, symbols)
3. **Store passwords in a password manager**, not in scripts
4. **Test restore procedures** regularly
5. **Use separate S3 buckets** with restricted access
6. **Enable S3 versioning** and MFA delete protection
7. **Monitor backup integrity** with checksums

## Automation Example

Create a scheduled task for automatic encrypted backups:

```powershell
# backup-automation.ps1
$backupDir = "C:\Phalanx Cyber Academy\backups"
$encryptedDir = "C:\Phalanx Cyber Academy\encrypted-backups"
$s3Bucket = "your-secure-backup-bucket"

# Find latest backup
$latestBackup = Get-ChildItem $backupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestBackup) {
    # Encrypt latest backup
    $password = Get-Content "C:\secure\backup-password.txt" | ConvertTo-SecureString
    .\backup-manager.ps1 -Action encrypt -BackupFile $latestBackup.FullName -OutputFile "$encryptedDir\$($latestBackup.BaseName).enc"
    
    # Upload to S3
    .\backup-manager.ps1 -Action upload -BackupFile "$encryptedDir\$($latestBackup.BaseName).enc" -S3Bucket $s3Bucket
    
    # Clean up old encrypted files (keep last 7 days)
    Get-ChildItem $encryptedDir -Filter "*.enc" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item
}
```

## Error Handling

The script includes error handling for:
- Missing backup files
- Missing OpenSSL/AWS CLI
- Failed encryption/decryption
- Failed S3 uploads
- Invalid parameters

## Alternative: GPG Encryption

For environments without OpenSSL, use GPG:

```powershell
# Encrypt with GPG
gpg --output backup.zip.gpg --symmetric --cipher-algo AES256 backup.zip

# Decrypt with GPG  
gpg --output backup.zip --decrypt backup.zip.gpg
```
