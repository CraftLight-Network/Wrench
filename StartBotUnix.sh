#! /bin/bash
#!/usr/bin/env node console.log('Node.js found.')
if [ -f bot.js ]
then
echo Checking files... \(1/6\)
else
echo
echo ----------------------------------------------------------
echo
echo "bot.js" not found. Please rename the file or download it.
echo
echo ----------------------------------------------------------
echo
echo
echo https://github.com/Edude42/WrenchBot
echo
echo
read -n 1 -s
exit
fi

if [ -d node_modules ]
then
echo Checking files... \(2/6\)
else
echo
echo --------------------------------------
echo
echo NPM Modules not found. Please install.
echo
echo --------------------------------------
echo
echo Use the command "npm install"
echo
echo If there were any errors, either contact owner@customcraft.online,
echo or make sure you have the latest version of Java, Python and
echo you installed the .NET Framework 2.0 SDK, Microsoft Visual Studio 2005,
echo and made sure you added these to your PATH environment.
echo
read -n 1 -s
exit
fi

if [ -d commands ]
then
echo Checking files... \(3/6\)
else
echo
echo -----------------------------------------
echo
echo Commands not found. Please download them.
echo
echo -----------------------------------------
echo
echo
echo https://github.com/Edude42/WrenchBot/tree/master/commands
echo
echo
read -n 1 -s
exit
fi

if [ -f auth.json ]
then
echo Checking files... \(4/6\)
else
echo
echo --------------------------------------------
echo
echo auth.json not found. Please create the file.
echo
echo --------------------------------------------
echo
echo
echo Example: https://github.com/Edude42/WrenchBot/blob/master/authEXAMPLE
echo
echo
read -n 1 -s
exit
fi

if [ -f config.json ]
then
echo Checking files... \(5/6\)
else
echo
echo ------------------------------------------------
echo
echo config.json not found. Please download the file.
echo
echo ------------------------------------------------
echo
echo
echo Example: https://github.com/Edude42/WrenchBot
echo
echo
read -n 1 -s
exit
fi

if [ -f package.json ]
then
echo Checking files... \(6/6\)
echo
echo Done! Starting bot...
node bot.js
echo
echo If the command "node" was not found, that means
echo you either don\'t have Node.js installed, or
echo you don\'t have it set up in your environment.
echo
else
echo
echo -------------------------------------------------
echo
echo package.json not found. Please download the file.
echo
echo -------------------------------------------------
echo
echo
echo Example: https://github.com/Edude42/WrenchBot
echo
echo
read -n 1 -s
exit
fi
