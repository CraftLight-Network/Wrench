/*
              _______
             /       \
            /   /####-
           /   /
        __/   /####
       /         \
      /         ./
     /          /   __    __ ________
     \_____   //   |  |__|  |   __   |
     /@@@//  //    |  |  |  |  |__\  |
    /  /_/  //     |        |  |__/  |
    \_/ /  //      |________|________|
      _/__//
     /   / /            WrenchBot
    /   / /    Fun and Helpful Discord Bot
   /   / /
  /   / /                v2.0
 /   / /        Github: http://cust.pw/wb
/  O  /        Issues: http://cust.pw/wbis
\____/
*/

// REQUIRES PYTHON 2.7 + C++
// npm i -g --add-python-to-path --vs2015 --production windows-build-tools

// Define and require modules
const { CommandoClient } = require("discord.js-commando");
const config = require("./config.json");
const moment = require("moment");
const path = require("path");

// Commando
const client = new CommandoClient({
	"commandPrefix": config.prefix,
	"owner": config.owners,
	"disableEveryone": true,
	"unknownCommandResponse": false
});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["fun", "Fun"],
		["manipulation", "Manipulation"],
		["helpful", "Helpful"],
		["staff", "Staff"]
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		"_eval": false
	})
	.registerCommandsIn(path.join(__dirname, "commands"));

// Sleep function
const sleep = require("discord.js").Util;

// Enmap
const Enmap = require("enmap");
const { guildConfig, tempBans, commands, messages, translations } = require("./data/js/enmap.js");
const defaultConfig = require("./data/json/default.json");

// Logger
const date = moment().format("M/D/YY h:m:s A");
const { log, logger } = require("./data/js/logger.js");
logger(client, date, guildConfig, defaultConfig);