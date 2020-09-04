// Define and require modules
const Config        = require("./config");
const botConfig     = require("../../config");
const util          = require("./util");

module.exports = async (message) => {
	let guildConfig;

	// Get the config
	if (message.guild) {
		const config = new Config("guild", message.guild.id);
		config.ensure(message.guild.id);
		guildConfig = await config.get();
	}

	if (botConfig.reactions.enabled && (!message.guild || guildConfig.misc.reactions === "true")) checkReactions();
	function checkReactions() {
		botConfig.reactions.types.forEach(async e => {
			if (e.flags === undefined) e.flags = "i";
			if (e.fullWord) e.regex = `\\b${e.regex.replace("|", "\\b|\\b")}\\b`;

			e.messages = util.toArray(e.messages, "|");
			e.emotes   = util.toArray(e.emotes,   "|");
			if (!message.content.match(new RegExp(e.regex, e.flags))) return;

			// Checks
			if (e.checkPrevious) if (await checkMessages(message, util.toArray(e.regex, "|"), e.checkPrevious)) return;

			// Payloads
			e.messages.forEach(async m => await message.channel.send(m));
			e.emotes.forEach(async m   => await message.react(m));
		});
	}

	async function checkMessages(message, checks, limit) {
		let found = false;
		await message.channel.messages.fetch({ "limit": limit }).then(messages => {
			messages.delete(message.id);
			messages.forEach(m => found = util.newIncludes(m.content, checks));
		});
		return found;
	}
};