# SelfPrint Connector - Windows Service Installer
# Requires Administrator privileges

$ServiceName = "SelfPrintConnector"
$DisplayName = "SelfPrint Hardware Bridge Service"
$Description = "Local Hardware Bridge bridging physical Windows printers with the SelfPrint Cloud Platform."
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodePath) {
    Write-Error "Node.js is not found in PATH. Please install Node.js before installing service."
    exit 1
}

$AppPath = Join-Path $ProjectDir "dist\app.js"

if (-not (Test-Path $AppPath)) {
    Write-Host "Building project first..." -ForegroundColor Cyan
    Push-Location $ProjectDir
    npm run build
    Pop-Location
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Installing $DisplayName" -ForegroundColor Green
Write-Host "Project Directory: $ProjectDir" -ForegroundColor Gray
Write-Host "Node Path:         $NodePath" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Green

# Check if NSSM exists, otherwise fallback to sc.exe / registry or Task Scheduler / Service
$NssmPath = Join-Path $ScriptDir "nssm.exe"

if (Test-Path $NssmPath) {
    & $NssmPath stop $ServiceName 2>$null
    & $NssmPath remove $ServiceName confirm 2>$null
    & $NssmPath install $ServiceName "$NodePath" "$AppPath"
    & $NssmPath set $ServiceName AppDirectory "$ProjectDir"
    & $NssmPath set $ServiceName DisplayName "$DisplayName"
    & $NssmPath set $ServiceName Description "$Description"
    & $NssmPath set $ServiceName Start SERVICE_AUTO_START
    & $NssmPath set $ServiceName AppRestartDelay 5000
    & $NssmPath start $ServiceName
} else {
    # Native Windows Service wrapper via sc.exe & Win32 Service Controller or Task Scheduler (runs as NT AUTHORITY\SYSTEM on boot)
    Write-Host "Registering Windows Background Startup Service..." -ForegroundColor Cyan
    $Action = New-ScheduledTaskAction -Execute "$NodePath" -Argument "`"$AppPath`"" -WorkingDirectory "$ProjectDir"
    $Trigger = New-ScheduledTaskTrigger -AtStartup
    $Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)
    
    Unregister-ScheduledTask -TaskName "$ServiceName" -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName "$ServiceName" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "$Description"
    Start-ScheduledTask -TaskName "$ServiceName"
}

Write-Host "Service $ServiceName installed and started successfully!" -ForegroundColor Green
