@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
set PORT=4500

set SCRIPT_DIR=%~dp0

if exist "%SCRIPT_DIR%..\..\SelfPrint Connector.exe" (
    "%SCRIPT_DIR%..\..\SelfPrint Connector.exe" "%SCRIPT_DIR%..\dist\app.js"
) else if exist "%SCRIPT_DIR%..\..\..\SelfPrint Connector.exe" (
    "%SCRIPT_DIR%..\..\..\SelfPrint Connector.exe" "%SCRIPT_DIR%..\dist\app.js"
) else (
    node "%SCRIPT_DIR%..\dist\app.js"
)
endlocal
