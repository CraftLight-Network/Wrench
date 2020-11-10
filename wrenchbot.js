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
const { stripIndents }    = require("common-tags");
const options             = require("./config");
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

// Check if the auth file exists
if (!fs.existsSync("./auth.json")) {
	console.error(stripIndents`
		The file \"auth.json\" does not exist! This is required in order to login to your bot.
		Please refer to README.md for steps on how to get your token.
	`);

	process.exit(1);
}

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
	"owner":                   options.owners,
	"invite":                  options.support,
	"commandPrefix":           options.prefix.commands,
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

// Create voice channel join/leave event
client.on("voiceStateUpdate", (from, to) => {
	if (from.channelID !== to.channelID) client.emit("voiceJoinLeave", from, to);
})

// Create message edit event
.on("messageUpdate", async (oldMessage, newMessage) => {
	oldMessage = await client.getMessage(oldMessage);
	newMessage = await client.getMessage(newMessage);

	// Make sure the edit is really an edit
	if (oldMessage.content       === newMessage.content ||
		oldMessage.pinned        !== newMessage.pinned  ||
		oldMessage.embeds.length !== newMessage.embeds.length) return;
	client.emit("messageEdit", oldMessage, newMessage);
});

// Get Enmap
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
	if (options.status.enabled) {status(); setInterval(status, options.status.timeout)};

	async function status() {
		// Get the status
		let status = await getStatus();

		// Re-roll if repeat
		if (client.user.presence.activities[0])
			while (status.name === client.user.presence.activities[0].name) status = await getStatus();

		// Set the status
		client.user.setActivity(status.name, { "type": status.type, "url": status.url });
	}

	// Get a random status
	async function getStatus() {
		const status = options.status.types[Math.floor(Math.random() * options.status.types.length)];
		return status.name = await client.placeholders(status.name);
	}
})

.on("message", async message => {
	message = await client.getMessage(message);

	// Ignore bots
	if (message.author.bot) return;

	// Run events
	reactions(message);
	guildEvents(message);

	totals.inc("messages");
})

// Run automod and reactions on edited messages
.on("messageEdit", async (oldMessage, message) => {
	message = await client.getMessage(message);
	if (message.author.bot) return;

	// Run events
	reactions(message);
	guildEvents(message);
});

// Guild-only events
async function guildEvents(message) {
	if (message.guild) {
		const config = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		// Run automod and reactions
		if (guildConfig.automod.enabled === "true" && !client.checkRole(message, guildConfig.automod.modRoleIDs)) automod(message);

		// Tag command
		if (message.content.indexOf(options.prefix.tags) === 0 && message.content.includes(" ")) {
			const tagCommand = client.registry.commands.find(c => c.name === "tag");
			tagCommand.run(message, { "action": message.content.slice(1) });
		}
	}
}

// Voice chat text channel role
client.on("voiceJoinLeave", async (from, to) => {
	const config = new Config("guild", to.guild.id);
	const guildConfig = await config.get();

	if (!guildConfig.misc.vcText.enabled) return;

	// Get each channel/role ID
	guildConfig.misc.vcText.IDs.forEach(e => {
		const ids = e.split(",");

		// Add/remove role
		if (to.channelID === ids[0]) to.member.roles.add(ids[1]);
		else if (to.member.roles.cache.has(ids[1])) to.member.roles.remove(ids[1]);
	});
});

// Finally, log it in
client.login(require("./auth").token);