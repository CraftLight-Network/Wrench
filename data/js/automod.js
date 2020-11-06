// Define and require modules
const { stripIndents } = require("common-tags");
const AntiSpam         = require("discord-anti-spam");
const request          = require("async-request");
const log              = require("./logger").log;
const Config           = require("./config");

// Download and format bad links
let bad = []; createBadLinks();
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Sanitize and format
	bad = await hosts.body
		.replace(/#.*|([0-9]\.){3}[0-9]\s|https?:\/\//gmi, "")
		.trim()
		.split("\n")
		.slice(14)
		.map(file => file.trim().replace(/\s/g, ""))
		.filter(Boolean);

	log.info("Bad links array is ready!");
	hosts = ""; // Clear downloaded file
}

// Discord AntiSpam settings
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

let valid = true;
module.exports = async (message) => {
	if (!message.guild) return;

	const config = new Config("guild", message.guild.id);
	const guildConfig = await config.get();

	// Blacklisted words
	if (b(guildConfig.automod.modules.blacklisted.enabled)) await blacklisted();
	async function blacklisted() {
		if (!message.client.check(message.content,
			new RegExp(message.client.toString(guildConfig.automod.modules.blacklisted.words, "|", "i")))) return;

		reply(message, { "name": "send blacklisted words", "code": "blacklisted words" });
	}

	// Invite detection
	if (valid && guildConfig.automod.modules.invites.enabled) await invites();
	async function invites() {
		if (!message.content.match(/discord(app)?.(com\/invite|gg)/)) return;

		reply(message, { "name": "send invite links", "code": "invite" });
	}

	// SPAM SPAM SPAM
	if (valid && b(guildConfig.automod.modules.spam.enabled)) await spam();
	async function spam() {
		antiSpam.message(message);

		// Check for unique words
		const c = message.content.split(" ").map(s => s.trim().replace(/[ ]/g, ""));
		if (c.length / parseInt(guildConfig.automod.modules.spam.threshold, 10) < [...new Set(c)].length) return;

		reply(message, { "name": "spam", "code": "spam" });
	};

	// Bad links
	if (valid && b(guildConfig.automod.modules.badLinks)) await badLinks();
	async function badLinks() {
		if (!message.content.split(" ").some(c => bad.includes(c))) return;

		// Delete and warn
		reply(message, { "name": "send bad links", "code": "link" });
	}

	// CAPS threshold
	if (valid && b(guildConfig.automod.modules.caps.enabled)) await caps();
	async function caps() {
		const upperCase = message.content.match(/[\p{Lu}]/gu);
		if (parseInt(guildConfig.automod.modules.caps.threshold.replace(/[^0-9]/, ""), 10) >
		Math.floor(((upperCase ? upperCase.length : 0) / message.content.replace(/\s/g, "").length) * 100)) return;

		reply(message, { "name": "send all caps", "code": "caps" });
	}
};

// Reply function
function reply(message, warning) {
	const isMember = !message.author;
	valid = false;

	const embedMessage = {
		"author":  { "name": "Warning" },
		"fields":  [
			[`Do not ${warning.name}!`, stripIndents`
				The server ${isMember ? "" : message.guild.name} does not want you to ${warning.name} there.
				If this was a mistake, you may edit your message without the ${warning.code}.
			`]
		],
		"footer":  "Action made by AutoMod"
	};

	if (!isMember) {
		message.delete();
		embedMessage.fields.push(["Original message:", message]);

		embedMessage.message           = message;
		embedMessage.author.picture    = message.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 });

		return message.author.send(message.client.embed(embedMessage));
	}

	embedMessage.author.picture = message.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 });
	message.send(message.client.embed(embedMessage));
}

// Get rid of '=== "true"'
function b(string) {return string === "true"}