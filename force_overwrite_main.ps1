<#
Force-overwrite origin/main with your local main branch.

Warning: This rewrites remote history. The script creates a timestamped remote backup branch before forcing the push.

Usage: run from the repository root in PowerShell:
  .\force_overwrite_main.ps1

#>
try {
	Write-Host "Starting force-overwrite of origin/main" -ForegroundColor Cyan

	# Ensure git is available
	if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
		Write-Error "Git is not installed or not on PATH. Install Git and re-run."
		exit 1
	}

	# Ensure we're in a git repository
	if (-not (Test-Path .git)) {
		Write-Error "Current directory does not appear to be a git repository (no .git folder). cd to repository root and re-run."
		exit 1
	}

	git fetch origin

	# Switch to main
	Write-Host "Checking out main..."
	git checkout main

	Write-Host "Pulling latest origin/main..."
	git pull origin main

	# Check working directory clean
	$status = git status --porcelain
	if ($status) {
		Write-Warning "Working tree is not clean. Please commit or stash changes before running this script."
		Write-Host "Uncommitted changes:" -ForegroundColor Yellow
		git status --porcelain
		$ans = Read-Host "Continue anyway and ignore local uncommitted changes? (y/N)"
		if ($ans -ne 'y' -and $ans -ne 'Y') {
			Write-Host "Aborting. Commit/stash changes and re-run." -ForegroundColor Yellow
			exit 1
		}
	}

	# Create timestamped backup branch locally and push it to origin
	$ts = Get-Date -Format yyyyMMddHHmmss
	$backup = "backup-main-$ts"
	Write-Host "Creating local backup branch: $backup"
	git branch $backup
	Write-Host "Pushing backup branch to origin: refs/heads/$backup"
	git push origin $backup

	Write-Host "Recent commits on local main:" -ForegroundColor Cyan
	git log --oneline -n 10

	$confirm = Read-Host "Force-push local main to origin/main and overwrite remote history? This is destructive. Type 'FORCE' to proceed"
	if ($confirm -ne 'FORCE') {
		Write-Host "Confirmation not received. Aborting." -ForegroundColor Yellow
		exit 1
	}

	Write-Host "Force-pushing local main to origin/main..." -ForegroundColor Red
	git push --force origin main

	Write-Host "Force-push complete. Remote origin/main now matches your local main." -ForegroundColor Green
	Write-Host "A backup of the previous origin/main is available as origin/$backup" -ForegroundColor Green
	exit 0
}
catch {
	Write-Error "An error occurred: $_"
	exit 1
}
