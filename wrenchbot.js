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

// Register + create command instance
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

// Get Enmap
const Enmap = require("enmap");
const { guildConfig, tempBans, commands, messages, translations } = require("./data/js/enmap.js");
const defaultConfig = require("./data/json/default.json");

// Logger
const date = moment().format("M/D/YY h:m:s A");
const { log, logger } = require("./data/js/logger.js");
logger("all", client, date, guildConfig, defaultConfig);

// Start Automod
const { automod } = require("./data/js/automod.js");

client.on("ready", () => {
	commands.ensure("number", 0);
	messages.ensure("number", 0);
	translations.ensure("number", 0);
	log.ok("--------------------------------------------");
	log.ok(`  WrenchBot START ON: ${date}`);
	log.ok("--------------------------------------------");
	log.info(`Name: ${client.user.tag} | ID: ${client.user.id} | ${client.guilds.size} servers`);
	log.info(`${commands.get("number")} commands used | ${messages.get("number")} messages read | ${translations.get("number")} translations done`);
});

client.on("message", async message => {
	// Shorter message content
	const content = message.content;

	// Make sure enmap exists
	guildConfig.ensure(message.guild.id, defaultConfig);

	// Automod
	// Bad links filter
	if (guildConfig.get(message.guild.id, "automod.enabled")) {
		if (guildConfig.get(message.guild.id, "automod.modules.badLinks")) {automod("badLinks", message)}
		if (guildConfig.get(message.guild.id, "automod.modules.invites")) {automod("invites", message)}
	}

	if (content === "WrenchBotTest") {message.reply("test")}

	messages.inc("number");
	if (content.charAt(0) === config.prefix) {
		log.command(`${message.author.tag}: ${message}`);
		commands.inc("number");
	}
});

// Log the bot in
const auth = require("./auth.json");
client.login(auth.token);