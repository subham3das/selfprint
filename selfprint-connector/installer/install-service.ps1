# SelfPrint Connector - Windows Service Installer
# Requires Administrator privileges

$ServiceName = "SelfPrintConnector"
$DisplayName = "SelfPrint Hardware Bridge Service"
$Description = "Local Hardware Bridge bridging physical Windows printers with the SelfPrint Cloud Platform."
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
$RunCmd = Join-Path $ScriptDir "run-daemon.cmd"
$BundledExe = Join-Path (Split-Path (Split-Path $ProjectDir -Parent) -Parent) "SelfPrint Connector.exe"

$AppPath = Join-Path $ProjectDir "dist\app.js"

if (-not $NodePath -and (Test-Path $BundledExe)) {
    Write-Host "Using bundled SelfPrint Electron Node runtime: $BundledExe" -ForegroundColor Cyan
} elseif (-not $NodePath -and -not (Test-Path $RunCmd)) {
    Write-Error "Neither Node.js nor bundled SelfPrint runtime found. Cannot install service."
    exit 1
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "Installing $DisplayName" -ForegroundColor Green
Write-Host "Project Directory: $ProjectDir" -ForegroundColor Gray
Write-Host "Script Directory:  $ScriptDir" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Green

# Check if NSSM exists, otherwise fallback to Task Scheduler (runs on boot)
$NssmPath = Join-Path $ScriptDir "nssm.exe"

if (Test-Path $NssmPath) {
    & $NssmPath stop $ServiceName 2>$null
    & $NssmPath remove $ServiceName confirm 2>$null
    if ($NodePath) {
        & $NssmPath install $ServiceName "$NodePath" "$AppPath"
    } else {
        & $NssmPath install $ServiceName "cmd.exe" "/c `"$RunCmd`""
    }
    & $NssmPath set $ServiceName AppDirectory "$ProjectDir"
    & $NssmPath set $ServiceName DisplayName "$DisplayName"
    & $NssmPath set $ServiceName Description "$Description"
    & $NssmPath set $ServiceName Start SERVICE_AUTO_START
    & $NssmPath set $ServiceName AppRestartDelay 5000
    & $NssmPath start $ServiceName
} else {
    Write-Host "Registering Windows Background Startup Service..." -ForegroundColor Cyan
    if (Test-Path $RunCmd) {
        $Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$RunCmd`"" -WorkingDirectory "$ProjectDir"
    } elseif ($NodePath) {
        $Action = New-ScheduledTaskAction -Execute "$NodePath" -Argument "`"$AppPath`"" -WorkingDirectory "$ProjectDir"
    } else {
        $Action = New-ScheduledTaskAction -Execute "$BundledExe" -Argument "`"$AppPath`"" -WorkingDirectory "$ProjectDir"
    }

    $Trigger = New-ScheduledTaskTrigger -AtStartup
    $Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)
    
    Unregister-ScheduledTask -TaskName "$ServiceName" -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName "$ServiceName" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "$Description"
    Start-ScheduledTask -TaskName "$ServiceName"
}

Write-Host "Service $ServiceName installed and started successfully!" -ForegroundColor Green
