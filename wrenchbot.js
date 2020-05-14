/*
              _______
             /       \
            /   /####-
           /   /
        __/   /####
       /         \
      /         ./
     /          /   __    __ _______
     \_____   //   |  |__|  |   __  \
     /@@@//  //    |  |  |  |  |__\  |
    /  /_/  //     |        |  |__/  |
    \_/ /  //      |________|_______/
      _/__//
     /   / /            WrenchBot
    /   / /    Fun and Helpful Discord Bot
   /   / /
  /   / /              Version 2.X
 /   / /           https://edude42.dev
/  O  /
\____/
*/

// REQUIRES PYTHON 2.7, NODE 10+, and C++

// WINDOWS: npm i -g --add-python-to-path --vs2015 --production windows-build-tools
// LINUX: apt install build-essential python2.7

// Define and require modules
const { CommandoClient } = require("discord.js-commando");
const configHandler = require("./data/js/configHandler");
const config = require("./config");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

// Register + create command instance
const client = new CommandoClient({
	"commandPrefix": config.prefix.commands,
	"owner": config.owners,
	"disableEveryone": true,
	"unknownCommandResponse": false
});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["search", "Search"],
		["image", "Image"],
		["games", "Games"],
		["fun", "Fun"],
		["moderation", "Moderation"],
		["misc", "Misc"]
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		"_eval": false
	})
	.registerCommandsIn(path.join(__dirname, "commands"));

// Sleep function
const sleep = require("discord.js").Util;

// Create private folders
!fs.existsSync("./data/private") && fs.mkdirSync("./data/private");
!fs.existsSync("./data/private/logs") && fs.mkdirSync("./data/private/logs");

// Get Enmap
const Enmap = require("enmap");
const { commands, messages, translations } = require("./data/js/enmap");
const defaultConfig = require("./data/json/default");

// Logger
const date = moment().format("M/D/YY hh:mm:ss A");
const { log, logger } = require("./data/js/logger");
logger(client);

// Start modules
const automod = require("./data/js/automod");
const translate = require("./data/js/translate");
const reactions = require("./data/js/reactions");

client.on("ready", () => {
	commands.ensure("number", 0);
	messages.ensure("number", 0);
	translations.ensure("number", 0);
	log.ok("---------------------------------------------");
	log.ok(`  WrenchBot START ON: ${date}`);
	log.ok("---------------------------------------------");
	log.info(`Name: ${client.user.tag} | ID: ${client.user.id} | ${client.guilds.size} servers`);
	log.info(`${commands.get("number")} commands used | ${messages.get("number")} messages read | ${translations.get("number")} translations done`);
	log.info(`Currently in ${client.guilds.size} servers.`);

	// Set the bots status
	if (config.status.enabled) {status(); setTimeout(status, config.status.timeout)};

	function status() {
		// Get a random status from the list
		const random = Math.floor(Math.random() * config.status.statuses.length);

		// Replace placeholders
		const name = config.status.statuses[random].name
			.replace(/%prefix%/g, config.prefix.commands)
			.replace(/%servers%/g, client.guilds.size)
			.replace(/%commands%/g, commands.get("number"))
			.replace(/%messages%/g, messages.get("number"))
			.replace(/%translations%/g, translations.get("number"));

		// Set the status
		client.user.setPresence({ "game": { "type": config.status.statuses[random].type, "name": name } });
	}
});

client.on("message", async message => {
	// Ignore bots
	if (message.author.bot) return;

	if (message.guild) {
		// Get the config
		configHandler.ensure(message.guild.id);

		// Run the automod
		automod(message);

		// Tag command
		if (message.content.indexOf(config.prefix.tags) === 0 && !message.content.match(/ /g)) {
			const tagCommand = client.registry.commands.find(c => c.name === "tag");
			tagCommand.run(message, { "action": message.content.slice(1) });
		}
	}

	// Run the reactions and translator
	reactions(message);
	if (!message.content.match(/\]tran|\]translate/)) translate(message);

	// Increase read/ran values
	messages.inc("number");
});

client.on("commandRun", (command, promise, message) => {
	log.command(`${(message.guild ? "" : "(DM) ") + message.author.tag} | ${message.content}`);
	commands.inc("number");
});

// Run automod and reactions on edited messages
client.on("messageUpdate", (oldMessage, message) => {
	if (message.guild) automod(message);
	reactions(message);
	translate(message);
});

// Log the bot in
const auth = require("./auth");
client.login(auth.token);