@echo off
SET REPEAT="n"

IF EXIST bot.js (
	echo Checking files... ^(1/7^)
) ELSE (
	echo.  
	echo ----------------------------------------------------------
	echo.
	echo "bot.js" not found. Please rename the file or download it.
	echo.
	echo ----------------------------------------------------------
	echo.
	echo.
	echo Download: https://github.com/Edude42/WrenchBot/blob/master/bot.js
	echo.
	echo.
	pause
	exit
)
IF EXIST node_modules (
	echo Checking files... ^(2/7^)
) ELSE (
	echo.  
	echo --------------------------------------
	echo.
	echo NPM Modules not found. Installing now.
	echo.
	echo --------------------------------------
	echo.
	npm install
	echo.
	echo If you are getting permission errors, please run this script as administrator.
	echo.
	echo If there were any errors, either contact edude@edude.xyz,
	echo or make sure you have the latest version of Java, Python, g++ and
	echo you successfully installed Node.js and npm.
	echo.
	echo How to: https://github.com/Edude42/WrenchBot/wiki/Getting-Started#Windows
	echo.
	pause
	exit
)
IF EXIST commands (
	echo Checking files... ^(3/7^)
) ELSE (
	echo.  
	echo -----------------------------------------
	echo.
	echo Commands not found. Please download them.
	echo.
	echo -----------------------------------------
	echo.
	echo.
	echo Download: https://github.com/Edude42/WrenchBot/tree/master/commands
	echo.
	echo.
	pause
	exit
)
IF EXIST auth.json (
	echo Checking files... ^(4/7^)
) ELSE (
	echo.  
	echo --------------------------------------------
	echo.
	echo auth.json not found. Please create the file.
	echo.
	echo --------------------------------------------
	echo.
	echo.
	echo How to: https://github.com/Edude42/WrenchBot/wiki/Auth-Key
	echo.
	echo.
	pause
	exit
)
IF EXIST config.json (
	echo Checking files... ^(5/7^)
) ELSE (
	echo.  
	echo ------------------------------------------------
	echo.
	echo config.json not found. Please download the file.
	echo.
	echo ------------------------------------------------
	echo.
	echo.
	echo Download: https://github.com/Edude42/WrenchBot/blob/master/config.json
	echo.
	echo.
	pause
	exit
)

IF EXIST node_modules\discord.js-commando\src\commands\util\eval.js (
	echo.  
	echo --------------------------------
	echo.
	echo eval command found. Disabling...
	echo.
	echo --------------------------------
	echo.
	echo.
	copy node_modules\discord.js-commando\src\commands\util\eval.js node_modules\discord.js-commando\src\commands\util\eval.js.bak
	copy eval.js node_modules\discord.js-commando\src\commands\util
	echo.
	echo.
	echo Done! Proceding...
	echo Checking files... ^(6/7^)
	goto evaldel
) ELSE (
	echo Checking files... ^(6/7^)
)

:evaldel

IF EXIST package.json (
	echo Checking files... ^(7/7^)
) ELSE (
	echo.  
	echo -------------------------------------------------
	echo.
	echo package.json not found. Please download the file.
	echo.
	echo -------------------------------------------------
	echo.
	echo.
	echo Example: https://github.com/Edude42/WrenchBot
	echo.
	echo.
	pause
	exit
)

IF EXIST autorestart (
	cls
	goto botstart
) ELSE (
	echo.
	echo If you put a file named "autorestart" (no extension),
	echo this prompt will go away and will always restart.
	echo.
	set /p REPEAT=Would you like to automatically restart the bot if it crashes? ^(y^/n^) )
	echo.
	echo Done! Starting bot...
	cls
	echo.
	echo If the command "node" was not found, that means
	echo you either don't have Node.js installed, or
	echo you don't have it set up in your environment.
	echo.
	echo How to: https://github.com/Edude42/WrenchBot/wiki/Getting-Started
	echo.
	IF "%REPEAT%"=="y" (
		echo REPEAT ON
		echo.
		
		:botstart
		
		node bot.js
		echo Crash detected... Restarting in 15 seconds.
		timeout 15
		goto botstart
	)
	IF "%REPEAT%"=="n" (
		echo REPEAT OFF
		echo.
		node bot.js
	)
)
pause
exit