Set-Location "$PSScriptRoot\.."
if (!(Test-Path "apps\frontend\.env")) { Copy-Item "apps\frontend\.env.example" "apps\frontend\.env" }
npm run dev:frontend
