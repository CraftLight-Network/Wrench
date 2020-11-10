// Define and require modules
const botConfig     = require("../../config");
// const Config        = require("./config");
const _             = require("lodash");

module.exports = async (message) => {
	if (botConfig.reactions.enabled) checkReactions();
	function checkReactions() {
		const reactions = _.cloneDeep(botConfig.reactions.types);
		reactions.forEach(async e => {
			if (e.flags === undefined) e.flags = "i";
			if (e.fullWord) e.regex = new RegExp(`\\b${e.regex.replace(/\|/g, "\\b|\\b")}`, e.flags);
			else e.regex = new RegExp(e.regex, e.flags);

			e.messages = message.client.toArray(e.messages, "|");
			e.emotes   = message.client.toArray(e.emotes,   "|");
			if (!message.content.match(e.regex)) return;

			// Checks
			if (e.checkPrevious && await checkMessages(message, e.regex, e.checkPrevious)) return;

			// Payloads
			e.messages.forEach(async m => await message.channel.send(m));
			e.emotes.forEach(async m   => await message.react(m));
		});
	}
};

async function checkMessages(message, regex, limit) {
	const messages = await message.channel.messages.fetch({ "limit": limit });

	messages.delete(message.id);
	return messages.some(m => message.client.check(m.content, regex));
}