// Define and require modules
const Config        = require("./config");
const botConfig     = require("../../config");
const toString      = require("./util").toString;
const toArray       = require("./util").toArray;

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

			e.messages = toArray(e.messages, "|");
			e.emotes   = toArray(e.emotes,   "|");
			if (!message.content.match(new RegExp(toString(e.regex, "|"), e.flags))) return;

			// Checks
			if (e.checkPrevious) if (await checkMessages(message, toArray(e.regex, "|"), e.checkPrevious)) return;

			// Payloads
			e.messages.forEach(async m => await message.channel.send(m));
			e.emotes.forEach(async m   => await message.react(m));
		});
	}

	async function checkMessages(message, checks, limit) {
		let found = false;
		await message.channel.messages.fetch({ "limit": limit }).then(messages => {
			messages.delete(message.id);
			messages.some(msg => {if (checks.includes(msg.content)) found = true;});
		});

		return found;
	}
};