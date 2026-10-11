<#
Apply Space4all project files into the repo root by copying the contents
of the space4all/ folder over the repository root. This script creates a
local backup branch, copies files (overwriting), runs an install + build,
and commits the changes locally. It does NOT push to origin by default.

USAGE (PowerShell, run from repository root):
  .\apply_space4all.ps1

CAUTION: This will overwrite files in your repo root with files from
the space4all directory. A local backup branch will be created before
making changes.
#>

Set-StrictMode -Version Latest

function Fail($msg) {
	Write-Error $msg
	exit 1
}

if (-not (Test-Path "space4all")) {
	Fail "space4all folder not found in this directory. Run this script from the repository root."
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
	Fail "git is not installed or not on PATH. Install Git and re-run."
}

$ts = Get-Date -Format yyyyMMddHHmmss

Write-Host "Creating local backup branch 'backup-space4all-$ts' from current branch..." -ForegroundColor Cyan
git fetch origin
$current = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $current) { Fail "Could not determine current git branch." }
git branch "backup-space4all-$ts"

Write-Host "Copying files from space4all/ into repository root (overwriting existing files)..." -ForegroundColor Cyan

# Use robocopy on Windows for robust copy; fallback to Copy-Item if unavailable
if (Get-Command robocopy -ErrorAction SilentlyContinue) {
	# Mirror files but do NOT delete destination files that aren't in source
	$src = "space4all"
	$dst = "."
	# Exclude any .git folders inside the source
	robocopy $src $dst /E /COPYALL /R:3 /W:1 /NFL /NDL | Out-Null
} else {
	# Generic copy using PowerShell; overwrite existing files
	Get-ChildItem -Path "space4all" -Recurse -Force | ForEach-Object {
		$rel = $_.FullName.Substring((Get-Item .\space4all).FullName.Length).TrimStart('\','/')
		$dest = Join-Path -Path (Get-Location) -ChildPath $rel
		if ($_.PSIsContainer) {
			if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
		} else {
			Copy-Item -Path $_.FullName -Destination $dest -Force
		}
	}
}

Write-Host "Install dependencies (npm install)..." -ForegroundColor Cyan
if (Get-Command npm -ErrorAction SilentlyContinue) {
	npm install
} else {
	Write-Warning "npm not found on PATH — skipping npm install. Run 'npm install' manually."
}

Write-Host "Run build (npm run build) to verify the project builds..." -ForegroundColor Cyan
$buildOk = $true
if (Get-Command npm -ErrorAction SilentlyContinue) {
	$res = npm run build 2>&1
	if ($LASTEXITCODE -ne 0) {
		Write-Error "Build failed. See output above."
		$buildOk = $false
	}
} else {
	Write-Warning "npm not found — cannot run build."
	$buildOk = $false
}

Write-Host "Staging changes and committing to local branch..." -ForegroundColor Cyan
git add -A
try {
	git commit -m "Apply Space4all: sync files into repo root (backup: backup-space4all-$ts)" | Out-Null
} catch {
	Write-Warning "No changes to commit or commit failed. You can run 'git status' to inspect." 
}

Write-Host "Done. A local backup branch 'backup-space4all-$ts' was created. The repository files were updated with space4all contents." -ForegroundColor Green
if ($buildOk) { Write-Host "Build succeeded." -ForegroundColor Green } else { Write-Warning "Build did not complete successfully. Inspect output and fix issues before deploying." }

$pushAnswer = Read-Host "Do you want to push the committed changes to origin/main now? (y/N)"
if ($pushAnswer -eq 'y' -or $pushAnswer -eq 'Y') {
	Write-Host "Pushing changes to origin/main..." -ForegroundColor Cyan
	try {
		git push origin HEAD:main
		Write-Host "Push completed successfully." -ForegroundColor Green
	} catch {
		Write-Error "Push failed. You may need to authenticate or resolve remote conflicts. Run 'git status' and 'git pull' as needed, then try 'git push origin HEAD:main' manually."
	}
} else {
	Write-Host "Push skipped. You can push manually with: git push origin HEAD:main" -ForegroundColor Yellow
}

