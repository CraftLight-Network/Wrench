// Get logger
const log = require("./logger").log;

// Define and require modules
const { stripIndents } = require("common-tags");
const embed            = require("../../data/js/util").embed;
const util             = require("../../data/js/util");
const AntiSpam         = require("discord-anti-spam");
const request          = require("async-request");
const Config           = require("./config");

// Format + update bad links
let bad = [];
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Format the bad links file
	bad = await hosts.body
		.replace(/#.*|([0-9]\.){3}[0-9]\s|https?:\/\//gmi, "")
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
	"warnThreshold":        5,
	"kickThreshold":        8,
	"banThreshold":         12,
	"maxInterval":          5000,
	"maxDuplicatesWarning": 5,
	"maxDuplicatesKick":    8,
	"maxDuplicatesBan":     12,
	"errorMessages":        false,
	"warnMessage":          "",
	"kickMessage":          "**{user_tag}** has been kicked for spamming.",
	"banMessage":           "**{user_tag}** has been banned for spamming."
});

antiSpam.on("spamThresholdWarn", (member) => reply(member, { "name": "spam", "code": "spam" }));

module.exports = async (message) => {
	if (!message.guild) return;

	// Make sure there's a message
	const content = message.content;
	if (!content) return;

	// Get the config
	const config = new Config("guild", message.guild.id);
	const guildConfig = await config.get();

	// Blacklisted words
	if (b(guildConfig.automod.modules.spam.enabled)) blacklisted();
	async function blacklisted() {
		if (!util.newIncludes(content, guildConfig.automod.modules.blacklisted.words)) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send blacklisted words", "code": "blacklisted words" });
	}

	// Invite detection
	if (b(guildConfig.automod.modules.invites)) invites();
	async function invites() {
		if (!content.match("discord(app)?.(com|gg)(/invite)?")) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send invite links", "code": "invite" });
	}

	// SPAM SPAM SPAM
	if (b(guildConfig.automod.modules.spam.enabled)) spam();
	async function spam() {
		antiSpam.message(message);

		// Check for unique words
		const c = content.split(" ").map(s => s.trim().replace(/[ ]/g, ""));
		if (c.length / parseInt(guildConfig.automod.modules.spam.threshold, 10) < [...new Set(c)].length) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "spam", "code": "spam" });
	};

	// Bad links
	if (b(guildConfig.automod.modules.badLinks)) badLinks();
	async function badLinks() {
		if (!util.newIncludes(content, bad)) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send bad links", "code": "link" });
	}

	// CAPS threshold
	if (b(guildConfig.automod.modules.caps.enabled)) caps();
	async function caps() {
		const upperCase = content.match(/[\p{Lu}]/gu);
		if (parseInt(guildConfig.automod.modules.caps.threshold.replace(/[^0-9]/, ""), 10) >
		Math.floor(((upperCase ? upperCase.length : 0) / content.replace(/\s/g, "").length) * 100)) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send all caps", "code": "caps" });
	}
};

// Reply function
function reply(message, warning) {
	const embedMessage = {
		"author":  { "name": "Warning" },
		"fields":  [
			[`Do not ${warning.name}!`, stripIndents`
				The server ${message.guild.name} does not want you to ${warning.name} there.
				If this was a mistake, you may edit your message without the ${warning.code}.
			`],
			["Original message:", message]
		],
		"footer":  "Action made by AutoMod"
	};

	if (message.content) {
		embedMessage.message           = message;
		embedMessage.author.picture    = message.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 });
	} else embedMessage.author.picture = message.user.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 });

	message.author.send(embed(embedMessage));
}

// Get rid of '=== "true"'
function b(string) {return string === "true"}
