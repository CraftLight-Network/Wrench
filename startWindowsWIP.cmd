@echo off
Setlocal EnableDelayedExpansion

:start
title WrenchBot Launcher
cd "%~dp0"
color 0F

cls
call :resetErrorLevel
echo.
echo WrenchBot Launcher
echo.
echo What would you like to do?
echo 1. Install - Install everything the bot needs to run.
echo 2. Update  - Update the bot's files. Choco, Bot, etc.
echo 3. Options - Change options for the bot and launcher.
echo 4. Launch  - Runs the bot. Auto-(re)start in options.
echo 5. Exit    - Exit this launcher GUI.  Closes  window.
echo.
echo Select: 1 / 2 / 3 / 4 / 5
choice /C 12345 /N 
if %errorlevel% equ 1 goto install
if %errorlevel% equ 2 goto update
if %errorlevel% equ 3 goto options
if %errorlevel% equ 4 goto launch
if %errorlevel% equ 5 exit



:install
cls
call :resetErrorLevel
net.exe session 1>NUL 2>NUL || (goto noAdmin)

title WrenchBot Installer
echo.
echo WrenchBot Installer
echo.
echo Order of Installation:
echo 1. Chocolatey   - Program that makes installation easy.
echo 2. Git          - Program that grabs files from GitHub.
echo 3. Node.js      - The thing that actually runs the bot.
echo 4. Dependencies - Stuff the bot needs to run correctly.
echo 5. Updates      - Update everything JIC. Bot, NPM, etc.
echo 6. Auth setup   - Fill out the auth file with your key.
echo.
echo Would you like to start the operation? Y / N
choice /C yn /N
if %errorlevel% equ 1 goto startInstall
if %errorlevel% equ 2 goto start

:startInstall
mkdir .\data\launcherConfig > nul

cls
call :resetErrorLevel

title WrenchBot Installer (Chocolatey)
echo.
echo WrenchBot Installer
echo.
echo Installing Chocolatey...
echo.
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Installer (Git)
echo.
echo WrenchBot Installer
echo.
echo Installing Git...
echo.
choco install git -y --force
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Installer (Node.js)
echo.
echo WrenchBot Installer
echo.
echo Installing Node.js...
echo.
choco install nodejs -y --force
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Installer (Dependencies)
echo.
echo WrenchBot Installer
echo.
echo Installing Dependencies...
echo.
choco install python2 -y --force
call npm install --global windows-build-tools@latest --vs2015
call npm install
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Installer (Updates)
echo.
echo WrenchBot Installer
echo.
echo Installing Updates...
echo.
choco upgrade all -y
git init
git remote add origin https://github.com/Edude42/WrenchBot.git
git fetch --all
git checkout -b master --track origin/master
call npm update
call npm update -g
call npm install
echo.
echo Done! Moving on...
echo.

:auth
cls
call :resetErrorLevel
title WrenchBot Installer (Auth Setup)
echo.
echo WrenchBot Installer
echo.
echo Setting up auth file...
echo.
echo Please enter your Bot's token from https://discordapp.com/developers
set /P "token=Discord Bot Token: "
echo.
echo Would you like to set a Yandex API key? Y / N 
choice /C yn /N
if %errorlevel% equ 1 goto yandex
if %errorlevel% equ 2 call :resetErrorLevel

:askGoogle
echo Would you like to set a Google API key? Y / N 
choice /C yn /N
if %errorlevel% equ 1 goto google
if %errorlevel% equ 2 goto finished

:yandex
echo Please enter your Yandex.Translate API key from https://tech.yandex.com/translate/
set /P "yandex=Yandex.Translate API key: "
goto askGoogle

:google
echo Please enter your Google API key from https://console.developers.google.com/apis/dashboard
set /P "google=Google API key: "
goto finished

:finished
(
	echo {
	echo     "token": "%token%",
	echo     "yandex": "%yandex%",
	echo     "google": "%google%",
	echo }
)>"auth.json"

pause
echo.
echo Done! Going back to menu...
echo.
ping 127.0.0.1 -n 2 > nul
goto start



:update
cls
call :resetErrorLevel
if not exist node_modules goto runInstall
if not exist .\data\launcherConfig goto runInstall
net.exe session 1>NUL 2>NUL || (goto noAdmin)

title WrenchBot Updater
echo.
echo WrenchBot Updater
echo.
echo Order of Updates:
echo 1. Chocolatey   - Update all Choco applications.
echo 2. Bot          - Grab the latest code from Git.
echo 3. NPM          - Update to the latest NPM mods.
echo.
echo Would you like to start the operation? Y / N
choice /C yn /N
if %errorlevel% equ 1 goto startUpdate
if %errorlevel% equ 2 goto start

:startUpdate
cls
call :resetErrorLevel
title WrenchBot Updater (Chocolatey)
echo.
echo WrenchBot Updater
echo.
echo Updating Chocolatey packages...
echo.
choco upgrade all -y
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Updater (Bot)
echo.
echo WrenchBot Updater
echo.
echo Updating WrenchBot...
echo.
git init
git remote add origin https://github.com/Edude42/WrenchBot.git
git fetch --all
git checkout -b master --track origin/master
echo.
echo Done! Moving on...
echo.

cls
call :resetErrorLevel
title WrenchBot Updater (NPM)
echo.
echo WrenchBot Updater
echo.
echo Updating NPM modules...
echo.
call npm update
call npm update -g
call npm install
echo.
echo Done! Going back to menu...
echo.
ping 127.0.0.1 -n 2 > nul
goto start



:options
cls
call :resetErrorLevel
if not exist node_modules goto runInstall
if not exist .\data\launcherConfig goto runInstall

title WrenchBot Options
echo.
echo WrenchBot Options
echo.
echo Select an option:
echo 1. Auto-start   - Skip the launcher     (Delete data/config/autostart to disable)
echo 2. Auto-restart - Automatically restart the bot if it crashes or an error occurs.
echo 3. Auth setup   - Change the Discord Bot token, Yandex and Google key,  and more.
echo 4. Back         - Exit this GUI.  Returns back to the launcher GUI you came from.
echo.
echo Select: 1 / 2 / 3 / 4
choice /C 1234 /N 
if %errorlevel% equ 1 goto autoStart
if %errorlevel% equ 2 goto autoRestart
if %errorlevel% equ 3 goto auth
if %errorlevel% equ 4 goto start

:autoStart
if exist .\data\launcherConfig\autoStart (
	del .\data\launcherConfig\autoStart > nul
	echo.
	echo Auto-start Disabled
	echo.
) else (
	echo > .\data\launcherConfig\autoStart
	echo.
	echo Auto-start Enabled
	echo.
)
ping 127.0.0.1 -n 4 > nul
goto options

:autoRestart
if exist .\data\launcherConfig\autoRestart (
	del .\data\launcherConfig\autoRestart > nul
	echo.
	echo Auto-Restart Disabled
	echo.
) else (
	echo > .\data\launcherConfig\autoRestart
	echo.
	echo Auto-Restart Enabled
	echo.
)
ping 127.0.0.1 -n 4 > nul
goto options



:launch
cls
call node bot.js



:resetErrorLevel
exit /b 0

:runInstall
echo.
echo Please run the installer (1) before using this.
echo.
pause
goto start

:noAdmin
echo.
echo Please run this as administrator! Right click the file and press "Run as administrator"
echo.
pause
goto start