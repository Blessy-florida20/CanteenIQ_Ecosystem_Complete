# PowerShell Setup Script for CanteenIQ Ecosystem (Windows)
# Run this once to install all dependencies.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CanteenIQ Ecosystem - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent

# --- 1. Verify Python ---
Write-Host "[1/6] Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not found. Install Python 3.10+ from https://python.org" -ForegroundColor Red
    exit 1
}
Write-Host "  Python: $pythonVersion" -ForegroundColor Green

# --- 2. Verify Node.js ---
Write-Host "[2/6] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# --- 3. Install Python Backend Dependencies ---
Write-Host "[3/6] Installing Python backend dependencies..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pip install failed. Check requirements.txt and Python environment." -ForegroundColor Red
    exit 1
}
Write-Host "  Backend dependencies installed." -ForegroundColor Green

# --- 4. Generate Synthetic Datasets ---
Write-Host "[4/6] Generating synthetic canteen datasets..." -ForegroundColor Yellow
Set-Location $ProjectRoot
python scripts/generate_data.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Data generation failed. You can retry with: python scripts/generate_data.py" -ForegroundColor Yellow
} else {
    Write-Host "  Synthetic data generated successfully." -ForegroundColor Green
}

# --- 5. Install Frontend Node Modules ---
Write-Host "[5/6] Installing frontend npm packages..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed." -ForegroundColor Red
    exit 1
}
Write-Host "  Frontend packages installed." -ForegroundColor Green

# --- 6. Build Frontend ---
Write-Host "[6/6] Building frontend production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Frontend build failed. Check TypeScript errors." -ForegroundColor Yellow
} else {
    Write-Host "  Frontend built successfully." -ForegroundColor Green
}

Set-Location $ProjectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the app:" -ForegroundColor White
Write-Host "  .\scripts\run_all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then open:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
