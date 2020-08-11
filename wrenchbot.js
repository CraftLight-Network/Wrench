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
const configHandler       = require("./data/js/configHandler");
const util                = require("./data/js/util");
const config              = require("./config");
const readline            = require("readline");
const moment              = require("moment");
const path                = require("path");
const fs                  = require("fs");

// Console input
const input = readline.createInterface({
	"input": process.stdin,
	"output": process.stdout
});

input.on("line", i => {
	if (i === "exit") process.exit(0);
});

// Register + create command instance
const client = new CommandoClient({
	"owner":                   config.owners,
	"invite":                  config.support,
	"commandPrefix":           config.prefix.commands,
	"commandEditableDuration": 1,
	"partials":                ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"]
});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["search",     "Search"],
		["image",      "Image"],
		["fun",        "Fun"],
		["moderation", "Moderation"],
		["misc",       "Misc"]
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		"unknownCommand": false,
		"_eval": false
	})
	.registerCommandsIn(path.join(__dirname, "commands"));

// Get Enmap
!fs.existsSync("./data/private")      && fs.mkdirSync("./data/private");
!fs.existsSync("./data/private/logs") && fs.mkdirSync("./data/private/logs");
const totals = require("./data/js/enmap").totals;

util.init(client, totals);

// Logger
const { log, logger } = require("./data/js/logger");
logger(client, totals);

// Start modules
const automod   = require("./data/js/automod");
const reactions = require("./data/js/reactions");

client.on("ready", () => {
	log.ok("------------------------------------------");
	log.ok(` WrenchBot START ON: ${moment().format("MM/DD/YY hh:mm:ss A")}`);
	log.ok("------------------------------------------");
	log.info(`Name: ${client.user.tag} | ID: ${client.user.id} | ${client.guilds.cache.size} servers`);
	log.info(`${totals.get("commands")} commands used | ${totals.get("messages")} messages read | ${totals.get("translations")} translations done`);

	// Set the bots status
	if (config.status.enabled) {status(); setInterval(status, config.status.timeout)};

	function status() {
		// Get a random status
		function getStatus() {
			const status = config.status.types[Math.floor(Math.random() * config.status.types.length)];
			status.name = util.replacePlaceholders(status.name);
			return status;
		}
		let status = getStatus();
		if (client.user.presence.activities[0]) {
			while (status.name === client.user.presence.activities[0].name) {
				status = getStatus();
			}
		}

		// Set the status
		client.user.setActivity(status.name, { "type": status.type, "url": status.url });
	}
});

client.on("message", async message => {
	message = await util.getMessage(message);

	// Ignore bots
	if (message.author.bot) return;

	reactions(message);
	guildEvents(message);

	// Increase read/ran values
	totals.inc("messages");
});

// Run automod and reactions on edited messages
client.on("messageUpdate", async (oldMessage, message) => {
	message = await util.getMessage(message);
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
		if (guildConfig.automod.enabled === "true" && !util.checkRole(message, guildConfig.automod.modRoleIDs)) automod(message);

		// Tag command
		if (message.content.indexOf(config.prefix.tags) === 0 && !message.content.match(/ /g)) {
			const tagCommand = client.registry.commands.find(c => c.name === "tag");
			tagCommand.run(message, { "action": message.content.slice(1) });
		}
	}
}

// Log the bot in
const auth = require("./auth");
client.login(auth.token);