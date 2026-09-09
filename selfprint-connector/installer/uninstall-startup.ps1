# SelfPrint Connector - User Startup Shortcut Uninstaller

$StartupDir = [System.Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupDir "SelfPrintConnector.lnk"

if (Test-Path $ShortcutPath) {
    Remove-Item -Path $ShortcutPath -Force
    Write-Host "Startup shortcut removed successfully: $ShortcutPath" -ForegroundColor Green
} else {
    Write-Host "Startup shortcut was not found." -ForegroundColor Yellow
}
