# SelfPrint Connector - User Startup Shortcut Installer
# Adds connector to Windows Startup folder for automatic silent launch on login

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectDir = Split-Path -Parent $ScriptDir
$VbsPath = Join-Path $ScriptDir "run-silent.vbs"
$StartupDir = [System.Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupDir "SelfPrintConnector.lnk"

Write-Host "Creating startup shortcut in: $StartupDir" -ForegroundColor Cyan

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = "$ProjectDir"
$Shortcut.Description = "SelfPrint Connector Background Bridge"
$Shortcut.WindowStyle = 7 # Minimized/Hidden
$Shortcut.Save()

Write-Host "Startup shortcut created successfully: $ShortcutPath" -ForegroundColor Green
