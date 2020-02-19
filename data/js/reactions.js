// Define and require modules
const { guildConfig } = require("./enmap.js");
const config = require("../../config.json");

module.exports = function reactions(message) {
	const content = message.content;

	if (!message.guild || guildConfig.get(message.guild.id, "misc.reactions.greetings")) checkGreetings();
	function checkGreetings() {
		const greeting = ["hello", "hi", "hey", "howdy", "sup", "yo", "hola", "hallo", "bonjour", "salut", "ciao", "konnichiwa"];
		const farewell = ["goodbye", "bye", "cya", "gtg"];

		greeting.forEach(g => {
			if (!content.match(new RegExp(`\\b${g}\\b`, "gi"))) return;
			message.react("👋").then(async function() {await message.react("🇭"); message.react("🇮")});
		});

		farewell.forEach(f => {
			if (!content.match(new RegExp(`\\b${f}\\b`, "gi"))) return;
			message.react("👋").then(async function() {await message.react("🇧"); await message.react("🇾"); message.react("🇪")});
		});
	}
	if (config.reactions.enabled && (!message.guild || guildConfig.get(message.guild.id, "misc.reactions.emotes"))) checkEmotes();
	function checkEmotes() {
		if (content.match(/pog|pogchamp/gi))	message.react(config.reactions.ids.pogchamp);
		if (content.match(/lul|lol/gi))			message.react(config.reactions.ids.lul);
		if (content.match(/kappa/gi))			message.react(config.reactions.ids.kappa);
		if (content.match(/sleeper/gi))			message.react(config.reactions.ids.sleeper);
	}
};