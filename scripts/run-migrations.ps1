# Run Prisma migrations (Windows PowerShell)
$ErrorActionPreference = 'Stop'
Write-Host 'Applying Prisma migrations...'
$npx = (Get-Command npx -ErrorAction SilentlyContinue)
if (-not $npx) { throw 'npx not found. Please install Node.js which includes npx.' }

npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { throw 'Prisma migrate deploy failed.' }

Write-Host 'Migrations applied successfully.'
