// Get logger
const { log } = require("./logger.js");

// Define and require modules
const AntiSpam = require("discord-anti-spam");
const { guildConfig } = require("./enmap.js");
const request = require("async-request");

// Format + update bad links
let badLinks = [];
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Format the bad links file
	badLinks = await hosts.body
		.replace(/#.*|[0-9].[0-9].[0-9].[0-9]\s|^((?!.*\..*).)*$/gmi, "")
		.trim()
		.split("\n")
		.slice(14)
		.map(file => file.trim().replace(/\s/g, ""))
		.filter(Boolean);
	log.info("Bad links array is ready!");
	hosts = "";
}
createBadLinks();

const antiSpam = new AntiSpam({
	"warnThreshold": 5,
	"kickThreshold": 8,
	"banThreshold": 12,
	"maxInterval": 5000,
	"maxDuplicatesWarning": 5,
	"maxDuplicatesKick": 8,
	"maxDuplicatesBan": 12,
	"errorMessages": false,
	"warnMessage": "{@user}, stop spamming! Change your message or slow down.",
	"kickMessage": "**{user_tag}** has been kicked for spamming.",
	"banMessage": "**{user_tag}** has been banned for spamming."
});

module.exports = function (message) {
	if (!(guildConfig.get(message.guild.id, "automod.enabled") || message.guild)) return;

	// Shorter message content
	const content = message.content;

	// Check for spam
	if (guildConfig.get(message.guild.id, "automod.modules.spam")) checkSpam();
	async function checkSpam() {
		// Make sure there's a message
		if (content.split("").size !== 0) antiSpam.message(message);

		// Check for unique words
		const spaceFix = content.split(" ").map(s => s.trim().replace(/[ ]/g, ""));
		if (spaceFix.length / 4 < [...new Set(spaceFix)].length) return;

		// Delete and warn
		await message.delete();
		message.reply("Stop spamming! Change your message or slow down.").then(msg => {msg.delete(3000)});
	}

	// Check for invites
	if (guildConfig.get(message.guild.id, "automod.modules.invites")) checkInvites();
	async function checkInvites() {
		// Make sure there are invites
		if (!new RegExp(".*://discord.gg|.*://discordapp.com/invite").test(content)) return;

		// Delete and warn
		await message.delete();
		message.reply("Do not send invite links!").then(msg => {msg.delete(3000)});
	}

	// Check for bad links
	if (guildConfig.get(message.guild.id, "automod.modules.badLinks")) checkBadLinks();
	async function checkBadLinks() {
		// Make sure there are bad links
		if (!badLinks.some(l => content.split(" ").includes(l)) || content === "") return;

		// Delete and warn
		await message.delete();
		message.reply("Do not send that link!").then(msg => {msg.delete(3000)});
	}

	// Check for caps
	if (guildConfig.get(message.guild.id, "automod.modules.caps")) checkCaps();
	async function checkCaps() {
		// Filter out emotes
		const noEmotes = content.replace(/[\u1000-\uFFFF]+/gu, "");

		// Detect if there are just more than 5 emojis
		if (noEmotes === "" || noEmotes.replace(/[ A-Z]/g, "").length >= noEmotes.replace(/[ a-z]/g, "").length) return;

		// Delete and warn
		await message.delete();
		message.reply("Do not send all caps!").then(msg => {msg.delete(3000)});
	}
};