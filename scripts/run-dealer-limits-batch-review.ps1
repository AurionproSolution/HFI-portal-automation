$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot\..

$env:TEST_ENV = "dev"
$env:HEADLESS = "true"
$env:OEM_LOGIN_URL = "http://devdealerportal.centralindia.cloudapp.azure.com/oem/login"

if (-not $env:OEM_MAKER_USERNAME -or -not $env:OEM_MAKER_PASSWORD) {
  Write-Error "Set OEM_MAKER_USERNAME and OEM_MAKER_PASSWORD before running this script."
  exit 1
}

$log = "reports\dealer-limits-tc-batch-review-run.log"
New-Item -ItemType Directory -Force -Path "reports" | Out-Null
"" | Set-Content $log

$tcs = @(
  "TC-007","TC-008","TC-009","TC-010","TC-011","TC-012","TC-013","TC-014","TC-015",
  "TC-017","TC-019","TC-020","TC-021","TC-027","TC-028","TC-029","TC-030","TC-031",
  "TC-032","TC-033","TC-034"
)

foreach ($tc in $tcs) {
  Add-Content $log "===== $tc ====="
  npx playwright test tests/oem-portal/Regression/Sprint2/DealerLimitsRegression.test.ts `
    --project=oem-dealer-limits-chromium --workers=1 --grep $tc 2>&1 | Tee-Object -FilePath $log -Append
}

$env:OEM_FORCE_LMS_FAILURE = "true"
foreach ($tc in @("TC-020", "TC-021")) {
  Add-Content $log "===== $tc (OEM_FORCE_LMS_FAILURE=true) ====="
  npx playwright test tests/oem-portal/Regression/Sprint2/DealerLimitsRegression.test.ts `
    --project=oem-dealer-limits-chromium --workers=1 --grep $tc 2>&1 | Tee-Object -FilePath $log -Append
}
