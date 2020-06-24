// Get logger
const { log } = require("./logger");

// Define and require modules
const embed		  = require("../../data/js/util").embed;
const TokenBucket = require("limiter").TokenBucket;
const translator  = require("baidu-translate-api");
const similar	  = require("string-similarity");
const totals	  = require("./enmap").totals;
const config	  = require("../../config");
const language	  = require("franc");

// Translate function
module.exports = async (message, options) => {
	// Define variables
	let translate;
	if (options && options.command && config.translator) {
		translate = options.translation;
		return startTranslate();
	}
	else translate = message.content;
	let exit = false;

	// Check if message is translatable
	if (!config.translator || translate.charAt(0) === config.prefix.commands) return;

	// Message sanitization
	// Members
	if (message.guild !== null) {
		const users = message.guild.roles.get(message.guild.id).members.map(m => m.user.username).join("|");
		translate = translate.replace(new RegExp(users, "gi"), "");
	}

	translate = translate.replace(/http.[^\s]*/gu, "") // Links
		.replace(/<@.*>|@[^\s]+/gu, "")				   // Mentions
		.replace(/<:.*>|:.*:/gu, "")				   // Emojis
		.replace(/[^\p{L}1-9.,!?'"\-+\s]/giu, "")	   // Symbols
		.replace(/`|\s+/gu, " ").trim();			   // Trimming

	// Ignore s p a c e d messages
	if (Math.round(translate.length / 2) === translate.split(" ").length) return;
	if (!translate) return;

	// Detect language
	const detectedLanguage = language.all(translate);
	if (detectedLanguage[0][0] === "eng" || detectedLanguage[0][0] === "und" || detectedLanguage[1][1] < 0.82) return;
	language.all(translate).some(e => {if (e[0] === "eng" && e[1] > 0.635) exit = true;});
	if (exit) return;

	return startTranslate();

	async function startTranslate() {
	// Ratelimiting
		const monthBucket = new TokenBucket("10000000", "month", null);
		if (!monthBucket.tryRemoveTokens(message.content.length)) return;
		const dayBucket = new TokenBucket("322580", "day", null);
		if (!dayBucket.tryRemoveTokens(message.content.length)) return;

		// Define options if undefined
		let input = options;
		if (!input) input = { "from": "auto", "to": "en", "command": false };

		// Translate the message
		translator(translate, { "from": input.from, "to": input.to }).then(translated => {
			if (!input.command && translated.from === "en") return;

			// Make sure translations are not the same
			if (!input.command && similar.compareTwoStrings(translate, translated.trans_result.dst) >= 0.45) return;
			if (translate === `${translated.trans_result.dst}`) return;

			// Log the result
			totals.inc("translations");
			log.translate(`${message.author.tag} | ${translate} -> ${translated.trans_result.dst} (${translated.from}-${translated.to})`);

			const embedMessage = embed({
				"author": {
					"name":	   `${message.author.username} (${translated.from}-${translated.to})`,
					"picture": message.author.displayAvatarURL
				},
				"description": `**${translated.trans_result.dst}**`,
				"footer":	   `Translations from Baidu Translate. (http://cft.li/baiduTL)`
			});
			return message.channel.send(embedMessage);
		}).catch(() => {});
	}
};