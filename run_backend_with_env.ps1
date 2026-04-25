# This script loads .env and starts the backend
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^(?<name>[^#\s]+)=(?<value>.*)$') {
            $name = $Matches['name'].Trim()
            $value = $Matches['value'].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Loaded variable: $name" -ForegroundColor Gray
        }
    }
} else {
    Write-Host ".env file not found. Using system environment variables." -ForegroundColor Yellow
}

powershell -ExecutionPolicy Bypass -File auto_setup_maven.ps1
