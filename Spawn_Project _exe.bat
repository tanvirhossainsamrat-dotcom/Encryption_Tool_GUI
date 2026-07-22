@echo off
title Encryption Tool Downloader
:: Set entire console font color to Cyan on a Black background
color 0B

:menu
cls
echo ========================================================================================================================
echo.
echo               ########    ########  ##      ##  ##    ##  ##         #########   #######   ########
echo               ##      ##  ##    ##  ##      ##  ###   ##  ##         ##     ##  ##     ##  ##     ##
echo               ##      ### ##    ##  ##      ##  ####  ##  ##         ##     ##  ##     ##  ##     ###
echo               ##      ### ##    ##  ##  ##  ##  ## ## ##  ##         ##     ##  #########  ##     ###
echo               ##      ### ##    ##  ## #### ##  ##  ####  ##         ##     ##  ##     ##  ##     ###
echo               ##      ##  ##    ##  ###    ###  ##   ###  ##         ##     ##  ##     ##  ##     ##
echo               ########    ########  ##      ##  ##    ##  ########   #########  ##     ##  ########                                                                                                        
echo.
echo ========================================================================================================================
echo.
echo                                               Encryption Tool
echo.
echo                                        Creators: Tanvir , Anis , Meraj
echo ========================================================================================================================
echo.
echo Do you want to download the Encryption Tool setup file now?
echo.

:choice
set /p "user_input=  Please enter (Y) yes or (N) no: "

:: Convert input mapping to support both single letters and full words
if /i "%user_input%"=="Y" goto download
if /i "%user_input%"=="Yes" goto download
if /i "%user_input%"=="N" goto exit_program
if /i "%user_input%"=="No" goto exit_program

:: Handle invalid input smoothly
echo.
echo  [Invalid selection] Please type Y or N.
echo.
goto choice

:download
echo.
echo  =========================================================================================
echo  Initializing download...
echo  Target: Message-Encryption-tool_setup.exe
echo  =========================================================================================
echo.

:: Downloads the file directly into the folder where this batch file is running using curl
curl -L -o "Message-Encryption-tool_setup.exe" "https://tanvir.mistbd.com/Home/Message-Encryption-tool_setup.exe"

if %errorlevel% equ 0 (
    echo.
    echo  =========================================================================================
    echo  SUCCESS: Download complete!
    echo  The file 'Message-Encryption-tool_setup.exe' is saved in this folder.
    echo  =========================================================================================
) else (
    echo.
    echo  =========================================================================================
    echo  ERROR: Download failed. Check your internet connection or URL.
    echo  =========================================================================================
)
echo.
pause
exit

:exit_program
echo.
echo  Exiting program. No files were downloaded.
timeout /t 3 >nul
exit
