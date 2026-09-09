' SelfPrint Connector - Silent Background Launcher
' Starts the Node.js connector daemon with NO terminal window.

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectDir = fso.GetParentFolderName(scriptDir)
appPath = fso.BuildPath(projectDir, "dist\app.js")

cmd = "node """ & appPath & """"
WshShell.CurrentDirectory = projectDir
WshShell.Run cmd, 0, False
