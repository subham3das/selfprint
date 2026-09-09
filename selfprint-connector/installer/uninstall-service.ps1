# SelfPrint Connector - Windows Service Uninstaller
# Requires Administrator privileges

$ServiceName = "SelfPrintConnector"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$NssmPath = Join-Path $ScriptDir "nssm.exe"

Write-Host "Stopping and removing $ServiceName..." -ForegroundColor Yellow

if (Test-Path $NssmPath) {
    & $NssmPath stop $ServiceName 2>$null
    & $NssmPath remove $ServiceName confirm 2>$null
}

Unregister-ScheduledTask -TaskName "$ServiceName" -Confirm:$false -ErrorAction SilentlyContinue

Write-Host "Service $ServiceName removed successfully." -ForegroundColor Green
