param(
    [Parameter(Mandatory=$true)]
    [string]$msg,
    
    [Parameter(Mandatory=$false)]
    [string]$branch = $(git branch --show-current)
)

# 1. Quick Syntax Check (Optional but recommended)
# This ensures you aren't pushing a file with a glaring error
if (Test-Path ./firestore.rules) {
    $testRules = Get-Content ./firestore.rules
    if ($testRules -match "service cloud.firestore") {
        Write-Host "--- Firestore rules file looks healthy ---" -ForegroundColor Green
    } else {
        Write-Host "!!! Warning: firestore.rules looks corrupted or empty!" -ForegroundColor Red
        $continue = Read-Host "Push anyway? (y/n)"
        if ($continue -ne "y") { return }
    }
}

# 2. Summary
Write-Host "`n--- GIT PUSH SUMMARY ---" -ForegroundColor Gray
Write-Host "Message: $msg"
Write-Host "Branch:  $branch"
Write-Host "------------------------"

# 3. Double Confirmation for Main
if ($branch -eq "main") {
    Write-Host "!!! WARNING: You are pushing to the MAIN branch !!!" -ForegroundColor Magenta
    $confirm = Read-Host "Type 'YES' to confirm"
    if ($confirm -ne "YES") {
        Write-Host "Push cancelled." -ForegroundColor Yellow
        return
    }
} else {
    Write-Host "Press [ENTER] to push, or [CTRL+C] to cancel..." -ForegroundColor Yellow
    $null = Read-Host
}

# 4. Git Commands
Write-Host ">>> Executing Git commands..." -ForegroundColor Gray
git add .
git commit -m "$msg"
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n*** SUCCESS: Pushed to $branch ***" -ForegroundColor Green
} else {
    Write-Host "`n!!! Git push failed." -ForegroundColor Red
}