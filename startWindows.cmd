@echo off
title WrenchBot (Node.JS)
set "repeat=n"
cd "%~dp0"

if not exist node_modules (
	cls
	echo.
	echo Installing NPM modules. Please wait...
	echo.
	move package.json package.json.tmp
	move package-lock.json package-lock.json.tmp
	npm install node-gyp
	move package.json.tmp package.json
	move package-lock.json.tmp package-lock.json
	npm install
	echo.
	IF ERRORLEVEL 1 (
		color 04
		echo --------------------------------------------------------------
		echo.
		echo ERROR: NPM FAILED TO RUN
		echo You must not have Node.js installed.
		echo.
		echo To install N.JS and NPM, go to https://nodejs.org/en/download/
		echo and download the "Windows Installer"
		echo.
		echo !! You also need to allow this script admin priviledges. !!
		pause
		exit
	)
	echo Done! Moving on...
)

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