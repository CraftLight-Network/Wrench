// Define and require modules
const options    = require("../../config");
const reactions  = require("./reactions");
const automod    = require("./automod");
const TinyConfig = require("./config");

module.exports.run = (client) => {
	// Create voice channel join/leave event
	client.on("voiceStateUpdate", (from, to) => {
		if (from.channelID !== to.channelID) client.emit("voiceJoinLeave", from, to);
	})

	// Create message edit event
	.on("messageUpdate", async (oldMessage, newMessage) => {
		oldMessage = await client.getMessage(oldMessage);
		newMessage = await client.getMessage(newMessage);

		// Make sure the edit is really an edit
		if (oldMessage.content === newMessage.content) return;
		client.emit("messageEdit", oldMessage, newMessage);
	})

	.on("message", async message => {
		if (message.author.bot) return;
		message = await client.getMessage(message);

		// Run events
		reactions(message);
		guildEvents(message);

		// totals.inc("messages");
	})

	// Run automod and reactions on edited messages
	.on("messageEdit", async (oldMessage, message) => {
		if (message.author.bot) return;

		// Run events
		reactions(message);
		guildEvents(message);
	})

	// Voice chat text channel role
	.on("voiceJoinLeave", async (from, to) => {
		const config = new TinyConfig("guild", to.guild);
		const guildConfig = await config.get();
		if (!guildConfig) return;

		if (!guildConfig.misc.voicechat.enabled) return;

		// Get each channel/role ID
		guildConfig.misc.voicechat.ID.forEach(e => {
			const ids = e.split(",");

			// Add/remove role
			if (to.channelID === ids[0]) to.member.roles.add(ids[1]);
			else if (to.member.roles.cache.has(ids[1])) to.member.roles.remove(ids[1]);
		});
	});

	// Guild-only events
	async function guildEvents(message) {
		if (message.guild) {
			const config = new TinyConfig("guild", message.guild);
			const guildConfig = await config.get();
			if (!guildConfig) return;

			// Run automod and reactions
			if (guildConfig.automod.enabled && !client.checkRole(message, guildConfig.automod.adminID)) automod(message);

			// Tag command
			if (message.content.indexOf(options.prefix.tags) === 0 && message.content.includes(" ")) {
				const tagCommand = client.registry.commands.find(c => c.name === "tag");
				tagCommand.run(message, { "action": message.content.slice(1) });
			}
		}
	}
};