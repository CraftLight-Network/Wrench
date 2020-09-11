// Define and require modules
const botConfig     = require("../../config");
const Config        = require("./config");
const util          = require("./util");
const _             = require("lodash");

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
		const reactions = _.cloneDeep(botConfig.reactions.types);
		reactions.forEach(async e => {
			if (e.flags === undefined) e.flags = "i";
			if (e.fullWord) e.regex = new RegExp(`\\b${e.regex.replace(/\|/g, "\\b|\\b")}`, e.flags);
			else e.regex = new RegExp(e.regex, e.flags);

			e.messages = util.toArray(e.messages, "|");
			e.emotes   = util.toArray(e.emotes,   "|");
			if (!message.content.match(e.regex)) return;

			// Checks
			if (e.checkPrevious) if (await checkMessages(message, e.regex, e.checkPrevious)) return;

			// Payloads
			e.messages.forEach(async m => await message.channel.send(m));
			e.emotes.forEach(async m   => await message.react(m));
		});
	}

	async function checkMessages(message, regex, limit) {
		const messages = await message.channel.messages.fetch({ "limit": limit });

		messages.delete(message.id);
		return messages.some(m => util.check(m.content, regex));
	}
};