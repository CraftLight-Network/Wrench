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

// CHECK IF NOT EXIST: auth

// Define and require modules
const { CommandoClient }  = require("discord.js-commando");
const conf                = require("./config");
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

// Create private folders
function createFolder(...dirs) {
	dirs.forEach(dir => {
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);
	});
}
createFolder("./data/private", "./data/private/enmap", "./data/private/logs");

// Register + create command instance
const Config = require("./data/js/config");
const client = new CommandoClient({
	"owner":                   conf.owners,
	"invite":                  conf.support,
	"commandPrefix":           conf.prefix.commands,
	"commandEditableDuration": 1,
	"partials":                ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"]
});
client.registry
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerGroups([
		["search",     "Search"],
		["image",      "Image"],
		["fun",        "Fun"],
		["moderation", "Moderation"],
		["misc",       "Misc"]
	])
	.registerCommandsIn(path.join(__dirname, "commands"))
	.registerDefaultCommands({ "unknownCommand": false });

// Get Enmap
!fs.existsSync("./data/private")      && fs.mkdirSync("./data/private");
!fs.existsSync("./data/private/logs") && fs.mkdirSync("./data/private/logs");
const totals = require("./data/js/enmap").totals;

// Logger
const { log, logger } = require("./data/js/logger");
logger(client, totals);

// Get utilities
listen(["./data/js/util.js"]);

function listen(files) {
	files.forEach(f => {
		require(f).run(client);
		fs.watchFile(f, () => {
			log.info(`${f} was changed! Updating...`);
			delete require.cache[require.resolve(f)];

			try {require(f).run(client)}
			catch (e) {log.error(`There was an error updating the file! ${e}`)}
		});
	});
}

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
	if (conf.status.enabled) {status(); setInterval(status, conf.status.timeout)};

	function status() {
		// Get a random status
		function getStatus() {
			const status = conf.status.types[Math.floor(Math.random() * conf.status.types.length)];
			status.name = client.placeholders(status.name);
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
	message = await client.getMessage(message);

	// Ignore bots
	if (message.author.bot) return;

	reactions(message);
	guildEvents(message);

	// Increase read/ran values
	totals.inc("messages");
});

// Message edit event
client.on("messageUpdate", async (oldMessage, newMessage) => {
	oldMessage = await client.getMessage(oldMessage);
	newMessage = await client.getMessage(newMessage);

	if (oldMessage.content       === newMessage.content ||
		oldMessage.pinned        !== newMessage.pinned  ||
		oldMessage.embeds.length !== newMessage.embeds.length) return;
	client.emit("messageEdit", oldMessage, newMessage);
});

// Run automod and reactions on edited messages
client.on("messageEdit", async (oldMessage, message) => {
	message = await client.getMessage(message);
	if (message.author.bot) return;

	reactions(message);
	guildEvents(message);
});

async function guildEvents(message) {
	if (message.guild) {
		// Get the config
		const config = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		// Run automod and reactions
		if (guildConfig.automod.enabled === "true" && !client.checkRole(message, guildConfig.automod.modRoleIDs)) automod(message);

		// Tag command
		if (message.content.indexOf(conf.prefix.tags) === 0 && !message.content.match(/ /g)) {
			const tagCommand = client.registry.commands.find(c => c.name === "tag");
			tagCommand.run(message, { "action": message.content.slice(1) });
		}
	}
}

// VC-Text lockout
client.on("voiceStateUpdate", async (from, to) => {
	const config = new Config("guild", to.guild.id);
	const guildConfig = await config.get();

	if (!guildConfig.misc.vcText.enabled) return;

	guildConfig.misc.vcText.IDs.forEach(e => {
		const ids = e.split(",");

		if (to.channelID === ids[0]) to.member.roles.add(ids[1]);
		else if (to.member.roles.cache.has(ids[1])) to.member.roles.remove(ids[1]);
	});
});

// Log the bot in
client.login(require("./auth").token);