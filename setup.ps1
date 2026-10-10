#!/usr/bin/env pwsh
Write-Host "Running setup: installing dependencies for root and FreshAIWebApp"
npm install
npm --prefix FreshAIWebApp install
Write-Host "Setup complete. Run 'npm run dev' or 'npm run dev:all' to start servers."
