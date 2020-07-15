// Define and require modules
const configHandler	= require("../../data/js/configHandler");
const config		= require("../../config");
const toString		= require("./util").toString;
const toArray		= require("./util").toArray;

module.exports = async (message) => {
	let guildConfig;
	if (message.guild) guildConfig = await configHandler.getConfig(message.guild.id);

	if (config.reactions.enabled && (!message.guild || guildConfig.misc.reactions === "true")) checkReactions();
	function checkReactions() {
		config.reactions.types.forEach(async e => {
			e.messages = toArray(e.messages, "|");
			e.emotes   = toArray(e.emotes,	 "|");
			if (!message.content.match(new RegExp(toString(e.regex, "|")))) return;

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