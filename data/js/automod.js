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
let badLinks = [];
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Format the bad links file
	badLinks = await hosts.body
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
	const content = message.content;

	// Get the config
	const config = new Config("guild", message.guild.id);
	const guildConfig = await config.get();

	// Check for spam
	if (b(guildConfig.automod.modules.spam.enabled)) {
		// Make sure there's a message
		if (!content) return;
		antiSpam.message(message);

		// Check for unique words
		const c = content.split(" ").map(s => s.trim().replace(/[ ]/g, ""));
		if (c.length / parseInt(guildConfig.automod.modules.spam.threshold) < [...new Set(c)].length) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "spam", "code": "spam" });
	}

	// Check for invites
	if (b(guildConfig.automod.modules.invites)) {
		// Make sure there are invites
		if (!content.match("discord(app)?.(com|gg)(/invite)?")) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send invite links", "code": "invite" });
	}

	// Check for bad links
	if (b(guildConfig.automod.modules.badLinks)) {
		// Make sure there are bad links
		if (!content || !util.newIncludes(content, badLinks)) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send bad links", "code": "link" });
	}

	// Check for caps
	if (b(guildConfig.automod.modules.caps.enabled)) {
		const upperCase = content.match(/[\p{Lu}]/gu);
		if (parseInt(guildConfig.automod.modules.caps.threshold.replace(/[^0-9]/, "")) >
		Math.floor(((upperCase ? upperCase.length : 0) / content.replace(/\s/g, "").length) * 100)) return;

		// Delete and warn
		await message.delete();
		reply(message, { "name": "send all caps", "code": "caps" });
	}
};

// Reply function
function reply(message, warning) {
	const embedMessage = {
		"author":  {
			"name":    "Warning",
			"picture": message.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 })
		},
		"fields":  [
			[`Do not ${warning.name}!`, stripIndents`
				The server ${message.guild.name} does not want you to ${warning.name} there.
				If this was a mistake, you may edit your message without the ${warning.code}.
			`],
			["Original message:", message]
		],
		"footer":  "Action made by AutoMod"
	};

	if (message.content) embedMessage.message = message;

	message.author.send(embed(embedMessage));
}

// Get rid of '=== "true"'
function b(string) {return string === "true"}