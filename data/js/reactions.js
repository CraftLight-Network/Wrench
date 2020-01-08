// Define and require modules
const { guildConfig } = require("./enmap.js");
const config = require("../../config.json");
const Enmap = require("enmap");

module.exports.reactions = function reactions(message) {
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
	if (config.reactions && (!message.guild || guildConfig.get(message.guild.id, "misc.reactions.emotes"))) checkEmotes();
	function checkEmotes() {
		if (content.match(/lenny/gi))			message.channel.send("<:lenny1:660202649425018896><:lenny2:660202659524902912>");
		if (content.match(/pog|pogchamp/gi))	message.react("660203799377608704");
		if (content.match(/lul/gi))				message.react("660205635777986571");
		if (content.match(/kappa/gi))			message.react("660205713708154890");
		if (content.match(/sleeper/gi))			message.react("660205776744480789");
	}
};