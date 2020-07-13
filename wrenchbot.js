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
 /   / /           https://encode42.dev
/  O  /
\____/
*/

// Define and require modules
const { CommandoClient }  = require("discord.js-commando");
const replacePlaceholders = require("./data/js/util").replacePlaceholders;
const checkRole			  = require("./data/js/util").checkRole;
const utilInit			  = require("./data/js/util").init;
const configHandler		  = require("./data/js/configHandler");
const config			  = require("./config");
const moment			  = require("moment");
const path				  = require("path");
const fs				  = require("fs");

// Register + create command instance
const client = new CommandoClient({
	"commandPrefix":		  config.prefix.commands,
	"owner":				  config.owners,
	"disableEveryone":		  true,
	"unknownCommandResponse": false
});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["search",	   "Search"],
		["image",	   "Image"],
		["games",	   "Games"],
		["fun",		   "Fun"],
		["moderation", "Moderation"],
		["misc",	   "Misc"]
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		"_eval": false
	})
	.registerCommandsIn(path.join(__dirname, "commands"));

// Get Enmap
!fs.existsSync("./data/private")	  && fs.mkdirSync("./data/private");
!fs.existsSync("./data/private/logs") && fs.mkdirSync("./data/private/logs");
const totals = require("./data/js/enmap").totals;

utilInit(client, totals);

// Logger
const { log, logger } = require("./data/js/logger");
logger(client);

// Start modules
const automod	= require("./data/js/automod");
const reactions	= require("./data/js/reactions");

client.on("ready", () => {
	totals.ensure("commands", 0);
	totals.ensure("messages", 0);
	totals.ensure("automod",  0);
	log.ok("--------------------------------------------");
	log.ok(`  WrenchBot START ON: ${moment().format("M/D/YY hh:mm:ss A")}`);
	log.ok("--------------------------------------------");
	log.info(`Name: ${client.user.tag} | ID: ${client.user.id} | ${client.guilds.size} servers`);
	log.info(`${totals.get("commands")} commands used | ${totals.get("messages")} messages read | ${totals.get("translations")} translations done`);
	log.info(`Currently in ${client.guilds.size} servers.`);

	// Set the bots status
	if (config.status.enabled) {status(); setInterval(status, config.status.timeout)};

	function status() {
		// Get a random status
		function getStatus() {
			const status = config.status.types[Math.floor(Math.random() * config.status.types.length)];
			status.name = replacePlaceholders(status.name);
			return status;
		}
		let status = getStatus();
		if (client.user.presence.activities[0]) {
			while (status.name === client.user.presence.activities[0].name) {
				status = getStatus();
			}
		}

		// Set the status
		client.user.setPresence({ "game": { "type": status.type, "name": status.name } });
	}
});

client.on("message", async message => {
	// Ignore bots
	if (message.author.bot) return;

	reactions(message);
	guildEvents(message);

	// Increase read/ran values
	totals.inc("messages");
});

// Run automod and reactions on edited messages
client.on("messageUpdate", async (oldMessage, message) => {
	if (message.author.bot) return;

	reactions(message);
	guildEvents(message);
});

async function guildEvents(message) {
	if (message.guild) {
		// Get the config
		configHandler.ensure(message.guild.id);
		const guildConfig = await configHandler.getConfig(message.guild.id);

		// Run automod and reactions
		if (guildConfig.automod.enabled === "true" && !checkRole(message, guildConfig.automod.modRoleIDs)) automod(message);

		// Tag command
		if (message.content.indexOf(config.prefix.tags) === 0 && !message.content.match(/ /g)) {
			const tagCommand = client.registry.commands.find(c => c.name === "tag");
			tagCommand.run(message, { "action": message.content.slice(1) });
		}
	}
}

client.on("commandRun", (command, promise, message) => {
	log.command(`${(message.guild ? "" : "(DM) ") + message.author.tag} | ${message.content}`);
	totals.inc("commands");
});

// Log the bot in
const auth = require("./auth");
client.login(auth.token);