@echo off
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
)
IF EXIST commands (
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
)