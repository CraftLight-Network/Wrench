@echo off
title WrenchBot ^(Node.JS^)
set "repeat=n"
cd "%~dp0"

if not exist node_modules (
	cls
	echo.
	echo Installing NPM modules. Please wait...
	echo.
	call npm install --global --production windows-build-tools --vs2017 >logs\npm_log.log
	if errorlevel 1 (
		color 04
		del node_modules /f /s /q >nul
		rmdir /q /s node_modules >nul
		title WrenchBot ^(Node.JS^) ^[ERROR^]
		echo --------------------------------------------------------------
		echo.
		echo ERROR: BUILDTOOLS FAILED TO INSTALL
		echo You must not have admin rights.
		echo.
		echo To run this script as admin, right click it
		echo and click "Run as administrator"
		echo.
		echo !! You need admin rights to compile the modules !!
		pause
		exit
	)
	"C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe" --add microsoft.visualstudio.component.vc.140 ^ --passive --norestart --quiet
	call npm install >logs\npm_log.log
	echo.
	if errorlevel 1 (
		color 04
		del node_modules /f /s /q >nul
		rmdir /q /s node_modules >nul
		title WrenchBot ^(Node.JS^) ^[ERROR^]
		echo --------------------------------------------------------------
		echo.
		echo ERROR: NPM FAILED TO RUN
		echo You must not have Node.js installed.
		echo.
		echo To install N.JS and NPM, go to https://nodejs.org/en/download/
		echo and download the "Windows Installer"
		echo.
		echo !! You need Python and Microsoft Visual Studio with build tools v140 !!
		pause
		exit
	)
	cls
	echo Done! Moving on...
	title WrenchBot ^(Node.JS^)
	goto startbot
)

if not exist auth.json (
	color 04
	title WrenchBot ^(Node.JS^) ^[ERROR^]
	echo --------------------------------------------------------------
	echo.
	echo ERROR: NO AUTH.JSON FOUND
	echo You must have an auth key.
	echo.
	echo To get a key, look up a simple tutorial on the internet.
	echo "Discord bot auth key setup"
	echo.
	echo !! You need an auth key !!
	pause
	exit
)

:startbot
copy eval.js node_modules\discord.js-commando\src\commands\util\ && cls

if exist data\norep (
	cls
	echo.
	echo REPEAT OFF
	echo.
	goto xrep
)
if exist data\yesrep (
	cls
	echo.
	echo REPEAT ON
	echo.
	goto rep
)

cls
echo.
echo Would you like to automatically restart the bot after it crashes?
echo.
set /p "repeat=| [y]es / [n]o / [ne]ver / [al]ways | "
if "%repeat%"=="y" (
	cls
	echo.
	echo REPEAT ON
	echo.
	
	:rep
	node bot.js
	echo Crash detected... Restarting in 15 seconds
	ping -n 15 127.0.0.1 >nul
	goto botstart
)
if "%repeat%"=="n" (
	cls
	echo.
	echo REPEAT OFF
	echo.
	
	:xrep
	node bot.js
	echo Crash detected.
	pause
	exit
)
if "%repeat%"=="ne" (
	echo. 2>data\norep
	
	cls
	echo.
	echo REPEAT OFF
	echo.
	
	goto xrep
)
if "%repeat%"=="al" (
	echo. 2>data\yesrep
	
	cls
	echo.
	echo REPEAT ON
	echo.
	
	goto rep
)