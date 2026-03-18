$ErrorActionPreference = "Continue"

Write-Host "Setting up Git repository..."

if (-not (Test-Path ".git")) {
    git init
}

git config user.name "lollzsec23423"
git config user.email "pwnsec123@gmail.com"

$remotes = git remote
if ($remotes -contains "origin") {
    git remote remove origin
}
git remote add origin https://github.com/lollzsec23423/hostel-management-system.git

git add .
$statusStr = git status --porcelain | Out-String

$hasCommits = $true
$null = git log -1 --oneline 2>&1
if ($LASTEXITCODE -ne 0) {
    $hasCommits = $false
}

if ($statusStr.Trim().Length -gt 0 -or -not $hasCommits) {
    git commit -m "Initial commit"
}
else {
    Write-Host "No changes to commit."
}

git branch -M main

# Try pushing
git push -u origin main
$pushExitCode = $LASTEXITCODE

# If push fails, pull and try again
if ($pushExitCode -ne 0) {
    Write-Host "Push failed, pulling from remote with allow-unrelated-histories..."
    git pull origin main --allow-unrelated-histories --no-rebase --no-edit | Out-Null
    git push -u origin main
    $pushExitCode = $LASTEXITCODE
}

Write-Host "`n--- Final Output ---"
if ($pushExitCode -eq 0) {
    Write-Host "Confirm successful push: YES"
}
else {
    Write-Host "Confirm successful push: FAILED"
}

$branch = git branch --show-current
Write-Host "Current branch: $branch"

$remoteUrl = git remote get-url origin
Write-Host "Remote repository URL: $remoteUrl"
