/* eslint-disable spaced-comment */
// Define and require modules
const { guildConfig } = require("./enmap.js");
const config = require("../../config.json");

module.exports = function reactions(message) {
	const content = message.content;

	if (!message.guild || guildConfig.get(message.guild.id, "misc.reactions.greetings")) checkGreetings();
	async function checkGreetings() {
		let found = false;
		const greeting = ["hello", "hi", "hey", "howdy", "sup", "yo", "hola", "hallo", "bonjour", "salut", "ciao", "konnichiwa", "hiya", "heyo"];
		const farewell = ["goodbye", "bye", "cya", "gtg"];

		if (greeting.includes(message.content)) {
			await message.channel.fetchMessages({ "limit": 4 }).then(messages => {
				messages.delete(message.id);
				messages.some(msg => {if (greeting.includes(msg.content)) found = true;});
			});

			if (!found) message.react("👋").then(async () => {await message.react("🇭"); message.react("🇮")});
		}

		if (farewell.includes(message.content)) {
			await message.channel.fetchMessages({ "limit": 4 }).then(messages => {
				messages.delete(message.id);
				messages.some(msg => {if (farewell.includes(msg.content)) found = true;});
			});

			if (!found) message.react("👋").then(async () => {await message.react("🇧"); await message.react("🇾"); message.react("🇪")});
		}
	}
	if (config.reactions.enabled && (!message.guild || guildConfig.get(message.guild.id, "misc.reactions.emotes"))) checkEmotes();
	function checkEmotes() {
		if (content.match(/pog|pogchamp/gi))	message.react(config.reactions.ids.pogchamp);
		if (content.match(/lul|lol/gi))			message.react(config.reactions.ids.lul);
		if (content.match(/kappa/gi))			message.react(config.reactions.ids.kappa);
		if (content.match(/sleeper/gi))			message.react(config.reactions.ids.sleeper);
	}
};