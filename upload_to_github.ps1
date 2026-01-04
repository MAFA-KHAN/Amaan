# AMAAN - GitHub Upload Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AMAAN - GitHub Upload Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/6] Initializing Git repository..." -ForegroundColor Green
git init

Write-Host ""
Write-Host "[2/6] Adding all files..." -ForegroundColor Green
git add .

Write-Host ""
Write-Host "[3/6] Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit: AMAAN - Location Intelligence & Safety Navigation for Islamabad"

Write-Host ""
Write-Host "[4/6] Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/MAFA-KHAN/Amaan.git

Write-Host ""
Write-Host "[5/6] Setting main branch..." -ForegroundColor Green
git branch -M main

Write-Host ""
Write-Host "[6/6] Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Repository uploaded to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View your repository at:" -ForegroundColor Yellow
Write-Host "https://github.com/MAFA-KHAN/Amaan" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
