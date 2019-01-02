@echo off
SET REPEAT="n"
IF EXIST bot.js (
echo Checking files... ^(1/6^)
) ELSE (
echo.  
echo ----------------------------------------------------------
echo.
echo "bot.js" not found. Please rename the file or download it.
echo.
echo ----------------------------------------------------------
echo.
echo.
echo https://github.com/Edude42/WrenchBot
echo.
echo.
pause
exit
)
IF EXIST node_modules (
echo Checking files... ^(2/6^)
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
echo If there were any errors, either contact owner@customcraft.online,
echo or make sure you have the latest version of Java, Python and
echo you installed the .NET Framework 2.0 SDK, Microsoft Visual Studio 2005,
echo and made sure you added these to your PATH environment.
echo.
pause
exit
)
IF EXIST commands (
echo Checking files... ^(3/6^)
) ELSE (
echo.  
echo -----------------------------------------
echo.
echo Commands not found. Please download them.
echo.
echo -----------------------------------------
echo.
echo.
echo https://github.com/Edude42/WrenchBot/tree/master/commands
echo.
echo.
pause
exit
)
IF EXIST auth.json (
echo Checking files... ^(4/6^)
) ELSE (
echo.  
echo --------------------------------------------
echo.
echo auth.json not found. Please create the file.
echo.
echo --------------------------------------------
echo.
echo.
echo Example: https://github.com/Edude42/WrenchBot/blob/master/authEXAMPLE
echo.
echo.
pause
exit
)
IF EXIST config.json (
echo Checking files... ^(5/6^)
) ELSE (
echo.  
echo ------------------------------------------------
echo.
echo config.json not found. Please download the file.
echo.
echo ------------------------------------------------
echo.
echo.
echo Example: https://github.com/Edude42/WrenchBot
echo.
echo.
pause
exit
)
IF EXIST package.json (
echo Checking files... ^(6/6^)
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
IF "%REPEAT%"=="y" (
echo REPEAT ON
echo.
:botstart
node bot.js
echo Crash detected... Restarting in 15 seconds.
sleep 15
goto botstart
)
IF "%REPEAT%"=="n" (
echo REPEAT OFF
echo.
node bot.js
)
pause
exit
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