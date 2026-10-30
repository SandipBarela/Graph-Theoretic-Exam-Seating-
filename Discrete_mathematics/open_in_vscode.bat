@echo off
title Open Project in VS Code
echo Opening discrete_mathematics in Visual Studio Code...
code "%~dp0"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Could not find 'code' command in PATH.
    echo Please open Visual Studio Code manually and click:
    echo File -^> Open Folder -^> Select 'C:\Users\OM\Desktop\discrete_mathematics'
    echo.
    pause
)
