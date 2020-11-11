// Define and require modules
const botConfig = require("../../config");

module.exports = async (message) => {
	if (botConfig.reactions.enabled) {
		botConfig.reactions.types.forEach(async e => {
			const flags = e.flags ? e.flags : "i";
			const regex = e.fullWord ? new RegExp(`\\b${e.regex.replace(/\|/g, "\\b|\\b")}`, flags) : new RegExp(e.regex, flags);

			if (!regex.test(message.content)) return;

			const messages = message.client.toArray(e.messages, "|");
			const emotes   = message.client.toArray(e.emotes,   "|");

			// Checks
			if (e.checkPrevious && await checkMessages(message, regex, e.checkPrevious)) return;

			// Payloads
			messages.forEach(async m => message.channel.send(m));
			emotes.forEach(async m   => message.react(m));
		});
	}
};

async function checkMessages(message, regex, limit) {
	const messages = await message.channel.messages.fetch({ "limit": limit });
	messages.delete(message.id);

	return messages.some(m => {return message.client.check(m.content, regex)});
}