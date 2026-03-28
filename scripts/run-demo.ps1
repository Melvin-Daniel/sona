# One-click demo: install (if needed) and start dev server
Set-Location $PSScriptRoot\..
if (-not (Test-Path "node_modules")) {
  npm install
}
Write-Host "Open http://localhost:3000 — try seed words: படி, கல், ஆறு" -ForegroundColor Cyan
npm run dev
