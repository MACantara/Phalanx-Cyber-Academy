# Phalanx Cyber Academy Backup Management Script
# This script helps encrypt and securely store backup files

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("encrypt", "decrypt", "upload")]
    [string]$Action,
    
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    
    [Parameter()]
    [string]$Password,
    
    [Parameter()]
    [string]$S3Bucket,
    
    [Parameter()]
    [string]$OutputFile
)

function Encrypt-Backup {
    param($InputFile, $OutputFile, $Password)
    
    Write-Host "Encrypting backup file: $InputFile"
    
    if (-not $OutputFile) {
        $OutputFile = "$InputFile.enc"
    }
    
    # Use AES-256 encryption with OpenSSL (requires OpenSSL to be installed)
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        $env:OPENSSL_PASS = $Password
        openssl enc -aes-256-cbc -salt -in $InputFile -out $OutputFile -pass env:OPENSSL_PASS
        Remove-Item env:OPENSSL_PASS
        Write-Host "Backup encrypted successfully: $OutputFile"
    } else {
        Write-Error "OpenSSL not found. Please install OpenSSL or use GPG for encryption."
        exit 1
    }
}

function Decrypt-Backup {
    param($InputFile, $OutputFile, $Password)
    
    Write-Host "Decrypting backup file: $InputFile"
    
    if (-not $OutputFile) {
        $OutputFile = $InputFile -replace '\.enc$', ''
    }
    
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        $env:OPENSSL_PASS = $Password
        openssl enc -aes-256-cbc -d -in $InputFile -out $OutputFile -pass env:OPENSSL_PASS
        Remove-Item env:OPENSSL_PASS
        Write-Host "Backup decrypted successfully: $OutputFile"
    } else {
        Write-Error "OpenSSL not found. Please install OpenSSL or use GPG for decryption."
        exit 1
    }
}

function Upload-ToS3 {
    param($BackupFile, $S3Bucket)
    
    Write-Host "Uploading backup to S3: $S3Bucket"
    
    if (Get-Command aws -ErrorAction SilentlyContinue) {
        $fileName = Split-Path $BackupFile -Leaf
        $s3Key = "Phalanx Cyber Academy_backups/$fileName"
        
        aws s3 cp $BackupFile "s3://$S3Bucket/$s3Key" --acl private --server-side-encryption AES256
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Backup uploaded successfully to s3://$S3Bucket/$s3Key"
        } else {
            Write-Error "Failed to upload backup to S3"
            exit 1
        }
    } else {
        Write-Error "AWS CLI not found. Please install AWS CLI and configure credentials."
        exit 1
    }
}

# Validate backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Error "Backup file not found: $BackupFile"
    exit 1
}

# Execute requested action
switch ($Action) {
    "encrypt" {
        if (-not $Password) {
            $SecurePassword = Read-Host "Enter encryption password" -AsSecureString
            $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
        }
        Encrypt-Backup -InputFile $BackupFile -OutputFile $OutputFile -Password $Password
    }
    
    "decrypt" {
        if (-not $Password) {
            $SecurePassword = Read-Host "Enter decryption password" -AsSecureString
            $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
        }
        Decrypt-Backup -InputFile $BackupFile -OutputFile $OutputFile -Password $Password
    }
    
    "upload" {
        if (-not $S3Bucket) {
            $S3Bucket = Read-Host "Enter S3 bucket name"
        }
        Upload-ToS3 -BackupFile $BackupFile -S3Bucket $S3Bucket
    }
}

Write-Host "Operation completed successfully!"
