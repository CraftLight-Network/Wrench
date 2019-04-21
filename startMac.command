#!/bin/sh


echo -en "\033]0;WrenchBot (Node.JS)\a"
repeat='n'
error=`tput setaf 1`
cd $0

if [ ! -f node_modules/ ]; then
    clear
	echo
	echo Installing NPM modules. Please wait...
	echo
	npm install
	echo
	if [ $? -eq 0 ]; then
		echo Done! Moving on...
	else
		color 04
		echo -e '${error}ERROR: NPM FAILED TO RUN\nYou must not have Node.js installed.\n\nTo install N.JS and NPM, go to https://nodejs.org/en/download/package-manager/\nand follow the instructions for your device.\n'
		read  -n 1 -p "Press any key to contunue . . ."
		exit
	fi
fi

cp eval.js node_modules/discord.js-commando/src/commands/util/ && clear

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
	read  -n 1 -p "Press any key to contunue . . ."
	exit
}

if [ -f data/norep ]; then
	norepeat
fi
if [ -f data/yesrep ]; then
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
	echo >data/norep
	norepeat
fi
if [ "$repeat" = "al" ]; then
	echo >data/yesrep
	repeat
fi