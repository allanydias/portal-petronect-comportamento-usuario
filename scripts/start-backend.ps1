Set-Location "$PSScriptRoot\.."
if (!(Test-Path "apps\backend\.env")) { Copy-Item "apps\backend\.env.example" "apps\backend\.env" }
npm run dev:backend
