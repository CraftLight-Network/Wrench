/* eslint eqeqeq: "off" */
// Get logger
const { log } = require("./logger");

// Define and require modules
const embed = require("../../data/js/util").embed;
const configHandler = require("./configHandler");
const { stripIndents } = require("common-tags");
const AntiSpam = require("discord-anti-spam");
const request = require("async-request");

// Format + update bad links
let badLinks = [];
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Format the bad links file
	badLinks = await hosts.body
		.replace(/#.*|[0-9].[0-9].[0-9].[0-9]\s|^((?!.*\..*).)*$|https|http|:\/\//gmi, "")
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
	"warnMessage": "",
	"kickMessage": "**{user_tag}** has been kicked for spamming.",
	"banMessage": "**{user_tag}** has been banned for spamming."
});

antiSpam.on("spamThresholdWarn", (member) => {
	const embedMessage = {
		"author": {
			"name": "Warning",
			"picture": "me"
		},
		"fields": [
			["Do not spam!", stripIndents`
				The server does not want you to spam there.
				Please change your message or slow down.
			`]
		],
		"footer": "Action done by AutoMod"
	};

	member.send(embed(embedMessage, member));
});

module.exports.automod = async (message) => {
	let guildConfig;
	if (message.guild) guildConfig = await configHandler.getConfig(message.guild.id);
	else return;

	if (guildConfig.automod.enabled == false) return;

	// Shorter message content
	const content = message.content;

	// Check for spam
	if (guildConfig.automod.modules.spam == true) checkSpam();
	async function checkSpam() {
		// Make sure there's a message
		if (content.split("").size !== 0) antiSpam.message(message);

		// Check for unique words
		const spaceFix = content.split(" ").map(s => s.trim().replace(/[ ]/g, ""));
		if (spaceFix.length / 4 < [...new Set(spaceFix)].length) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "spam", "code": "spam" });
	}

	// Check for invites
	if (guildConfig.automod.modules.invites == true) checkInvites();
	async function checkInvites() {
		// Make sure there are invites
		if (!content.match("discord.gg|discordapp.com/invite")) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send invite links", "code": "invite" });
	}

	// Check for bad links
	if (guildConfig.automod.modules.badLinks == true) checkBadLinks();
	async function checkBadLinks() {
		// Make sure there are bad links
		if (content === "" || !badLinks.some(l => content.split(" ").includes(l))) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send bad links", "code": "link" });
	}

	// Check for caps
	if (guildConfig.automod.modules.caps == true) checkCaps();
	async function checkCaps() {
		// Filter out emotes
		const noEmotes = content.replace(/[\u1000-\uFFFF]+/gu, "");

		// Detect if there are just more than 5 emojis
		if (noEmotes === "" || noEmotes.replace(/[ A-Z]/g, "").length >= noEmotes.replace(/[ a-z]/g, "").length) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send all caps", "code": "caps" });
	}

	// Reply function
	function reply(message, warning) {
		const embedMessage = {
			"author": {
				"name": "Warning",
				"picture": "me"
			},
			"fields": [
				[`Do not ${warning.name}!`, stripIndents`
					The server ${message.guild.name} does not want you to ${warning.name} there.
					If this was a mistake, you may edit your message without the ${warning.code}.
				`],
				["Original message:", message]
			],
			"footer": "Action made by AutoMod"
		};

		message.author.send(embed(embedMessage, message));
	}
};