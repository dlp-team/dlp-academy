param(
    [Parameter(Mandatory=$true)]
    [string]$msg,
    
    [Parameter(Mandatory=$false)]
    [string]$branch = $(git branch --show-current)
)

# 1. Local Validation
Write-Host "--- Validating Firestore rules ---" -ForegroundColor Cyan
firebase firestore:rules:check 2>$null 

$testRules = Get-Content ./firestore.rules
if ($testRules -match "service cloud.firestore") {
    Write-Host "Basic syntax looks okay." -ForegroundColor Green
} else {
    Write-Host "!!! Critical Error: firestore.rules seems corrupted!" -ForegroundColor Red
    return
}


# 2. Preparation Summary
Write-Host "`n--- DEPLOYMENT SUMMARY ---" -ForegroundColor Gray
Write-Host "Message: $msg"
Write-Host "Branch:  $branch"
Write-Host "--------------------------"

# 3. Double Confirmation for Main Branch
if ($branch -eq "main") {
    Write-Host "!!! WARNING: You are deploying to the     MAIN     branch !!!" -ForegroundColor Magenta
    $confirm = Read-Host "Type   'YES'   to confirm production deployment"
    if ($confirm -ne "YES") {
        Write-Host "Deployment cancelled by user." -ForegroundColor Yellow
        return
    }
} else {
    # Single confirmation for other branches
    Write-Host "Press [ENTER] to confirm, or [CTRL+C] to cancel..." -ForegroundColor Yellow
    $null = Read-Host
}

# 4. Git Commands
Write-Host ">>> Pushing to Git..." -ForegroundColor Gray
git add .
git commit -m "$msg"
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "!!! Git push failed. Deployment aborted." -ForegroundColor Red
    return
}

# 5. Firebase Deployment
Write-Host ">>> Deploying to Firestore..." -ForegroundColor Cyan

$deployOutput = firebase deploy --only firestore:rules
$deployOutput # This prints the actual Firebase result to your screen

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n*** SUCCESS: Rules are live! ***" -ForegroundColor Green
} else {
    Write-Host "`n!!! Deployment failed. Did you manually change rules in the console? !!!" -ForegroundColor Red
}