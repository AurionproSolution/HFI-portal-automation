$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$env:TEST_ENV = "dev"
$env:ACTIVE_DEALER = "dealer2"
$env:HEADLESS = "true"

$testFile = "tests/hfi-portal/Regression/Sprint2/PurchaseOrdersVINsRegression.test.ts"
$project = "purchase-orders-vins-chromium"
$passed = @(
  "TC-001", "TC-007", "TC-008", "TC-009", "TC-012", "TC-014",
  "TC-019", "TC-020", "TC-021", "TC-024", "TC-040", "TC-041",
  "TC-044", "TC-045", "TC-046", "TC-048"
)

$all = 1..50 | ForEach-Object { "TC-{0:D3}" -f $_ }
$toRun = $all | Where-Object { $passed -notcontains $_ }

$grepPattern = ($toRun -join "|")
Write-Host "Running $($toRun.Count) non-passed tests: $($toRun -join ', ')"

$playwrightCli = Join-Path $PSScriptRoot "..\node_modules\@playwright\test\cli.js"
$args = @(
  $playwrightCli,
  "test",
  $testFile,
  "--project=$project",
  "--workers=1",
  "--grep=$grepPattern",
  "--reporter=list"
)
& node @args
