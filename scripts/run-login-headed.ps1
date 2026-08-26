# Run login regression in visible Chromium (PowerShell)
Set-Location $PSScriptRoot\..

if (-not (Test-Path "node_modules\@playwright\test")) {
  Write-Host "Installing npm dependencies..."
  npm install
}

if (-not (Test-Path ".env")) {
  Write-Host "Creating .env from .env.example..."
  Copy-Item ".env.example" ".env"
}

$env:HEADLESS = "false"
$env:SLOW_MO = "300"

npx playwright test tests/hfi-portal/Regression/Sprint1/LoginRegression.test.ts `
  --project=login-chromium `
  --workers=1 `
  --headed
