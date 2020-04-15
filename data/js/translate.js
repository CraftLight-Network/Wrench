// Get logger
const { log } = require("./logger.js");

// Define and require modules
const TokenBucket = require("limiter").TokenBucket;
const { translations } = require("./enmap.js");
const similar = require("string-similarity");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const language = require("franc");

// Translate function
module.exports = async function translate(message, translator) {
	// Define variables
	let translate = message.content;
	const numbers = [];
	let exit = false;

	// Check if message is translatable
	if (!config.translator.enabled || translate.charAt(0) === config.prefix) return;

	// Message sanitization
	// Members
	if (message.guild !== null) {
		const users = message.guild.roles.get(message.guild.id).members.map(m => m.user.username).join("|");
		translate = translate.replace(new RegExp(users, "gi"), "");
	}

	translate = translate.replace(/http.[^\s]*/gu, "")		// Links
		.replace(/<@.*>|@[^\s]+/gu, "")						// Mentions
		.replace(/<:.*>|:.*:/gu, "")						// Emojis
		.replace(/[^\p{L}1-9.,!?'"\-+\s]/giu, "")			// Symbols
		.replace(/`|\s+/gu, " ").trim();					// Trimming

	// Ignore s p a c e d messages
	if (Math.round(translate.length / 2) === translate.split(" ").length) return;
	if (!translate) return;

	// Detect language
	if (language(translate) === "eng" || language(translate) === "und") return;
	language.all(translate).some(e => {if (e[0] === "eng" && e[1] > 0.65) exit = true;});
	if (exit) return;

	// Ratelimiting
	const monthBucket = new TokenBucket("10000000", "month", null);
	if (!monthBucket.tryRemoveTokens(message.content.length)) return;
	const dayBucket = new TokenBucket("322580", "day", null);
	if (!dayBucket.tryRemoveTokens(message.content.length)) return;

	// Translate the message
	switch (config.translator.provider) {
		case "yandex":
			translator.translate(translate, { "to": "en" }, (err, translated) => {
				const options = {
					"text": translated.text,
					"lang": {
						"from": translated.lang,
						"to": ""
					},
					"link": "yandexTL",
					"provider": "Yandex Translate"
				};

				translateEmbed(options);
			}).catch();
			break;

		case "google":
			translator.translate(translate, "en", (err, translated) => {
				const options = {
					"text": translated.translatedText,
					"lang": {
						"from": translated.detectedSourceLanguage,
						"to": "-en"
					},
					"link": "googleTL",
					"provider": "Google Translate"
				};

				translateEmbed(options);
			}).catch();
			break;

		case "baidu":
			translator(translate).then(translated => {
				if (translated.from === "en") return;

				const options = {
					"text": translated.trans_result.dst,
					"lang": {
						"from": translated.from,
						"to": "-en"
					},
					"link": "baiduTL",
					"provider": "Baidu Translate"
				};

				translateEmbed(options);
			}).catch(function() {});
			break;
	}

	function translateEmbed(options) {
		// Make sure translations are not the same
		if (similar.compareTwoStrings(translate, options.text) >= 0.75) return;
		if (translate === `${options.text}`) return;

		// Log the result
		translations.inc("number");
		log.translate(`${message.author.tag}: ${translate} -> ${options.text} (${options.lang.from}${options.lang.to})`);

		const embed = new RichEmbed()
			.setAuthor(`${message.author.username} (${options.lang.from}${options.lang.to})`, message.author.displayAvatarURL)
			.setDescription(`**${options.text}**`)
			.setFooter(`Translations from ${options.provider}. (http://cft.li/${options.link})`)
			.setColor("#E3E3E3");

		return message.channel.send(embed);
	}
};