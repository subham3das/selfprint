; SelfPrint Connector - NSIS Custom Install & Uninstall Hooks
; Automatically registers the background Windows service and starts it upon installation

!macro customInstall
  DetailPrint "Configuring SelfPrint Background Host Service..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\host-service\installer\install-service.ps1"'
!macroend

!macro customUnInstall
  DetailPrint "Stopping and unregistering SelfPrint Background Host Service..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\host-service\installer\uninstall-service.ps1"'
!macroend
