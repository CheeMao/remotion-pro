$env:PATH = [Environment]::GetEnvironmentVariable('PATH', 'User') + ';' + [Environment]::GetEnvironmentVariable('PATH', 'Machine')
Set-Location 'F:/My Apps/AI-remotion'
npm run tauri:build