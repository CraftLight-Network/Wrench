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

	// Emit reaction change event on add/remove
	.on("messageReactionAdd", (reaction, user) => {
		client.emit("messageReactionChange", reaction, user, "add");
	})
	.on("messageReactionRemove", (reaction, user) => {
		client.emit("messageReactionChange", reaction, user, "remove");
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
	})

	.on("messageReactionChange", async (reaction, user, action) => {
		if (!reaction.message.guild || user.bot) return;

		const member = await reaction.message.guild.members.cache.get(user.id);
		const config = new TinyConfig("guild", reaction.message.guild);
		const guildConfig = await config.get();

		if (!guildConfig.misc.reactionRoles.enabled) return;
		guildConfig.misc.reactionRoles.ID.some(e => {
			const ids = e.split(",");

			if (reaction.message.id !== ids[0] ||
			   (reaction.emoji.id   !== ids[1] &&
				reaction.emoji.name !== ids[1])) return false;

			if (action === "add") member.roles.add(ids[2]);
			else member.roles.remove(ids[2]);
			return true;
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