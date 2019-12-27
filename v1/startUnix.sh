#!/bin/sh


echo -en "\033]0;WrenchBot (Node.JS)\a"
repeat='n'
error=`tput setaf 1`
cd "$(dirname "$0")"

if [ ! -d ./node_modules/ ]; then
	clear
	echo
	echo Before we install all of the NPM modules, we need to make sure you have some things.
	echo Node.JS \(+NPM\), FFmpeg.
	echo
	echo Installing NPM modules. Please wait...
	echo
	{
		mkdir ~/npm > /dev/null 2>&1
		mkdir data/storage > /dev/null 2>&1 && mkdir data/storage/logs > /dev/null 2>&1
	} || {
		echo NPM directory already exists.
	}
	npm config set prefix ~/npm
	npm install --global --production build-tools --unsafe-perm=true --allow-root > data/storage/logs/npm_log.log
	if [ $? -eq 1 ]; then
		rm -rf node_modules
		echo -e '${error}--------------------------------------------------------------\n\nERROR: BUILDTOOLS FAILED TO INSTALL\nYou must not have sudo/su rights.\n\nTo run this script as su, run sudo startUnix.sh\nOr run su, and then the script.\n\n!! You need superuser rights to compile the modules !!'
		read -n 1 -s -r -p "Press any key to contunue . . ."
		exit
	fi
	npm install --unsafe-perm=true --allow-root > data/storage/logs/npm_log.log
	echo
	if [ $? -eq 0 ]; then
		echo Done! Moving on...
	else
		rm -rf node_modules
		echo -e '${error}--------------------------------------------------------------\n\nERROR: NPM FAILED TO RUN\nYou must not have Node.js installed.\n\nTo install N.JS and NPM, go to https://nodejs.org/en/download/package-manager/\nand follow the instructions.\n\n!! You need Python and BuildTools !!'
		read -n 1 -s -r -p "Press any key to contunue . . ."
		exit
	fi
fi

if [ ! -f auth.json ]; then
	echo -e '${error}--------------------------------------------------------------\n\nERROR: NO AUTH.JSON FOUND\nYou must have an auth key.\n\nTo get a key, look up a simple tutorial on the internet.\n"Discord bot auth key setup"\n\n!! You need an auth key !!'
	echo !! You need an auth key !!
	read -n 1 -s -r -p "Press any key to contunue . . ."
	exit
fi

cp data/help.js node_modules/discord.js-commando/src/commands/util/ && clear
cp data/eval.js node_modules/discord.js-commando/src/commands/util/ && clear

repeat() {
	while true
	do
		clear
		echo
		echo REPEAT ON
		echo
		
		node bot.js
		echo Crash detected... Restarting in 15 seconds
		ping -n 15 127.0.0.1 > /dev/null 2>&1
		repeat
	done
}

norepeat() {
	clear
	echo
	echo REPEAT OFF
	echo
	
	node bot.js
	echo Crash detected.
	read -n 1 -s -r -p "Press any key to contunue . . ."
	exit
}

if [ -f data/storage/norep ]; then
	norepeat
fi
if [ -f data/storage/yesrep ]; then
	repeat
fi

clear
echo
echo Would you like to automatically restart the bot after it crashes?
echo
read -p "=| [y]es / [n]o / [ne]ver / [al]ways | " repeat
if [ "$repeat" = "y" ]; then
	repeat
fi
if [ "$repeat" = "n" ]; then
	norepeat
fi
if [ "$repeat" = "ne" ]; then
	echo > data/storage/norep
	norepeat
fi
if [ "$repeat" = "al" ]; then
	echo > data/storage/yesrep
	repeat
fi
