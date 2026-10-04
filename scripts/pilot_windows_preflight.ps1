$ErrorActionPreference = 'Stop'
Write-Host 'Magra School Management - Pilot Preflight' -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }

Write-Host "Node: $(node --version)"
Write-Host "npm : $(npm --version)"

if (-not (Test-Path '.\backend\.env')) {
  Write-Warning 'backend/.env not found. Copy backend/.env.pilot.example to backend/.env and fill DATABASE_URL/JWT_SECRET/CORS_ORIGIN.'
} else {
  Write-Host 'backend/.env found.' -ForegroundColor Green
}

Write-Host 'Installing backend dependencies...'
Push-Location backend
npm ci
node --check src/server.js
Pop-Location

Write-Host 'Installing frontend dependencies...'
Push-Location frontend
npm ci
npm run build
Pop-Location

Write-Host 'Running static acceptance/security checks...'
node scripts/qa_v117_acceptance.mjs
node scripts/security_audit_v74.mjs
node scripts/release_gate_v117.mjs

Write-Host ''
Write-Host 'Next: with a disposable Pilot PostgreSQL/Supabase DATABASE_URL configured, run:' -ForegroundColor Yellow
Write-Host '  node scripts/preflight_pilot.mjs'
Write-Host '  node scripts/pilot_verify.mjs'
Write-Host 'Then start backend and frontend for browser acceptance.'
